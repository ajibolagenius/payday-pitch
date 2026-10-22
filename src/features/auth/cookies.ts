// The short-lived httpOnly cookie that carries the signup email to
// /verify-email (spec 0006). Lives apart from actions.ts because that module
// is "use server" and only exports Server Actions.
export const PENDING_SIGNUP_COOKIE = "pending-signup"
