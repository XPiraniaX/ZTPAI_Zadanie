const { z } = require("zod");

const dateTimeSchema = z.string().datetime({ offset: true });

const createReservationSchema = z.object({
    roomId: z.number().int().positive(),
    participants: z.number().int().positive(),
    startTime: dateTimeSchema,
    endTime: dateTimeSchema
}).strict();

const reservationIdSchema = z.object({
    id: z.coerce.number().int().positive()
}).strict();

const reservationQuerySchema = z.object({
    roomId: z.coerce.number().int().positive().optional(),
    buildingId: z.coerce.number().int().positive().optional(),
    userId: z.coerce.number().int().positive().optional(),

    status: z.enum(["CONFIRMED", "CANCELLED"]).optional(),

    from: dateTimeSchema.optional(),
    to: dateTimeSchema.optional(),

    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),

    sort: z.enum([
        "startTime",
        "-startTime",
        "createdAt",
        "-createdAt",
        "participants",
        "-participants"
    ]).default("startTime")
}).strict().superRefine((data, ctx) => {
    if (
        data.from !== undefined &&
        data.to !== undefined &&
        new Date(data.from).getTime() >= new Date(data.to).getTime()
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["from"],
            message: "from must be earlier than to"
        });
    }
});

module.exports = {
    createReservationSchema,
    reservationIdSchema,
    roomIdQuerySchema: reservationQuerySchema,
    reservationQuerySchema
};