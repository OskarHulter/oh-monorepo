import type { Ports } from '@oh/client'

import { router } from './router.tsx'
import { telemetry } from './telemetry.ts'
import { theme } from './theme.ts'

export const ports: Ports = {
  telemetry,
  router,
  theme,
  data: {},
}
