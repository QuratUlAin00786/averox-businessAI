/**
 * @file Contact DTO
 * @description Data Transfer Objects for contact operations
 */

import { z } from "zod";
import { insertContactSchema } from "../entities/Contact";

// Create Contact DTO - for validating input when creating a contact
export const CreateContactDTO = insertContactSchema.extend({
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

// Update Contact DTO - for validating input when updating a contact
export const UpdateContactDTO = insertContactSchema.partial();

// Contact Response DTO - adding any additional properties for API responses
export const ContactResponseDTO = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  title: z.string().optional(),
  accountId: z.number().optional(),
  ownerId: z.number().optional(),
  createdAt: z.date(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
  // Added computed/derived properties
  fullName: z.string(),
  accountName: z.string().optional(),
  ownerName: z.string().optional(),
});