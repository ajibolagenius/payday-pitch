import {
  AuthEmail,
  VERIFY_URL_PLACEHOLDER,
  type EmailProps,
} from "@/emails/auth-email"

export function ConfirmationEmail(
  props: Omit<EmailProps, "href" | "heading" | "body" | "cta">,
) {
  return (
    <AuthEmail
      {...props}
      heading="One step left: confirm your email"
      body="You created a Payday Pitch account. Confirm this address and your squad is ready: line up your pay, payday by payday."
      cta="Confirm your email"
      href={VERIFY_URL_PLACEHOLDER}
    />
  )
}
