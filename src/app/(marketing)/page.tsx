import { BrandMark, Wordmark } from "@/components/brand"

// Placeholder landing page; the real one is feature 16.
export default function Home() {
  return (
    <main className="mx-auto flex max-w-xl flex-1 flex-col justify-center gap-4 px-4 py-16">
      <div className="flex items-center gap-3">
        <BrandMark tier="primary" chip="auto" className="size-12" />
        <h1 className="text-4xl">
          <Wordmark />
        </h1>
      </div>
      <p className="text-lg">
        Build wealth from your salary, payday by payday. Line it up like a
        football team: bills covered, debts cleared, the rest working for you.
        Coming soon.
      </p>
    </main>
  )
}
