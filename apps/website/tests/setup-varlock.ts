import { initVarlockEnv } from 'varlock/env'

// varlockVitePlugin populates process.env.__VARLOCK_ENV at vite startup but
// only injects the runtime initVarlockEnv() call into SSR entry modules
// (see @varlock/vite-integration transform hook). Vitest's node-side module
// collection runs before any test entry, and isn't an SSR entry — so the
// ENV proxy in varlock/env throws on first access. Calling init here, before
// the test file imports anything that touches ENV, primes the proxy from
// the inherited __VARLOCK_ENV. In browser mode, process is absent and the
// vite plugin already replaces ENV.X tokens at transform time, so this is
// a no-op.
if (typeof process !== 'undefined' && typeof process.env?.__VARLOCK_ENV === 'string') {
  initVarlockEnv()
}
