import { execSync } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';

process.env.NODE_ENV = 'test';

dotenv.config({ path: '.env.test' });

// Resolve the final DATABASE_URL to use
let testDatabaseUrl = process.env.DATABASE_URL || '';
// Fallback: try reading from .env.test directly if no env var is set
if (!testDatabaseUrl) {
  try {
    if (fs.existsSync('.env.test')) {
      const parsed = dotenv.parse(fs.readFileSync('.env.test'));
      if (parsed.DATABASE_URL) testDatabaseUrl = parsed.DATABASE_URL;
    }
  } catch (err) {
    console.warn('Could not read .env.test directly:', err);
  }
}

console.log('Jest global setup: running prisma migrate reset for test DB');
try {
  // Reset the database (destructive) to a clean state for E2E tests
  execSync('npx prisma migrate reset --force', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
  });
} catch (err) {
  console.error('Prisma migrate reset failed:', err);
  throw err;
}

// Optionally run prisma generate
try {
  execSync('npx prisma generate', { stdio: 'inherit', env: { ...process.env, DATABASE_URL: testDatabaseUrl } });
} catch (err) {
  console.warn('Prisma generate failed (continuing):', err);
}

export default async function globalSetup() {
  // jest requires export; all setup done above
}
