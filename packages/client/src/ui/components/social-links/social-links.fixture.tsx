import { Providers } from '../../../providers.tsx'
import { createSocialLinksFixture } from '../../features/social-links/fixture.ts'
import { SocialLinks } from './social-links.tsx'

export default (
  <Providers
    ports={{
      telemetry: {
        event: () => undefined,
        error: () => undefined,
        span: async (_n, fn) => fn(),
      },
      router: {
        push: () => undefined,
        useParams: <T extends Record<string, string | undefined>>() => ({}) as T,
        Link: ({ children }) => <>{children}</>,
      },
      theme: { mode: 'system', toggle: () => undefined },
      data: { socialLinks: createSocialLinksFixture() },
    }}
  >
    <SocialLinks />
  </Providers>
)
