"use strict";
/**
 * API Response Tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
describe('ApiResponse', () => {
    let res;
    beforeEach(() => {
        res = {
            status: jest.fn(function () { return this; }),
            json: jest.fn(),
        };
    });
    describe('success', () => {
        it('should return success response with default status code', () => {
            const data = { id: '123', name: 'Test' };
            const message = 'Operation successful';
            index_1.ApiResponse.success(res, data, message);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message,
                data,
            });
        });
        it('should return success response with custom status code', () => {
            const data = { id: '123' };
            const message = 'Created';
            index_1.ApiResponse.success(res, data, message, 201);
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });
    describe('created', () => {
        it('should return created response with 201 status', () => {
            const data = { id: '123', name: 'New Resource' };
            const message = 'Resource created';
            index_1.ApiResponse.created(res, data, message);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message,
                data,
            });
        });
    });
    describe('error', () => {
        it('should return error response with default status code', () => {
            const message = 'Internal server error';
            index_1.ApiResponse.error(res, message);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message,
                errors: [],
            });
        });
        it('should return error response with custom status code', () => {
            const message = 'Not found';
            index_1.ApiResponse.error(res, message, 404);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message,
                errors: [],
            });
        });
        it('should include errors object', () => {
            const message = 'Operation failed';
            const errors = { field: ['Error message'] };
            index_1.ApiResponse.error(res, message, 400, errors);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message,
                errors,
            });
        });
    });
    describe('validationError', () => {
        it('should return validation error response', () => {
            const errors = {
                email: ['Email is required', 'Invalid email format'],
                password: ['Password too short'],
            };
            const message = 'Validation failed';
            index_1.ApiResponse.validationError(res, errors, message);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message,
                errors,
            });
        });
        it('should use default message', () => {
            const errors = { field: ['Error'] };
            index_1.ApiResponse.validationError(res, errors);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
    describe('notFound', () => {
        it('should return not found response', () => {
            const message = 'User not found';
            index_1.ApiResponse.notFound(res, message);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message,
                errors: [],
            });
        });
    });
    describe('unauthorized', () => {
        it('should return unauthorized response', () => {
            const message = 'Invalid credentials';
            index_1.ApiResponse.unauthorized(res, message);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message,
                errors: [],
            });
        });
    });
    describe('forbidden', () => {
        it('should return forbidden response', () => {
            const message = 'Access denied';
            index_1.ApiResponse.forbidden(res, message);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message,
                errors: [],
            });
        });
    });
    describe('conflict', () => {
        it('should return conflict response', () => {
            const message = 'Resource already exists';
            index_1.ApiResponse.conflict(res, message);
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message,
                errors: [],
            });
        });
    });
    describe('paginated', () => {
        it('should return paginated response', () => {
            const data = [{ id: '1', name: 'Item 1' }];
            const meta = { total: 100, page: 1, limit: 10, pages: 10 };
            const message = 'Items retrieved';
            index_1.ApiResponse.paginated(res, data, meta, message);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message,
                data,
                meta,
            });
        });
    });
});
