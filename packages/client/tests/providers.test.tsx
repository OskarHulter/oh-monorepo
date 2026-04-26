import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vite-plus/test'

import { Providers, usePorts, type Ports } from '../src/index.ts'

const fixturePorts: Ports = {
  telemetry: {
    event: () => undefined,
    error: () => undefined,
    span: async (_name, fn) => fn(),
  },
  router: {
    push: () => undefined,
    useParams: <T extends Record<string, string>>() => ({}) as T,
    Link: ({ children }) => <>{children}</>,
  },
  theme: {
    mode: 'system',
    toggle: () => undefined,
  },
  data: {},
}

test('usePorts() returns the wired ports when called inside <Providers>', () => {
  let captured: Ports | undefined

  function Probe() {
    captured = usePorts()
    return null
  }

  renderToStaticMarkup(
    <Providers ports={fixturePorts}>
      <Probe />
    </Providers>,
  )

  expect(captured).toBe(fixturePorts)
})

test('usePorts() throws when called outside <Providers>', () => {
  function Probe() {
    usePorts()
    return null
  }

  expect(() => renderToStaticMarkup(<Probe />)).toThrow(/outside <Providers>/)
})
