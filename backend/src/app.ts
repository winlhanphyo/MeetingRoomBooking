import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import sequelize from './config/database';
import './models'; // register associations
import userRoutes from './routes/users';
import bookingRoutes from './routes/bookings';
import { swaggerOptions } from './swagger';

const app = express();

// ── Rate limiters ────────────────────────────────────────────────────────────

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many write requests, please slow down.' },
});

// ── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(globalLimiter);

// Apply stricter limit to all mutating requests across API routes
app.use('/api', (req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return writeLimiter(req, res, next);
  }
  next();
});

// ── Swagger UI ───────────────────────────────────────────────────────────────

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

// ── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ── Start ────────────────────────────────────────────────────────────────────

const PORT = Number(process.env.PORT ?? 5000);

const start = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    await sequelize.sync({ alter: true });
    console.log('Models synchronized.');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Swagger UI  → http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error('Failed to start server:', (err as Error).message);
    process.exit(1);
  }
};

start();
