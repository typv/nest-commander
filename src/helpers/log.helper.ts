import * as winston from 'winston';

const myFormatter = winston.format((info) => {
  const {message} = info;
  if (info.data) {
    info.message = `${message} ${JSON.stringify(info.data)}`;
    delete info.data;
  }

  return info;
})();

export class LogHelper {
  winstonOptions(level: string) {
    const logDir = process.env.LOG_DIR || 'src/tmp/logs';
    const maxLogFiles = process.env.MAX_LOG_FILES || 10;
    return {
      name: `${level}-log`,
      filename: `%DATE%.${level}.log`,
      dirname: `${logDir}/${level}`,
      datePattern: 'YYYY-MM-DD',
      maxFiles: maxLogFiles,
      format: this.logFormat(),
      auditFile: `${logDir}/${level}-audit.json`,
      level: level,
    };
  }

  logFormat() {
    return winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      myFormatter,
      winston.format.simple(),
    )
  }

  consoleLogFormat() {
    return winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf((info) => {
        return `${info.timestamp} [${info.level}]: ${info.message};`;
      })
    )
  }
}