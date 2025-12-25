const pino = require('pino');

const level = process.env.LOG_LEVEL || 'info';

const baseLogger = pino({
  level,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
});

const createLogger = (scope = 'app') => {
  const logger = baseLogger.child({ scope });
  return {
    trace: (msg, meta) => logger.trace(meta || {}, msg),
    debug: (msg, meta) => logger.debug(meta || {}, msg),
    info: (msg, meta) => logger.info(meta || {}, msg),
    warn: (msg, meta) => logger.warn(meta || {}, msg),
    error: (msg, meta) => logger.error(meta || {}, msg),
    child: (meta) => logger.child(meta),
  };
};

module.exports = {
  createLogger,
  default: createLogger,
};
