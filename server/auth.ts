import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  const hash = `${buf.toString("hex")}.${salt}`;
  console.log('Generated password hash:', hash.substring(0, 20) + '...' + hash.substring(hash.length - 10));
  return hash;
}

export async function comparePasswords(supplied: string, stored: string) {
  try {
    console.log('Comparing passwords:');
    console.log('Supplied (masked):', supplied.charAt(0) + '*'.repeat(supplied.length - 2) + supplied.charAt(supplied.length - 1));
    console.log('Stored format:', stored.substring(0, 20) + '...' + stored.substring(stored.length - 10));
    
    const [hashed, salt] = stored.split(".");
    // If stored password format is incorrect, return false
    if (!hashed || !salt) {
      console.error("Invalid stored password format - missing hash or salt");
      return false;
    }
    
    console.log('Hash length:', hashed.length, 'Salt length:', salt.length);
    
    const hashedBuf = Buffer.from(hashed, "hex");
    console.log('Creating supplied hash using salt...');
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    
    // Check if buffers have the same length - required for timingSafeEqual
    if (hashedBuf.length !== suppliedBuf.length) {
      console.error("Buffer length mismatch in password comparison");
      console.log('Hashed buffer length:', hashedBuf.length, 'Supplied buffer length:', suppliedBuf.length);
      return false;
    }
    
    const result = timingSafeEqual(hashedBuf, suppliedBuf);
    console.log('Password comparison result:', result);
    return result;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "averox_super_secret_session_key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          // Update last login timestamp
          const now = new Date();
          // Update user's lastLogin in storage
          storage.updateUser(user.id, { lastLogin: now } as any);
          // Return original user - it will be updated in DB but we don't need to wait
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, email, firstName, lastName, role } = req.body;
      
      if (!username || !password || !email) {
        return res.status(400).json({ error: "Username, password, and email are required" });
      }
      
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const user = await storage.createUser({
        username,
        email,
        firstName,
        lastName,
        role,
        password: await hashPassword(password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send password back to client
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error: any) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: Express.User) => {
      if (err) {
        return next(err); 
      }
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      // Apply the remember me functionality if requested
      if (req.body.rememberMe) {
        // Update session cookie to last for 30 days when remember me is checked
        if (req.session.cookie) {
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        }
      } else {
        // Use default session duration (typically until browser is closed)
        if (req.session.cookie) {
          req.session.cookie.expires = undefined; // Session cookie
        }
      }
      
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        // Don't send password back to client
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.status(200).json({ message: "If the email exists, password reset instructions have been sent" });
      }

      // Generate a reset token (simple implementation - in production, use a proper token)
      const resetToken = randomBytes(32).toString('hex');
      const resetExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Store reset token (you would need to add these fields to your user schema)
      // For now, we'll just simulate the process
      console.log(`Password reset requested for ${email}`);
      console.log(`Reset token: ${resetToken}`);
      console.log(`Reset expires: ${resetExpiry}`);

      // In a real application, you would:
      // 1. Store the reset token and expiry in the database
      // 2. Send an email with the reset link
      // For now, we'll just log it and return success

      res.status(200).json({ 
        message: "Password reset instructions have been sent to your email",
        // In development, include the token for testing
        ...(process.env.NODE_ENV === 'development' && { resetToken, resetExpiry })
      });

    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    // Don't send password back to client
    const { password, ...userWithoutPassword } = req.user as Express.User;
    res.json(userWithoutPassword);
  });
}