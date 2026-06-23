# CI/CD Setup Guide

## Overview

The Property Management API uses GitHub Actions for continuous integration and deployment. The pipeline includes:

- **Linting**: TypeScript type checking
- **Testing**: Jest unit tests with coverage reports
- **Build**: TypeScript compilation
- **Deploy**: Optional deployment to Docker, AWS ECS, or Heroku

## Pipeline Stages

### 1. Lint & Test (Runs on every push and PR)

- Tests on Node.js 18.x and 20.x
- PostgreSQL test database included
- Runs linting and unit tests
- Generates coverage reports

### 2. Deploy (Runs on main branch after successful tests)

Only triggered after lint-and-test passes and on main branch pushes.

## Environment Setup

### GitHub Secrets

Configure these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

#### For Docker Registry Deployment:
```
DOCKER_USERNAME      # Your Docker Hub username
DOCKER_PASSWORD      # Your Docker Hub token/password
```

#### For AWS ECS Deployment:
```
AWS_ACCESS_KEY_ID       # AWS IAM user access key
AWS_SECRET_ACCESS_KEY   # AWS IAM user secret key
AWS_REGION              # e.g., us-east-1
```

#### For Heroku Deployment:
```
HEROKU_API_KEY    # Your Heroku API key
HEROKU_EMAIL      # Your Heroku account email
```

## Deployment Options

### Option 1: Docker Deployment

1. Uncomment Docker sections in `.github/workflows/ci.yml`
2. Update image name and registry
3. Set `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets

```bash
# Local testing
docker build -t property-management-api:latest .
docker run -p 5000:5000 \
  -e DATABASE_URL="postgresql://..." \
  -e RAZORPAY_KEY_ID="..." \
  -e RAZORPAY_KEY_SECRET="..." \
  property-management-api:latest
```

### Option 2: AWS ECS Deployment

1. Create ECS cluster and service
2. Update cluster/service names in workflow
3. Set AWS secrets

### Option 3: Heroku Deployment

1. Uncomment Heroku section in workflow
2. Create Heroku app: `heroku create property-management-api`
3. Set `HEROKU_API_KEY` and `HEROKU_EMAIL` secrets

## Local Testing

### Run Tests
```bash
npm test              # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # With coverage report
```

### Run Linting
```bash
npm run lint
```

### Build
```bash
npm run build
```

### Development
```bash
npm run dev  # Runs with hot reload
```

## Test Coverage

- Minimum coverage threshold: 50%
- Coverage reports uploaded to Codecov (set `CODECOV_TOKEN` secret for public coverage badges)

## Troubleshooting

### Tests fail locally but pass in CI

- Ensure PostgreSQL is running locally
- Check `DATABASE_URL` environment variable
- Run `npx prisma migrate dev` to sync schema

### Docker build fails

- Clear node_modules: `rm -rf node_modules && npm install`
- Ensure Dockerfile WORKDIR and paths are correct
- Check `.dockerignore` doesn't exclude essential files

### Deployment hangs

- Check runner logs in GitHub Actions
- Verify secrets are set correctly (don't log secret values!)
- Ensure deployment target (ECS, Heroku) is configured

## Next Steps

1. Push code to GitHub: `git push origin main`
2. GitHub Actions will automatically trigger
3. View pipeline status in `Actions` tab
4. Configure deployment secrets for your chosen platform
5. Uncomment deployment sections in workflow once secrets are set
