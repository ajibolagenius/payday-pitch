import {
  AuthEmail,
  VERIFY_URL_PLACEHOLDER,
  type EmailProps,
} from "@/emails/auth-email"

export function RecoveryEmail(
  props: Omit<EmailProps, "href" | "heading" | "body" | "cta">,
) {
  return (
    <AuthEmail
      {...props}
      heading="Reset your password"
      body="We got a request to reset your Payday Pitch password. Open the link below to choose a new one. If this was not you, you can ignore this email."
      cta="Choose a new password"
      href={VERIFY_URL_PLACEHOLDER}
    />
  )
}
