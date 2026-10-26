import Link from "next/link"

import { SignInForm } from "@/components/auth/sign-in-form"
import { BrandMark, Wordmark } from "@/components/brand"

import { EXPIRED_LINK_MESSAGE } from "@/features/auth/messages"

export default async function SignInPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await props.searchParams
  const reason = typeof params.reason === "string" ? params.reason : undefined
  const next = typeof params.next === "string" ? params.next : undefined

  return (
    <>
      <Link
        href="/"
        className="text-muted-foreground mx-auto flex w-fit items-center gap-2 text-sm underline underline-offset-4"
      >
        <BrandMark tier="reduced" chip="auto" className="size-7" />
        <Wordmark />
      </Link>
      {reason === "expired" ? (
        <p
          role="status"
          className="bg-card mx-auto w-full max-w-sm rounded-lg border p-3 text-center text-sm"
        >
          {EXPIRED_LINK_MESSAGE}
        </p>
      ) : null}
      <SignInForm next={next} />
    </>
  )
}
