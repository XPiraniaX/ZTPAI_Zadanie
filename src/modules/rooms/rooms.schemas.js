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
});

module.exports = {
    roomIdSchema,
    createRoomSchema
};