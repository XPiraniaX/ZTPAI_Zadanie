function createReservationsRepository(knex) {
    function mapReservation(row) {
        if (!row) return null;

        return {
            id: row.id,
            roomId: row.room_id,
            reservedBy: row.reserved_by,
            participants: row.participants,
            startTime: row.start_time,
            endTime: row.end_time,
            status: row.status,
            cancelledAt: row.cancelled_at,
            createdAt: row.created_at
        };
    }

    return {
        async findAll() {
            const rows = await knex("reservations")
                .select("*")
                .orderBy("id", "asc");

            return rows.map(mapReservation);
        },

        async findById(id) {
            const row = await knex("reservations")
                .where({ id: Number(id) })
                .first();

            return mapReservation(row);
        },

        async findByRoomId(roomId) {
            const rows = await knex("reservations")
                .where({ room_id: Number(roomId) })
                .orderBy("start_time", "asc");

            return rows.map(mapReservation);
        },

        async create(data) {
            const [row] = await knex("reservations")
                .insert({
                    room_id: Number(data.roomId),
                    reserved_by: data.reservedBy,
                    participants: data.participants,
                    start_time: data.startTime,
                    end_time: data.endTime,
                    status: "CONFIRMED",
                    cancelled_at: null
                })
                .returning("*");

            return mapReservation(row);
        },

        async update(id, changes) {
            const updateData = {};

            if (changes.status !== undefined) {
                updateData.status = changes.status;
            }

            if (changes.cancelledAt !== undefined) {
                updateData.cancelled_at = changes.cancelledAt;
            }

            const [row] = await knex("reservations")
                .where({ id: Number(id) })
                .update(updateData)
                .returning("*");

            return mapReservation(row);
        }
    };
}

module.exports = { createReservationsRepository };