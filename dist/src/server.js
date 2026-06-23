"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const property_routes_1 = __importDefault(require("./routes/property.routes"));
const unit_routes_1 = __importDefault(require("./routes/unit.routes"));
const tenant_routes_1 = __importDefault(require("./routes/tenant.routes"));
const lease_routes_1 = __importDefault(require("./routes/lease.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const payment_webhooks_1 = __importDefault(require("./routes/payment.webhooks"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Webhook endpoints need raw body for signature verification; mount raw routers below
app.use('/api/auth', auth_routes_1.default);
app.use('/api/properties', property_routes_1.default);
app.use('/api/units', unit_routes_1.default);
app.use('/api/tenants', tenant_routes_1.default);
app.use('/api/leases', lease_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
// Mount webhook routes with raw body handling in server so adapters can verify signatures
app.use('/api/payments/webhooks/razorpay', express_1.default.raw({ type: 'application/json' }), payment_webhooks_1.default.razorpay);
app.use('/api/payments/webhooks/cashfree', express_1.default.raw({ type: 'application/json' }), payment_webhooks_1.default.cashfree);
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Property Management API Running',
    });
});
app.listen(5000, () => {
    console.log('Server running on port 5000');
});
