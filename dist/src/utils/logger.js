"use strict";
/**
 * Structured Logger Utility
 * Production-ready logging with structured output
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    minLevel;
    constructor(minLevel = LogLevel.INFO) {
        this.minLevel = minLevel;
    }
    shouldLog(level) {
        const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
        return levels.indexOf(level) >= levels.indexOf(this.minLevel);
    }
    formatLog(context) {
        const { timestamp, level, message, data, error } = context;
        const logObject = {
            timestamp,
            level,
            message,
            ...(data && { data }),
            ...(error && { error }),
        };
        return JSON.stringify(logObject);
    }
    log(level, message, data, error) {
        if (!this.shouldLog(level))
            return;
        const context = {
            timestamp: new Date().toISOString(),
            level,
            message,
            ...(data && { data }),
            ...(error && {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                },
            }),
        };
        const formattedLog = this.formatLog(context);
        // eslint-disable-next-line no-console
        switch (level) {
            case LogLevel.ERROR:
                console.error(formattedLog);
                break;
            case LogLevel.WARN:
                console.warn(formattedLog);
                break;
            default:
                console.log(formattedLog);
        }
    }
    debug(message, data) {
        this.log(LogLevel.DEBUG, message, data);
    }
    info(message, data) {
        this.log(LogLevel.INFO, message, data);
    }
    warn(message, data) {
        this.log(LogLevel.WARN, message, data);
    }
    error(message, error, data) {
        this.log(LogLevel.ERROR, message, data, error);
    }
}
// Export singleton logger
const logger = new Logger(process.env.LOG_LEVEL ? (LogLevel[process.env.LOG_LEVEL] || LogLevel.INFO) : LogLevel.INFO);
exports.default = logger;
