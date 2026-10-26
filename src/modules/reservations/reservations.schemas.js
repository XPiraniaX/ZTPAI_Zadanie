const { z } = require("zod");

const dateTimeSchema = z.string().datetime({ offset: true });

const createReservationSchema = z.object({
    roomId: z.number().int().positive(),
    reservedBy: z.string().trim().min(3).max(100),
    participants: z.number().int().positive(),
    startTime: dateTimeSchema,
    endTime: dateTimeSchema
}).strict();

const reservationIdSchema = z.object({
    id: z.coerce.number().int().positive()
}).strict();

const roomIdQuerySchema = z.object({
    roomId: z.coerce.number().int().positive().optional()
}).strict();

module.exports = {
    createReservationSchema,
    reservationIdSchema,
    roomIdQuerySchema
};