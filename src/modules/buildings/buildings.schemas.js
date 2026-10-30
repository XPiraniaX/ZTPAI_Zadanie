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
});

const buildingIdSchema = z.object({
    id: z.coerce.number().int().positive()
});

module.exports = {
    createBuildingSchema,
    buildingIdSchema
};