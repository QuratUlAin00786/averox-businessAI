/**
 * @file Express application
 * @description Application setup and middleware configuration
 * @module app
 */

import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { config } from './config';
import { errorMiddleware, notFoundHandler } from './utils/error-handler';
import { logger } from './utils/logger';

// Initialize Express app
const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS setup - simple implementation without the cors package
app.use((req: Request, res: Response, next: NextFunction) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Session configuration
app.use(
  session({
    secret: config.auth.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.server.isProduction,
      httpOnly: true,
      maxAge: config.auth.cookieMaxAge,
    },
  })
);

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    logger.httpRequest(req.method, req.url, res.statusCode, responseTime);
  });
  
  next();
});

// Import routes
import { registerRoutes } from './routes';

// Apply API routes
registerRoutes(app);

// Not found handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorMiddleware);

export default app;