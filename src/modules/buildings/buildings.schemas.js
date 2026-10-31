const { z } = require("zod");

const createBuildingSchema = z.object({
    name: z.string()
        .trim()
        .min(2, "Building name must contain at least 2 characters")
        .max(100, "Building name cannot exceed 100 characters"),

    address: z.string()
        .trim()
        .min(5, "Address must contain at least 5 characters")
        .max(255, "Address cannot exceed 255 characters")
}).strict();

const updateBuildingSchema = z.object({
    name: z.string()
        .trim()
        .min(2)
        .max(100)
        .optional(),

    address: z.string()
        .trim()
        .min(5)
        .max(255)
        .optional()
}).strict().refine(
    data => Object.keys(data).length > 0,
    { message: "At least one field must be provided" }
);

const buildingIdSchema = z.object({
    id: z.coerce.number().int().positive()
}).strict();

module.exports = {
    createBuildingSchema,
    updateBuildingSchema,
    buildingIdSchema
};