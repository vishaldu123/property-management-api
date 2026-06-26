"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerMiddleware = exports.LoggerService = void 0;
var logger_service_1 = require("./logger.service");
Object.defineProperty(exports, "LoggerService", { enumerable: true, get: function () { return logger_service_1.LoggerService; } });
Object.defineProperty(exports, "loggerMiddleware", { enumerable: true, get: function () { return logger_service_1.loggerMiddleware; } });
