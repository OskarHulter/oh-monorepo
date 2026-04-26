import type { ComponentType, ReactNode } from 'react'

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
  useParams<T extends Record<string, string>>(): T
  Link: ComponentType<{ to: string; children: ReactNode }>
}

export interface ThemePort {
  mode: 'light' | 'dark' | 'system'
  toggle(): void
}

/**
 * Feature data ports compose into this umbrella interface as features land.
 * Slice oh-monorepo-559 adds `socialLinks: SocialLinksPort` here.
 *
 * Intentionally empty in v1 — feature ports register via interface augmentation
 * (see slice 559) or by extending this interface in their feature folder.
 */
// oxlint-disable-next-line typescript-eslint/no-empty-object-type
export interface DataPort {}

export interface Ports {
  telemetry: TelemetryPort
  router: RouterPort
  theme: ThemePort
  data: DataPort
}
