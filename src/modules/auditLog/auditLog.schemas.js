const { z } = require("zod");

const auditLogQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    eventType: z.enum([
        "reservation.created",
        "reservation.cancelled"
    ]).optional()
}).strict();

module.exports = {
    auditLogQuerySchema
};