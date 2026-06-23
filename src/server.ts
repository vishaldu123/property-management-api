import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './routes/auth.routes';
import propertyRoutes from './routes/property.routes';
import unitRoutes from './routes/unit.routes';
import tenantRoutes from './routes/tenant.routes';
import leaseRoutes from './routes/lease.routes';
import paymentRoutes from './routes/payment.routes';
import paymentWebhooks from './routes/payment.webhooks';

dotenv.config();

const app = express();
app.use(express.json());
// Webhook endpoints need raw body for signature verification; mount raw routers below
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/leases', leaseRoutes);
app.use('/api/payments', paymentRoutes);
// Mount webhook routes with raw body handling in server so adapters can verify signatures
app.use('/api/payments/webhooks/razorpay', express.raw({ type: 'application/json' }), paymentWebhooks.razorpay);
app.use('/api/payments/webhooks/cashfree', express.raw({ type: 'application/json' }), paymentWebhooks.cashfree);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Property Management API Running',
  });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
