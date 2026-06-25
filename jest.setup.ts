import dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

const envPath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
const result = dotenv.config({ path: envPath });

if (process.env.NODE_ENV === 'test' && result.error) {
  dotenv.config();
}
