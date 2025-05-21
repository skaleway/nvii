import * as z from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

export const createSpaceSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z
    .string()
    .min(2, { message: "Description must be at least 2 characters." }),
});

export const feedbackSchema = z.object({
  message: z
    .string()
    .min(20, { message: "Description must be at least 2 characters." }),
});

export const deleteName = z.object({
  text: z.string().min(10, { message: "text too short" }),
});

export type DeleteType = z.infer<typeof deleteName>;
export type Space = z.infer<typeof createSpaceSchema>;
export type feedbackSchemaType = z.infer<typeof feedbackSchema>;
