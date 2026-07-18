// app.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const env = require('./src/config/env');
const routes = require('./src/routes');
const { errorHandler, notFoundHandler } = require('./src/middlewares/errorHandler');

const app = express();

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
