export type LogContext = Record<string, unknown>

function write(level: 'debug' | 'info' | 'warn' | 'error', event: string, context: LogContext = {}) {
  const entry = JSON.stringify({ level, event, ...context, timestamp: new Date().toISOString() })
  if (level === 'error') console.error(entry)
  else if (level === 'warn') console.warn(entry)
  else console.log(entry)
}

export const logger = {
  debug: (event: string, context?: LogContext) => write('debug', event, context),
  info: (event: string, context?: LogContext) => write('info', event, context),
  warn: (event: string, context?: LogContext) => write('warn', event, context),
  error: (event: string, context?: LogContext) => write('error', event, context),
}
