function createAuditLogRepository(knex) {
    function mapAuditLog(row) {
        if (!row) return null;

        return {
            id: Number(row.id),
            eventType: row.event_type,
            payload: row.payload,
            createdAt: row.created_at
        };
    }

    return {
        async create(eventType, payload) {
            const [row] = await knex("audit_log")
                .insert({
                    event_type: eventType,
                    payload
                })
                .returning([
                    "id",
                    "event_type",
                    "payload",
                    "created_at"
                ]);

            return mapAuditLog(row);
        },

        async findAll(filters = {}) {
            const page = filters.page || 1;
            const limit = filters.limit || 20;
            const offset = (page - 1) * limit;

            const countQuery = knex("audit_log");

            if (filters.eventType !== undefined) {
                countQuery.where("event_type", filters.eventType);
            }

            const countResult = await countQuery
                .count({ total: "id" })
                .first();

            const total = Number(countResult.total);

            const rowsQuery = knex("audit_log");

            if (filters.eventType !== undefined) {
                rowsQuery.where("event_type", filters.eventType);
            }

            const rows = await rowsQuery
                .select(
                    "id",
                    "event_type",
                    "payload",
                    "created_at"
                )
                .orderBy("created_at", "desc")
                .orderBy("id", "desc")
                .limit(limit)
                .offset(offset);

            return {
                data: rows.map(mapAuditLog),
                total
            };
        }
    };
}

module.exports = { createAuditLogRepository };
