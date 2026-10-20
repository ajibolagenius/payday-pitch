#!/usr/bin/env bash
# PreToolUse(Bash): deny any git push that would update main (golden rule 2 in AGENTS.md).
cmd=$(jq -r '.tool_input.command // ""')

deny() {
  jq -n --arg r "$1" '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: $r}}'
  exit 0
}

reason="Golden rule 2: nothing reaches main except through a PR. Push a feature branch (feat/<slug>, fix/<slug>, chore/<slug>) and open a PR instead."

# Inspect each git push segment of a compound command on its own.
while IFS= read -r seg; do
  [[ $seg =~ git[[:space:]]+push ]] || continue
  # Explicit refspec to main: "main", "HEAD:main", "x:refs/heads/main", "+main".
  [[ $seg =~ (^|[[:space:]:+])(refs/heads/)?main([[:space:]]|$) ]] && deny "$reason"
  # Bare push (only flags and a remote) while main is checked out.
  args=$(sed -E 's/.*git[[:space:]]+push//' <<<"$seg" | tr ' ' '\n' | grep -v '^-' | grep -v '^$' | wc -l)
  if (( args <= 1 )) && [[ $(git branch --show-current 2>/dev/null) == main ]]; then
    deny "$reason (A bare push from main would push main.)"
  fi
done < <(sed -E 's/(&&|\|\||;|\|)/\n/g' <<<"$cmd")
exit 0
