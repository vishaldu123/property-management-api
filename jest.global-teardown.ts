import dotenv from 'dotenv';
import { execSync } from 'child_process';

process.env.NODE_ENV = 'test';
dotenv.config({ path: '.env.test' });

export default async function globalTeardown() {
  try {
    // Optionally clean up test artifacts or disconnect clients
    // For now, nothing to teardown explicitly
    console.log('Jest global teardown complete');
  } catch (err) {
    console.error('Global teardown failed', err);
  }
}
