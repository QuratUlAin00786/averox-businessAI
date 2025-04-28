/**
 * @file Express application
 * @description Express application setup and middleware
 * @module app
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import passport from 'passport';
import { config } from './config';
import { logger } from './utils/logger';
import { errorMiddleware, notFoundHandler } from './utils/error-handler';
import { registerRoutes } from './routes';
import { db } from './utils/db';

// Create Express application
export const app: Express = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic CORS implementation to allow cross-origin requests
app.use((req: Request, res: Response, next: NextFunction) => {
  // Define allowed origins
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000'];
  const origin = req.headers.origin;
  
  // Set CORS headers if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  // Allow common headers and methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Request logger middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log request
  logger.debug(`Request: ${req.method} ${req.url}`);
  
  // Log response after completion
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.httpRequest(req.method, req.url, res.statusCode, duration, req.body || null);
  });
  
  next();
});

// Session configuration
app.use(session({
  secret: config.auth.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: config.auth.cookieMaxAge,
    secure: config.server.isProduction,
    httpOnly: true,
    sameSite: 'lax',
  },
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization/deserialization
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id)
    });
    
    if (!user) {
      return done(null, false);
    }
    
    // Remove sensitive data before passing to req.user
    const { password, ...safeUser } = user;
    done(null, safeUser);
  } catch (error) {
    done(error, null);
  }
});

// Register API routes
registerRoutes(app);

// Handle 404 errors - if no routes matched
app.use(notFoundHandler);

// Global error handler - must be last middleware
app.use(errorMiddleware);