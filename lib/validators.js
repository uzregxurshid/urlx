import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  surname: z.string().min(1, "Surname is required"),
  dob: z.string().min(1, "Date of birth is required"),
  country: z.string().min(1, "Country is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});


export const createLinkSchema = z.object({
  longUrl: z.string().url("Enter a valid URL (https://...)"),
  slug: z.string().regex(/^[a-zA-Z0-9-_]{3,30}$/).optional(),
  expiresAt: z.string().datetime().optional(), // ISO 8601 if you send it
});