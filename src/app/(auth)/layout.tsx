export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="mx-auto flex w-full flex-1 flex-col justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-sm space-y-6">{children}</div>
    </main>
  )
}
