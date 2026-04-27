import type { SocialLink } from '@oh/shared'

export interface SocialLinksPort {
  list(): Promise<SocialLink[]>
}
