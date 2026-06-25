"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
const envPath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
const result = dotenv_1.default.config({ path: envPath });
if (process.env.NODE_ENV === 'test' && result.error) {
    dotenv_1.default.config();
}
