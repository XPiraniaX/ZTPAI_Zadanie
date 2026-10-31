const { z } = require("zod");

const registerSchema = z.object({
    email: z.string()
        .trim()
        .email("Invalid email address")
        .transform(value => value.toLowerCase()),

    password: z.string()
        .min(10, "Password must contain at least 10 characters")
        .max(72, "Password must contain at most 72 characters")
}).strict();

const loginSchema = z.object({
    email: z.string()
        .trim()
        .email("Invalid email address")
        .transform(value => value.toLowerCase()),

    password: z.string()
        .min(1, "Password is required")
}).strict();

module.exports = {
    registerSchema,
    loginSchema
};