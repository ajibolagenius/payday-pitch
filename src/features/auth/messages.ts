// Auth copy, one place. Lives outside actions.ts because a "use server"
// module may only export async functions (design.md voice: state what failed
// and what to try, no joke in an error).
export const VAGUE_CREDENTIALS_ERROR =
  "We couldn't sign you in with those details. Check the email and password and try again."
export const CONFIRM_FIRST_MESSAGE =
  "Confirm your email first. We can send the link again."
export const THROTTLED_MESSAGE = "Wait a minute and try again."
export const UNAVAILABLE_MESSAGE =
  "We could not reach the server just now. Try again."
export const SENT_ANYWAY_MESSAGE =
  "If that email needs it, a link is on its way."
export const RECOVER_SENT_MESSAGE =
  "If that email has an account, a link is on its way. Check your inbox."
export const EXPIRED_LINK_MESSAGE =
  "That link is invalid or has expired. Sign in again, or request a new link."
export const SIGNED_OUT_MESSAGE = "You were signed out. Sign in again."
