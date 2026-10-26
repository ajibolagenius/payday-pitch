import {
  Html,
  Body,
  Container,
  Heading,
  Text,
  Link,
} from "@react-email/components"

import { EmailLockup, EmailMark } from "@/emails/brand-art"

// Supabase substitutes these at send time; the renderer must never touch them.
// GoTrue fills ConfirmationURL for both link types (confirm and recovery).
// RecoveryURL, RedirectURL and ConfirmationToken come back empty in the local
// auth service, so the recovery email uses this same placeholder.
export const VERIFY_URL_PLACEHOLDER = "{{ .ConfirmationURL }}"

export type EmailProps = {
  heading: string
  body: string
  cta: string
  href: string
  pitch: string
  gold: string
  ink: string
  card: string
  paper: string
  muted: string
  onPitch: string
}

export function AuthEmail(props: EmailProps) {
  const {
    heading,
    body,
    cta,
    href,
    pitch,
    gold,
    ink,
    card,
    paper,
    muted,
    onPitch,
  } = props
  return (
    <Html lang="en">
      <Body
        style={{
          margin: 0,
          padding: "24px 0",
          backgroundColor: paper,
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <Container style={{ maxWidth: "480px", margin: "0 auto" }}>
          <div
            style={{
              backgroundColor: card,
              borderRadius: "12px",
              padding: "32px 28px",
              border: `1px solid ${muted}`,
            }}
          >
            <EmailLockup
              width={180}
              colors={{ chip: pitch, dots: gold, keeper: card, word: ink }}
            />
            <div style={{ height: "20px" }} />
            <Heading
              style={{
                margin: "0 0 12px",
                fontSize: "22px",
                lineHeight: 1.3,
                color: ink,
              }}
            >
              {heading}
            </Heading>
            <Text
              style={{
                margin: "0 0 24px",
                fontSize: "15px",
                lineHeight: 1.6,
                color: ink,
              }}
            >
              {body}
            </Text>
            <Link
              href={href}
              style={{
                display: "inline-block",
                backgroundColor: pitch,
                color: onPitch,
                textDecoration: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: 700,
              }}
            >
              {cta}
            </Link>
            <Text
              style={{
                margin: "24px 0 0",
                fontSize: "12px",
                lineHeight: 1.6,
                color: muted,
              }}
            >
              If the button doesn&apos;t work, copy this address into your
              browser: <span style={{ wordBreak: "break-all" }}>{href}</span>
            </Text>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "20px",
              padding: "0 4px",
            }}
          >
            <EmailMark
              size={28}
              colors={{ chip: pitch, dots: gold, keeper: card }}
            />
            <Text style={{ margin: 0, fontSize: "12px", color: muted }}>
              Payday Pitch. Line up your pay, payday by payday.
            </Text>
          </div>
        </Container>
      </Body>
    </Html>
  )
}
