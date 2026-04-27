import type { SocialLink } from '@oh/shared'

import type { SocialLinksPort } from './port.ts'

const FIXTURE_LINKS: readonly SocialLink[] = [
  { label: 'GitHub', url: 'https://github.com/OskarHulter' },
  { label: 'X', url: 'https://x.com/oskarhulter' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/oskar-hulter/' },
]

export function createSocialLinksFixture(
  seed: readonly SocialLink[] = FIXTURE_LINKS,
): SocialLinksPort {
  return {
    async list() {
      return [...seed]
    },
  }
}
