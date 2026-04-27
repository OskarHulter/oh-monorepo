import type { TelemetryPort } from '@oh/client'

export const telemetry: TelemetryPort = {
  event(name, attrs) {
    console.debug('[telemetry:event]', name, attrs)
  },
  error(err, attrs) {
    console.error('[telemetry:error]', err, attrs)
  },
  async span(_name, fn) {
    return fn()
  },
}
