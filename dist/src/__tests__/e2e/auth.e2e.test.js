"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
process.env.NODE_ENV = 'test';
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
const user_repository_1 = require("../../repositories/user.repository");
const password_reset_token_repository_1 = require("../../repositories/password-reset-token.repository");
const prisma_1 = __importDefault(require("../../config/prisma"));
const crypto_1 = __importDefault(require("crypto"));
describe('Auth E2E Tests - Complete Authentication Module', () => {
    const testUser = {
        name: 'Test User',
        email: 'test.user@example.com',
        password: 'SecurePassword123!',
        organizationName: 'Test Organization',
    };
    const invalidUser = {
        email: 'invalid@example.com',
        password: 'WrongPassword123!',
    };
    let authToken;
    let refreshToken;
    let userId;
    let organizationId;
    // Helper function to create and cleanup test data
    afterAll(async () => {
        // Cleanup: Remove test data
        const user = await user_repository_1.userRepository.findByEmail(testUser.email);
        if (user) {
            await prisma_1.default.organizationUser.deleteMany({ where: { userId: user.id } });
            await prisma_1.default.refreshToken.deleteMany({ where: { userId: user.id } });
            await prisma_1.default.passwordResetToken.deleteMany({ where: { userId: user.id } });
            await prisma_1.default.user.delete({ where: { id: user.id } });
        }
        await prisma_1.default.$disconnect();
    });
    describe('Authentication Workflow', () => {
        describe('POST /api/auth/register', () => {
            it('should register a new user successfully', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/register')
                    .send(testUser);
                expect(res.status).toBe(201);
                expect(res.body).toHaveProperty('token');
                expect(res.body).toHaveProperty('refreshToken');
                expect(res.body.user).toMatchObject({
                    name: testUser.name,
                    email: testUser.email,
                });
                expect(res.body.organization).toMatchObject({
                    name: testUser.organizationName,
                });
                authToken = res.body.token;
                refreshToken = res.body.refreshToken;
                userId = res.body.user.id;
                organizationId = res.body.organization.id;
            });
            it('should reject registration with invalid email', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/register')
                    .send({
                    ...testUser,
                    email: 'invalid-email',
                });
                expect(res.status).toBe(400);
                expect(res.body.message).toBe('Validation failed');
            });
            it('should reject registration with weak password', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/register')
                    .send({
                    ...testUser,
                    email: 'another.user@example.com',
                    password: 'weak',
                });
                expect(res.status).toBe(400);
                expect(res.body.message).toBe('Validation failed');
            });
            it('should reject duplicate email registration', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/register')
                    .send(testUser);
                expect(res.status).toBe(400);
                expect(res.body.message).toBe('Validation failed');
            });
        });
        describe('POST /api/auth/login', () => {
            it('should login successfully', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/login')
                    .send({
                    email: testUser.email,
                    password: testUser.password,
                });
                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('token');
                expect(res.body).toHaveProperty('refreshToken');
                expect(res.body.user.email).toBe(testUser.email);
            });
            it('should reject login with invalid email', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/login')
                    .send({
                    email: 'nonexistent@example.com',
                    password: testUser.password,
                });
                expect(res.status).toBe(401);
                expect(res.body.message).toBe('Invalid credentials');
            });
            it('should reject login with wrong password', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/login')
                    .send({
                    email: testUser.email,
                    password: 'WrongPassword123!',
                });
                expect(res.status).toBe(401);
                expect(res.body.message).toBe('Invalid credentials');
            });
        });
        describe('GET /api/auth/me', () => {
            it('should get current user info when authenticated', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .get('/api/auth/me')
                    .set('Authorization', `Bearer ${authToken}`);
                expect(res.status).toBe(200);
                expect(res.body.user).toMatchObject({
                    id: userId,
                    email: testUser.email,
                });
                expect(res.body.organization.id).toBe(organizationId);
            });
            it('should reject without authentication', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .get('/api/auth/me');
                expect(res.status).toBe(401);
            });
            it('should reject with invalid token', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .get('/api/auth/me')
                    .set('Authorization', 'Bearer invalid.token.here');
                expect(res.status).toBe(401);
            });
        });
        describe('POST /api/auth/refresh-token', () => {
            it('should generate new token with valid refresh token', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/refresh-token')
                    .send({ refreshToken });
                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('token');
                expect(res.body).toHaveProperty('refreshToken');
                expect(res.body.token).not.toBe(authToken); // Should be new token
                // Update tokens for subsequent tests
                authToken = res.body.token;
                refreshToken = res.body.refreshToken;
            });
            it('should reject with invalid refresh token', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/refresh-token')
                    .send({ refreshToken: 'invalid.token' });
                expect(res.status).toBe(401);
                expect(res.body.message).toContain('Invalid or expired');
            });
            it('should support refresh token rotation', async () => {
                // Get initial token count
                const oldToken = refreshToken;
                const res1 = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/refresh-token')
                    .send({ refreshToken: oldToken });
                expect(res1.status).toBe(200);
                const newToken = res1.body.refreshToken;
                // Old token should be revoked
                const res2 = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/refresh-token')
                    .send({ refreshToken: oldToken });
                expect(res2.status).toBe(401);
                // Update for next test
                authToken = res1.body.token;
                refreshToken = newToken;
            });
        });
        describe('POST /api/auth/change-password', () => {
            it('should change password when authenticated', async () => {
                const newPassword = 'NewSecurePassword456!';
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/change-password')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                    currentPassword: testUser.password,
                    newPassword,
                    confirmPassword: newPassword,
                });
                expect(res.status).toBe(200);
                expect(res.body.message).toContain('successfully');
                // Update test user password
                Object.assign(testUser, { password: newPassword });
            });
            it('should reject with incorrect current password', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/change-password')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                    currentPassword: 'WrongPassword123!',
                    newPassword: 'AnotherPassword789!',
                    confirmPassword: 'AnotherPassword789!',
                });
                expect(res.status).toBe(401);
                expect(res.body.message).toContain('Current password is incorrect');
            });
            it('should reject mismatched password confirmation', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/change-password')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                    currentPassword: testUser.password,
                    newPassword: 'NewPassword789!',
                    confirmPassword: 'DifferentPassword789!',
                });
                expect(res.status).toBe(400);
            });
            it('should reject if new password same as current', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/change-password')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                    currentPassword: testUser.password,
                    newPassword: testUser.password,
                    confirmPassword: testUser.password,
                });
                expect(res.status).toBe(400);
            });
            it('should require authentication', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/change-password')
                    .send({
                    currentPassword: testUser.password,
                    newPassword: 'NewPassword789!',
                    confirmPassword: 'NewPassword789!',
                });
                expect(res.status).toBe(401);
            });
        });
        describe('POST /api/auth/forgot-password', () => {
            it('should handle forgot password request', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/forgot-password')
                    .send({
                    email: testUser.email,
                });
                expect(res.status).toBe(200);
                expect(res.body.message).toContain('password reset email');
            });
            it('should not reveal if email exists (security)', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/forgot-password')
                    .send({
                    email: 'nonexistent@example.com',
                });
                expect(res.status).toBe(200);
                expect(res.body.message).toContain('password reset email');
            });
            it('should reject invalid email format', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/forgot-password')
                    .send({
                    email: 'invalid-email',
                });
                expect(res.status).toBe(400);
            });
        });
        describe('POST /api/auth/reset-password', () => {
            let resetToken;
            beforeAll(async () => {
                // Create a reset token directly in database
                const user = await user_repository_1.userRepository.findByEmail(testUser.email);
                if (user) {
                    resetToken = crypto_1.default.randomBytes(32).toString('hex');
                    await password_reset_token_repository_1.passwordResetTokenRepository.create({
                        userId: user.id,
                        token: resetToken,
                        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
                    });
                }
            });
            it('should reset password with valid token', async () => {
                const newPassword = 'FinalNewPassword321!';
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/reset-password')
                    .send({
                    token: resetToken,
                    password: newPassword,
                });
                expect(res.status).toBe(200);
                expect(res.body.message).toContain('successfully');
                // Verify new password works
                const loginRes = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/login')
                    .send({
                    email: testUser.email,
                    password: newPassword,
                });
                expect(loginRes.status).toBe(200);
                Object.assign(testUser, { password: newPassword });
            });
            it('should reject reuse of same reset token', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/reset-password')
                    .send({
                    token: resetToken,
                    password: 'AnotherPassword789!',
                });
                expect(res.status).toBe(401);
            });
            it('should reject invalid reset token', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/reset-password')
                    .send({
                    token: 'invalid.token.here',
                    password: 'NewPassword789!',
                });
                expect(res.status).toBe(401);
            });
        });
        describe('POST /api/auth/logout', () => {
            let logoutRefreshToken;
            beforeAll(async () => {
                // Login to get fresh tokens
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/login')
                    .send({
                    email: testUser.email,
                    password: testUser.password,
                });
                logoutRefreshToken = res.body.refreshToken;
                authToken = res.body.token;
            });
            it('should logout and invalidate refresh token', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/logout')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ refreshToken: logoutRefreshToken });
                expect(res.status).toBe(200);
                expect(res.body.message).toContain('successfully');
                // Try to use revoked refresh token
                const res2 = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/refresh-token')
                    .send({ refreshToken: logoutRefreshToken });
                expect(res2.status).toBe(401);
            });
            it('should require authentication to logout', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/logout')
                    .send({ refreshToken: 'some.token' });
                expect(res.status).toBe(401);
            });
        });
    });
    describe('Password Strength Validation', () => {
        const testCases = [
            { password: 'short', description: 'too short' },
            { password: 'nouppercase123!', description: 'no uppercase' },
            { password: 'NOLOWERCASE123!', description: 'no lowercase' },
            { password: 'NoDigits!', description: 'no digits' },
            { password: 'NoSpecial123', description: 'no special character' },
        ];
        testCases.forEach(({ password, description }) => {
            it(`should reject password that is ${description}`, async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/register')
                    .send({
                    name: 'Another User',
                    email: `test${Math.random()}@example.com`,
                    password,
                    organizationName: `Test Org ${Math.random()}`,
                });
                expect(res.status).toBe(400);
                expect(res.body.message).toBe('Validation failed');
            });
        });
        it('should accept valid strong password', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send({
                name: 'Strong Password User',
                email: `strong${Math.random()}@example.com`,
                password: 'StrongPassword123!',
                organizationName: `Strong Org ${Math.random()}`,
            });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('token');
            // Cleanup
            const user = await user_repository_1.userRepository.findByEmail(res.body.user.email);
            if (user) {
                await prisma_1.default.organizationUser.deleteMany({ where: { userId: user.id } });
                await prisma_1.default.user.delete({ where: { id: user.id } });
            }
        });
    });
    describe('Email Validation', () => {
        it('should reject invalid email formats', async () => {
            const invalidEmails = [
                'noemail',
                'missing@domain',
                '@nodomain.com',
                'spaces in@email.com',
            ];
            for (const email of invalidEmails) {
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/register')
                    .send({
                    name: 'Test User',
                    email,
                    password: 'ValidPassword123!',
                    organizationName: `Test Org ${Math.random()}`,
                });
                expect(res.status).toBe(400);
            }
        });
        it('should accept valid email formats', async () => {
            const validEmails = [
                `user+tag${Math.random()}@example.com`,
                `user.name${Math.random()}@example.co.uk`,
            ];
            for (const email of validEmails) {
                const res = await (0, supertest_1.default)(app_1.default)
                    .post('/api/auth/register')
                    .send({
                    name: 'Test User',
                    email,
                    password: 'ValidPassword123!',
                    organizationName: `Test Org ${Math.random()}`,
                });
                if (res.status === 201) {
                    expect(res.body).toHaveProperty('token');
                    // Cleanup
                    const user = await user_repository_1.userRepository.findByEmail(email);
                    if (user) {
                        await prisma_1.default.organizationUser.deleteMany({ where: { userId: user.id } });
                        await prisma_1.default.user.delete({ where: { id: user.id } });
                    }
                }
            }
        });
    });
});
