/**
 * @file User DTOs
 * @description Data Transfer Objects for user input validation
 */

import { z } from "zod";
import { insertUserSchema } from "../entities/User";

// DTO for creating a new user
export const createUserDTO = insertUserSchema.extend({
  // Add additional validation for password
  password: z.string().min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  
  // Add optional confirmation password field
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.confirmPassword && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// DTO for updating an existing user
export const updateUserDTO = insertUserSchema.partial().omit({
  password: true, // Password updates should be handled separately
});

// DTO for user login
export const loginUserDTO = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

// DTO for password change
export const changePasswordDTO = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Types for the DTOs
export type CreateUserDTO = z.infer<typeof createUserDTO>;
export type UpdateUserDTO = z.infer<typeof updateUserDTO>;
export type LoginUserDTO = z.infer<typeof loginUserDTO>;
export type ChangePasswordDTO = z.infer<typeof changePasswordDTO>;