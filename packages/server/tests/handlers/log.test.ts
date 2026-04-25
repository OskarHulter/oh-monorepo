import { Writable } from 'node:stream'

import { expect, test } from 'vite-plus/test'

import { createLogHandler } from '../../src/handlers/log.ts'

function captureStream() {
  const chunks: string[] = []
  const stream = new Writable({
    write(chunk, _enc, cb) {
      chunks.push(chunk.toString())
      cb()
    },
  })
  return { stream, chunks }
}

test('log handler writes structured entry at requested level', () => {
  const { stream, chunks } = captureStream()
  const handle = createLogHandler({ destination: stream, level: 'debug' })

  handle({ level: 'info', message: 'boot', context: { service: 'api' } })

  expect(chunks).toHaveLength(1)
  const entry = JSON.parse(chunks[0]!)
  expect(entry.msg).toBe('boot')
  expect(entry.service).toBe('api')
  expect(entry.level).toBe(30)
})

test('log handler skips entries below configured level', () => {
  const { stream, chunks } = captureStream()
  const handle = createLogHandler({ destination: stream, level: 'warn' })

  handle({ level: 'info', message: 'ignored' })

  expect(chunks).toHaveLength(0)
})
