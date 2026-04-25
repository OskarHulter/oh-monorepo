import type { DestinationStream } from 'pino'
import { pino } from 'pino'

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export interface LogEntry {
  level: LogLevel
  message: string
  context?: Record<string, unknown>
}

export interface LogHandlerOptions {
  level?: LogLevel
  destination?: DestinationStream
}

export type LogHandler = (entry: LogEntry) => void

export function createLogHandler(options: LogHandlerOptions = {}): LogHandler {
  const logger = pino({ level: options.level ?? 'info' }, options.destination)
  return ({ level, message, context }) => {
    logger[level](context ?? {}, message)
  }
}
