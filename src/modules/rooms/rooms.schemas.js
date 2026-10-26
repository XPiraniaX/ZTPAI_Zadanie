const { z } = require("zod");

const roomIdSchema = z.object({
    id: z.coerce.number().int().positive()
}).strict();

module.exports = {
    roomIdSchema
};