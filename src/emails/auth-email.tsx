import {
  Html,
  Body,
  Container,
  Heading,
  Text,
  Link,
} from "@react-email/components"

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
  ink: string
  card: string
  paper: string
  muted: string
  onPitch: string
}

export function AuthEmail(props: EmailProps) {
  const { heading, body, cta, href, pitch, ink, card, paper, muted, onPitch } =
    props
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
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: pitch,
                marginBottom: "20px",
              }}
            />
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
        </Container>
      </Body>
    </Html>
  )
}
