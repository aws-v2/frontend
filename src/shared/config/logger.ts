import { getRemoteConfig } from './remoteConfig';

type ServiceEnv = 'dev' | 'staging' | 'prod';

function getEnv(): ServiceEnv {
  return (getRemoteConfig()?.VITE_APP_PROFILE ?? 'dev') as ServiceEnv;
}





type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const env = getEnv();

/**
 * Log level priority (higher = more severe)
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

/**
 * Minimum allowed log level per environment
 */
const ENV_LOG_LEVEL: Record<ServiceEnv, LogLevel> = {
  dev: 'debug',
  staging: 'info',
  prod: 'warn',
};

interface LogContext {
  scope?: string;      // auth, streaming, payments
  page?: string;       // route name
  subdomain?: string;  // api.example.com, app.example.com
}

class Logger {
  constructor(private context: LogContext = {}) {}

  child(context: LogContext) {
    return new Logger({ ...this.context, ...context });
  }

  private shouldLog(level: LogLevel): boolean {
    const envLevel = ENV_LOG_LEVEL[env];
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[envLevel];
  }

  private log(level: LogLevel, message: string, data?: any) {
    if (!this.shouldLog(level)) return;

    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      env,
      ...this.context,
      data,
    };

    console[level](logEntry);

    // future: send to backend / Sentry / Loki
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }
}

export const baseLogger = new Logger();