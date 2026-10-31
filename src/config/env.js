const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),

    PORT: z.coerce
        .number()
        .int()
        .min(1)
        .max(65535)
        .default(3000),

    STORAGE: z
        .enum(["knex", "memory"])
        .default("knex"),

    DATABASE_URL: z
        .string()
        .url("DATABASE_URL musi być poprawnym adresem URL")
        .refine(
            value => ["postgres:", "postgresql:"].includes(new URL(value).protocol),
            "DATABASE_URL musi używać protokołu postgres:// lub postgresql://"
        )
        .optional(),

    JWT_SECRET: z
        .string()
        .min(32, "JWT_SECRET musi mieć minimum 32 znaki"),

    JWT_EXPIRES_IN: z
        .string()
        .min(1, "JWT_EXPIRES_IN nie może być pusty")
        .default("15m"),

    DISABLE_APP_OVERLAP_CHECK: z
        .enum(["true", "false"])
        .default("false")
}).superRefine((config, ctx) => {
    if (config.STORAGE === "knex" && !config.DATABASE_URL) {
        ctx.addIssue({
            code: "custom",
            path: ["DATABASE_URL"],
            message: "DATABASE_URL jest wymagany, gdy STORAGE=knex"
        });
    }
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    console.error("\nBłąd konfiguracji aplikacji:");

    for (const issue of result.error.issues) {
        const variable = issue.path.join(".") || "ENV";
        console.error(`- ${variable}: ${issue.message}`);
    }

    console.error("\nPopraw zmienne środowiskowe i uruchom aplikację ponownie.\n");

    process.exit(1);
}

module.exports = Object.freeze(result.data);
