import type { ReactNode } from 'react'

import type { Ports } from '../../ports.ts'

export interface FixtureSeed {
  theme?: 'light' | 'dark' | 'system'
}

export function createFixturePorts(seed: FixtureSeed = {}): Ports {
  return {
    telemetry: {
      event: () => undefined,
      error: () => undefined,
      span: async (_name, fn) => fn(),
    },
    router: {
      push: () => undefined,
      useParams: <T extends Record<string, string | undefined>>() => ({}) as T,
      Link: ({ children }: { children: ReactNode }) => <>{children}</>,
    },
    theme: {
      mode: seed.theme ?? 'system',
      toggle: () => undefined,
    },
    data: {},
  }
}
