// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
// const { connectMongo } = require('./services/database');

// const app = express();

// app.set('trust proxy', 1);

// app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
// app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true, credentials: true }));
// app.use(express.json());

// const globalLimiter = rateLimit({
//   windowMs: 60 * 1000,
//   max: 100,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: { error: 'Too many requests, please try again later' }
// });
// app.use(globalLimiter);

// connectMongo().catch((e) => {
//   console.error('Mongo connection failed:', e);
//   process.exit(1);
// });

// app.use('/auth', require('./routes/auth'));
// app.use('/institutions', require('./routes/institutions'));
// app.use('/transactions', require('./routes/transactions'));
// app.use('/config', require('./routes/config'));
// app.use('/analytics', require('./routes/analytics'));

// console.log('Routes mounted: /auth, /institutions, /transactions, /config, /analytics');

// app.get('/health', (req, res) => {
//   res.json({ status: 'healthy', timestamp: new Date().toISOString(), eoaMode: true });
// });

// // Central error handler
// // eslint-disable-next-line no-unused-vars
// app.use((err, req, res, next) => {
//   console.error('Unhandled error:', err);
//   res.status(500).json({ error: 'Internal server error' });
// });

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectMongo } = require('./services/database');

const app = express();

// ---- Security & Middleware ----
app.set('trust proxy', 1);

// Helmet for security (disabled policies that break CORS/React)
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

// ✅ Fixed CORS setup
//const allowedOrigins = process.env.CORS_ORIGIN
//  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  //: ['http://localhost:3000']; // fallback for local dev

app.use(cors({
  origin: "https://ledger-knight.onrender.com",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Explicitly handle preflight requests
/*app.options('*', cors({
  origin: allowedOrigins,
  credentials: true
}));*/

// Parse JSON bodies
app.use(express.json());

// ---- Rate Limiting ----
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // max requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' }
});
app.use(globalLimiter);

// ---- Database Connection ----
connectMongo().catch((e) => {
  console.error('Mongo connection failed:', e);
  process.exit(1);
});

// ---- Routes ----
app.use('/auth', require('./routes/auth'));
app.use('/institutions', require('./routes/institutions'));
app.use('/transactions', require('./routes/transactions'));
app.use('/config', require('./routes/config'));
app.use('/analytics', require('./routes/analytics'));

console.log('Routes mounted: /auth, /institutions, /transactions, /config, /analytics');

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    eoaMode: true
  });
});

// ---- Central Error Handler ----
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ---- Server Start ----
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
