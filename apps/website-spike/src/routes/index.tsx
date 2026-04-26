import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-50 font-mono">
      <div className="text-center space-y-2">
        <h1 className="text-2xl">website-spike</h1>
        <p className="text-sm text-neutral-400">tanstack-start + vite-plus R1</p>
      </div>
    </main>
  )
}
