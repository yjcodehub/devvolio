import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Secure server response headers (with cross-origin resource sharing support)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Dynamic CORS configuration mapping for multi-tenant subdomains
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5000',
        env.FRONTEND_URL,
      ];

      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.lvh.me:3000') ||
        origin.endsWith('.devvolio.in') ||
        origin.endsWith('.localhost:3000') ||
        env.NODE_ENV === 'development'
      ) {
        callback(null, true);
      } else {
        callback(new Error('Origin blocked by CORS policy'));
      }
    },
    credentials: true,
  })
);

// Payload parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// REST routes
app.use('/api/v1', routes);

// Global Error Handler
app.use(errorHandler);

export default app;
