"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = globalTeardown;
const dotenv_1 = __importDefault(require("dotenv"));
process.env.NODE_ENV = 'test';
dotenv_1.default.config({ path: '.env.test' });
async function globalTeardown() {
    try {
        // Optionally clean up test artifacts or disconnect clients
        // For now, nothing to teardown explicitly
        console.log('Jest global teardown complete');
    }
    catch (err) {
        console.error('Global teardown failed', err);
    }
}
