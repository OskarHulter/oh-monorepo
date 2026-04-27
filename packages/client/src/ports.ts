import type { ComponentType, ReactNode } from 'react'

import type { SocialLinksPort } from './ui/features/social-links/port.ts'

/**
 * Cross-cutting port types for `@oh/client`.
 *
 * Per RFC oh-monorepo-6mn: port interfaces live here as TYPES ONLY (no runtime).
 * Concrete adapters live in the consumer (e.g. `apps/website/src/adapters/*`)
 * and the fixture adapter at `@oh/client/adapters/fixture` ships with the lib
 * for tests + react-cosmos.
 */

export interface TelemetryPort {
  event(name: string, attrs?: Record<string, unknown>): void
  error(err: unknown, attrs?: Record<string, unknown>): void
  span<T>(name: string, fn: () => Promise<T>): Promise<T>
}

export interface RouterPort {
  push(to: string): void
  /**
   * Read route params. Each key may be missing (e.g. on routes without that
   * segment), so the value type is `string | undefined`. Callers should
   * narrow with `if (params.id)` before using.
   */
  useParams<T extends Record<string, string | undefined>>(): T
  Link: ComponentType<{
    to: string
    children: ReactNode
    className?: string
    'aria-label'?: string
  }>
}

export interface ThemePort {
  mode: 'light' | 'dark' | 'system'
  toggle(): void
}

export interface DataPort {
  socialLinks: SocialLinksPort
}

export interface Ports {
  telemetry: TelemetryPort
  router: RouterPort
  theme: ThemePort
  data: DataPort
}
