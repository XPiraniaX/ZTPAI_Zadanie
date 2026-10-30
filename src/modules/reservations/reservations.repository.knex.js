
function createReservationsRepository(knex) {
    function mapReservation(row) {
        if (!row) return null;

        const reservation = {
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

        if (row.joined_room_id !== undefined) {
            reservation.room = {
                id: row.joined_room_id,
                name: row.joined_room_name,
                building: {
                    id: row.joined_building_id,
                    name: row.joined_building_name
                }
            };
        }

        return reservation;
    }

    function reservationWithRelationsQuery() {
        return knex("reservations as res")
            .join("rooms as room", "room.id", "res.room_id")
            .join("buildings as building", "building.id", "room.building_id")
            .select(
                "res.id",
                "res.room_id",
                "res.reserved_by",
                "res.participants",
                "res.start_time",
                "res.end_time",
                "res.status",
                "res.cancelled_at",
                "res.created_at",
                "room.id as joined_room_id",
                "room.name as joined_room_name",
                "building.id as joined_building_id",
                "building.name as joined_building_name"
            );
    }

    return {
        async findAll() {
            const rows = await reservationWithRelationsQuery()
                .orderBy("res.id", "asc");

            return rows.map(mapReservation);
        },

        async findById(id) {
            const row = await reservationWithRelationsQuery()
                .where("res.id", Number(id))
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
                .returning("id");

            return this.findById(row.id);
        },

        async update(id, changes) {
            const updateData = {};

            if (changes.status !== undefined) {
                updateData.status = changes.status;
            }

            if (changes.cancelledAt !== undefined) {
                updateData.cancelled_at = changes.cancelledAt;
            }

            await knex("reservations")
                .where({ id: Number(id) })
                .update(updateData);

            return this.findById(id);
        }
    };
}

module.exports = { createReservationsRepository };
