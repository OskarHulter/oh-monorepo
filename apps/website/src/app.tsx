import { siteConfig } from './site.config.ts'

export function App() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-50 font-mono">
      <div className="text-center space-y-2">
        <h1 className="text-2xl">{siteConfig.name}</h1>
        {siteConfig.description ? (
          <p className="text-sm text-neutral-400">{siteConfig.description}</p>
        ) : null}
      </div>
    </main>
  )
}
