import type { Ports } from '@oh/client'
import { createSocialLinksFixture } from '@oh/client/ui'

import { router } from './router.tsx'
import { telemetry } from './telemetry.ts'
import { theme } from './theme.ts'

export const ports: Ports = {
  telemetry,
  router,
  theme,
  data: {
    socialLinks: createSocialLinksFixture(),
  },
}
