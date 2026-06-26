"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = globalSetup;
const child_process_1 = require("child_process");
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
process.env.NODE_ENV = 'test';
dotenv_1.default.config({ path: '.env.test' });
// Resolve the final DATABASE_URL to use
let testDatabaseUrl = process.env.DATABASE_URL || '';
// Fallback: try reading from .env.test directly if no env var is set
if (!testDatabaseUrl) {
    try {
        if (fs_1.default.existsSync('.env.test')) {
            const parsed = dotenv_1.default.parse(fs_1.default.readFileSync('.env.test'));
            if (parsed.DATABASE_URL)
                testDatabaseUrl = parsed.DATABASE_URL;
        }
    }
    catch (err) {
        console.warn('Could not read .env.test directly:', err);
    }
}
console.log('Jest global setup: running prisma migrate reset for test DB');
try {
    // Reset the database (destructive) to a clean state for E2E tests
    (0, child_process_1.execSync)('npx prisma migrate reset --force', {
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    });
}
catch (err) {
    console.error('Prisma migrate reset failed:', err);
    throw err;
}
// Optionally run prisma generate
try {
    (0, child_process_1.execSync)('npx prisma generate', { stdio: 'inherit', env: { ...process.env, DATABASE_URL: testDatabaseUrl } });
}
catch (err) {
    console.warn('Prisma generate failed (continuing):', err);
}
async function globalSetup() {
    // jest requires export; all setup done above
}
