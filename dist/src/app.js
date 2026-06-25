"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const envPath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv_1.default.config({ path: envPath });
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
// Health check endpoint
app.get('/', (req, res) => {
    res.json({ success: true, message: 'Property Management API - Foundation Phase' });
});
// API Routes
app.use('/api/auth', auth_routes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
// Global error handler (must be last)
app.use(errorHandler_1.globalErrorHandler);
exports.default = app;
