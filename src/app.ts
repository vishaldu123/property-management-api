import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './routes/auth.routes';
import propertyRoutes from './routes/property.routes';
import unitRoutes from './routes/unit.routes';
import tenantRoutes from './routes/tenant.routes';
import leaseRoutes from './routes/lease.routes';
import paymentRoutes from './routes/payment.routes';
import paymentWebhooks from './routes/payment.webhooks';
import swaggerUi from 'swagger-ui-express';
import { openApiDoc } from './openapi';
import { globalErrorHandler } from './middleware/errorHandler';
import { seedDefaultRolePermissions } from './services/rbac.service';

dotenv.config();

const app = express();
app.use(express.json());

// Mount docs only in non-test environments by default (tests can still import openApiDoc)
if (process.env.NODE_ENV !== 'test') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDoc));
}

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/leases', leaseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payments/webhooks/razorpay', express.raw({ type: 'application/json' }), paymentWebhooks.razorpay);
app.use('/api/payments/webhooks/cashfree', express.raw({ type: 'application/json' }), paymentWebhooks.cashfree);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Property Management API Running' });
});

// Global error handler must be registered after all routes
app.use(globalErrorHandler);

export const bootstrapIfNeeded = async () => {
  if (process.env.NODE_ENV !== 'test') {
    await seedDefaultRolePermissions();
  }
};

export default app;