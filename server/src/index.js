import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import spitOutRoutes from './routes/spitOutRoutes.js';
import randomRoutes from './routes/randomRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ─── Security Middleware ──────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── CORS ────────────────────────────────────────────────
app.use(cors());

// ─── Body Parsing ────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));

// ─── Rate Limiting ───────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many write requests. Please slow down.' },
});

app.use('/api', generalLimiter);

// ─── Health Check ────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Personality Mirror Server is running.',
    uptime: Math.floor(process.uptime()),
  });
});

// ─── API Routes ──────────────────────────────────────────
app.use('/api', userRoutes);
app.use('/api', feedbackRoutes);
app.use('/api', spitOutRoutes);
app.use('/api', randomRoutes);
app.use('/api', statsRoutes);

// Apply stricter limiter to POST endpoints
app.post('/api/create-user', writeLimiter);
app.post('/api/feedback/:userId', writeLimiter);
app.post('/api/spitout', writeLimiter);

// ─── 404 Handler ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// ─── Error Handling Middleware ────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
