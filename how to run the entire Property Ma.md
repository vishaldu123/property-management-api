Here's how to run the entire Property Management SaaS project:

🚀 Running the Project
1. Prerequisites
Ensure you have installed:

Node.js v18+
PostgreSQL (running on localhost:5432)
Git
2. Setup Environment
# Navigate to backend directory
cd d:\property\property-management-api

# Install dependencies
npm install


3. Configure Database
Create .env file at project root:

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/property_management

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=8h
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRY=7d

# Application
NODE_ENV=development
PORT=5000
API_VERSION=v1

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

4. Database Setup
# Run Prisma migrations
npx prisma migrate deploy

# Generate Prisma client
npm run generate

5. Start the Backend
Development mode (with auto-reload):
npm run dev

Production mode:
npm run build
npm start

✅ Expected output:
Server running on port 5000

6. Start the Frontend (if needed)

# Open new terminal
cd d:\property\property-management-api\frontend

# Install dependencies
npm install

# Start dev server
npm run dev

Frontend runs on http://localhost:5173

🧪 Testing & Verification
Run full test suite:
npm run test -- --forceExit

Run tests in watch mode:
npm run test:watch

Generate coverage report:
npm run test:coverage

Build TypeScript:
npm run build

# Check lint errors
npm run lint

📋 Available npm Scripts
Command	Purpose
npm run dev	Start development server with auto-reload
npm run build	Compile TypeScript to JavaScript
npm run start	Run production build
npm run test	Run all tests once
npm run test:watch	Run tests in watch mode
npm run test:coverage	Generate test coverage report
npm run lint	Check TypeScript errors
npm run generate	Generate Prisma client
🔌 Access Points
Once running, you can access:

API Health: http://localhost:5000/
API Base: http://localhost:5000/api/v1
OpenAPI/Swagger: http://localhost:5000/api/v1/docs
Frontend: http://localhost:5173
📝 Quick API Test
Register a user:

curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Admin",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "organizationName": "My Company"
  }'

Status: ✅ 194 tests passing | All domains working | Sprint 7 (Tenant) complete