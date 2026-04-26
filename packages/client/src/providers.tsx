import { createContext, useContext, type ReactNode } from 'react'

import type { Ports } from './ports.ts'

const PortsContext = createContext<Ports | null>(null)

export interface ProvidersProps {
  ports: Ports
  children: ReactNode
}

export function Providers({ ports, children }: ProvidersProps) {
  return <PortsContext.Provider value={ports}>{children}</PortsContext.Provider>
}

/**
 * Read the wired Ports from context. Throws if called outside a `<Providers>`
 * — the kernel never silently substitutes a default; consumers always own the
 * adapter wiring.
 */
export function usePorts(): Ports {
  const ports = useContext(PortsContext)
  if (ports === null) {
    throw new Error('usePorts() called outside <Providers>. Wire ports in your app shell.')
  }
  return ports
}
