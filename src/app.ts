import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import authRoutes from './routes/auth.routes';
import { globalErrorHandler } from './middleware/errorHandler';

const envPath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envPath });

const app = express();

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Property Management API - Foundation Phase' });
});

// API Routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;
