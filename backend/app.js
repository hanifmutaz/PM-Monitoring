// app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const pinoHttp = require('pino-http');
const crypto = require('crypto');
const env = require('./src/config/env');
const routes = require('./src/routes');
const logger = require('./src/utils/logger');
const { errorHandler, notFoundHandler } = require('./src/middlewares/errorHandler');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

app.use(
  pinoHttp({
    logger: logger.pinoInstance,
    genReqId: (req, res) => {
      const existing = req.headers['x-request-id'];
      const id = existing || crypto.randomUUID();
      res.setHeader('x-request-id', id);
      return id;
    },
  })
);

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true, // wajib true supaya httpOnly cookie ikut terkirim cross-origin (frontend Vite dev server)
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'OK' });
});

app.use('/api/v1', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;