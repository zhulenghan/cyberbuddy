/**
 * Logging utility
 */

import { CONFIG } from '../../constants/config'

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const LOG_LEVEL_MAP: Record<string, LogLevel> = {
  debug: LogLevel.DEBUG,
  info: LogLevel.INFO,
  warn: LogLevel.WARN,
  error: LogLevel.ERROR,
}

class Logger {
  private level: LogLevel
  private prefix: string

  constructor(prefix: string = 'CyberBuddy') {
    this.prefix = prefix
    this.level = LOG_LEVEL_MAP[CONFIG.LOG_LEVEL] || LogLevel.INFO
  }

  private sanitize(data: any): any {
    if (!data || typeof data !== 'object') return data

    const sensitive = ['token', 'password', 'accessToken', 'refreshToken', 'email']
    const sanitized = { ...data }

    for (const key of sensitive) {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]'
      }
    }

    return sanitized
  }

  private log(level: LogLevel, message: string, data?: any) {
    if (level < this.level) return

    const timestamp = new Date().toISOString()
    const levelName = LogLevel[level]
    const sanitizedData = this.sanitize(data)

    const logMessage = `[${timestamp}] [${this.prefix}] [${levelName}] ${message}`

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, sanitizedData)
        break
      case LogLevel.INFO:
        console.info(logMessage, sanitizedData)
        break
      case LogLevel.WARN:
        console.warn(logMessage, sanitizedData)
        break
      case LogLevel.ERROR:
        console.error(logMessage, sanitizedData)
        break
    }
  }

  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data)
  }

  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data)
  }

  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data)
  }

  error(message: string, error?: Error | any, data?: any) {
    const errorData = error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
          ...data,
        }
      : { error, ...data }

    this.log(LogLevel.ERROR, message, errorData)
  }
}

export const logger = new Logger()
