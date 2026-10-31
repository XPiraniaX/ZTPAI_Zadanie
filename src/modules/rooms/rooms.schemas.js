const { z } = require("zod");

const roomIdSchema = z.object({
    id: z.coerce.number().int().positive()
}).strict();

const createRoomSchema = z.object({
    buildingId: z.coerce.number().int().positive(),

    name: z.string()
        .trim()
        .min(1, "Room name is required")
        .max(100, "Room name cannot exceed 100 characters"),

    capacity: z.coerce.number()
        .int()
        .positive()
}).strict();

const updateRoomSchema = z.object({
    buildingId: z.coerce.number().int().positive().optional(),

    name: z.string()
        .trim()
        .min(1)
        .max(100)
        .optional(),

    capacity: z.coerce.number()
        .int()
        .positive()
        .optional()
}).strict().refine(
    data => Object.keys(data).length > 0,
    { message: "At least one field must be provided" }
);

module.exports = {
    roomIdSchema,
    createRoomSchema,
    updateRoomSchema
};