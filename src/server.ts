import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './routes/auth.routes';
import propertyRoutes from './routes/property.routes';
import unitRoutes from './routes/unit.routes';
import tenantRoutes from './routes/tenant.routes';
import leaseRoutes from './routes/lease.routes';
import paymentRoutes from './routes/payment.routes';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/leases', leaseRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Property Management API Running',
  });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
