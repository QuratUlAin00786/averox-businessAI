/**
 * @file Authentication setup
 * @description Configures passport.js for authentication
 * @module config/auth
 */

import { Express } from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import connectPgSimple from 'connect-pg-simple';
import { pool } from '../utils/db';
import { config } from './index';
import { userService } from '../services/user.service';
import { comparePasswords } from '../services/auth.service';
import { logger } from '../utils/logger';

/**
 * Configures session and authentication for the application
 * @param app Express application
 */
export function setupAuth(app: Express): void {
  // Create postgres session store
  const PgSession = connectPgSimple(session);
  
  // Configure session middleware
  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: 'session',
        createTableIfMissing: true,
      }),
      secret: config.auth.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: config.auth.cookieMaxAge,
        secure: config.server.isProduction,
        httpOnly: true,
      },
    })
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Find user by username
        const user = await userService.getUserByUsername(username);
        
        if (!user) {
          logger.warn(`Authentication failed: User not found - ${username}`);
          return done(null, false);
        }
        
        // Check if user is active
        if (user.isActive === false) {
          logger.warn(`Authentication failed: Inactive account - ${username}`);
          return done(null, false);
        }
        
        // Verify password
        const isPasswordValid = await comparePasswords(password, user.password);
        
        if (!isPasswordValid) {
          logger.warn(`Authentication failed: Invalid password - ${username}`);
          return done(null, false);
        }
        
        // Remove password from user object before serializing
        const { password: _, ...userWithoutPassword } = user;
        
        logger.info(`Authentication successful - ${username}`);
        return done(null, userWithoutPassword);
      } catch (error) {
        logger.error('Authentication error', error);
        return done(error);
      }
    })
  );

  // Configure serialization (what data is stored in the session)
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Configure deserialization (how to get user data from session)
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await userService.getUserById(id);
      done(null, user);
    } catch (error) {
      logger.error('User deserialization error', error);
      done(error);
    }
  });
  
  logger.info('Authentication setup completed');
}