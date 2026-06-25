"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapIfNeeded = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const property_routes_1 = __importDefault(require("./routes/property.routes"));
const unit_routes_1 = __importDefault(require("./routes/unit.routes"));
const tenant_routes_1 = __importDefault(require("./routes/tenant.routes"));
const lease_routes_1 = __importDefault(require("./routes/lease.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const payment_webhooks_1 = __importDefault(require("./routes/payment.webhooks"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const openapi_1 = require("./openapi");
const errorHandler_1 = require("./middleware/errorHandler");
const rbac_service_1 = require("./services/rbac.service");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Mount docs only in non-test environments by default (tests can still import openApiDoc)
if (process.env.NODE_ENV !== 'test') {
    app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(openapi_1.openApiDoc));
}
// Mount routers
app.use('/api/auth', auth_routes_1.default);
app.use('/api/properties', property_routes_1.default);
app.use('/api/units', unit_routes_1.default);
app.use('/api/tenants', tenant_routes_1.default);
app.use('/api/leases', lease_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
app.use('/api/payments/webhooks/razorpay', express_1.default.raw({ type: 'application/json' }), payment_webhooks_1.default.razorpay);
app.use('/api/payments/webhooks/cashfree', express_1.default.raw({ type: 'application/json' }), payment_webhooks_1.default.cashfree);
app.get('/', (req, res) => {
    res.json({ success: true, message: 'Property Management API Running' });
});
// Global error handler must be registered after all routes
app.use(errorHandler_1.globalErrorHandler);
const bootstrapIfNeeded = async () => {
    if (process.env.NODE_ENV !== 'test') {
        await (0, rbac_service_1.seedDefaultRolePermissions)();
    }
};
exports.bootstrapIfNeeded = bootstrapIfNeeded;
exports.default = app;
