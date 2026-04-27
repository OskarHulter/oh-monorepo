import { Providers } from '@oh/client'
import { Hero, SocialLinks } from '@oh/client/ui'

import { ports } from './adapters/index.ts'
import { siteConfig } from './site.config.ts'

function Landing() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-50 font-mono">
      <div className="space-y-8">
        <Hero name={siteConfig.name} tagline={siteConfig.description} />
        <SocialLinks />
      </div>
    </main>
  )
}

export function App() {
  return (
    <Providers ports={ports}>
      <Landing />
    </Providers>
  )
}
