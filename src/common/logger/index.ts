import { configure, getLogger, Logger } from 'log4js';
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

configure({
  appenders: {
    stdout: {
      type: 'stdout',
      layout: {
        type: 'pattern',
        pattern: '[%d{ISO8601_WITH_TZ_OFFSET}] %p %c %f:%l  %m',
      },
    },
  },
  categories: { default: { appenders: ['stdout'], level: 'ALL' } },
});

export const logger: Logger = getLogger('default');
