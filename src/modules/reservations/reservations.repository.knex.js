function createReservationsRepository(knex) {
    function mapReservation(row) {
        if (!row) return null;

        const reservation = {
            id: row.id,
            roomId: row.room_id,
            user: {
                id: row.user_id,
                email: row.user_email
            },
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

    function reservationWithRelationsQuery(db = knex) {
        return db("reservations as res")
            .join("rooms as room", "room.id", "res.room_id")
            .join("buildings as building", "building.id", "room.building_id")
            .join("users as usr", "usr.id", "res.user_id")
            .select(
                "res.id",
                "res.room_id",
                "res.user_id",
                "usr.email as user_email",
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

    function applyFilters(query, filters) {
        if (filters.roomId !== undefined) {
            query.where("res.room_id", filters.roomId);
        }

        if (filters.buildingId !== undefined) {
            query.where("room.building_id", filters.buildingId);
        }

        if (filters.userId !== undefined) {
            query.where("res.user_id", filters.userId);
        }

        if (filters.status !== undefined) {
            query.where("res.status", filters.status);
        }

        if (filters.from !== undefined) {
            query.where("res.end_time", ">", filters.from);
        }

        if (filters.to !== undefined) {
            query.where("res.start_time", "<", filters.to);
        }

        return query;
    }

    const SORT_COLUMNS = {
        startTime: "res.start_time",
        createdAt: "res.created_at",
        participants: "res.participants"
    };

    return {
        async findAll(filters = {}) {
            const countQuery = knex("reservations as res")
                .join("rooms as room", "room.id", "res.room_id");

            applyFilters(countQuery, filters);

            const countResult = await countQuery
                .count({ total: "res.id" })
                .first();

            const total = Number(countResult.total);

            const sortField = filters.sort || "startTime";
            const descending = sortField.startsWith("-");
            const sortName = descending
                ? sortField.substring(1)
                : sortField;

            const sortColumn = SORT_COLUMNS[sortName];

            if (!sortColumn) {
                throw new Error("Unsupported reservation sort column");
            }

            const page = filters.page || 1;
            const limit = filters.limit || 20;
            const offset = (page - 1) * limit;

            const rowsQuery = reservationWithRelationsQuery();

            applyFilters(rowsQuery, filters);

            const rows = await rowsQuery
                .orderBy(sortColumn, descending ? "desc" : "asc")
                .orderBy("res.id", "asc")
                .limit(limit)
                .offset(offset);

            return {
                data: rows.map(mapReservation),
                total
            };
        },

        async findById(id) {
            const row = await reservationWithRelationsQuery()
                .where("res.id", Number(id))
                .first();

            return mapReservation(row);
        },

        async findByRoomId(roomId) {
            const rows = await reservationWithRelationsQuery()
                .where("res.room_id", Number(roomId))
                .orderBy("res.start_time", "asc");

            return rows.map(mapReservation);
        },

        async createWithRoomLock(data, options = {}) {
            const checkOverlap = options.checkOverlap !== false;

            return knex.transaction(async (trx) => {
                const room = await trx("rooms")
                    .where({ id: Number(data.roomId) })
                    .forUpdate()
                    .first("id");

                if (!room) {
                    return null;
                }

                if (checkOverlap) {
                    const overlappingReservation = await trx("reservations")
                        .where({
                            room_id: Number(data.roomId),
                            status: "CONFIRMED"
                        })
                        .where("start_time", "<", data.endTime)
                        .where("end_time", ">", data.startTime)
                        .first("id");

                    if (overlappingReservation) {
                        return { conflict: true };
                    }
                }

                const [inserted] = await trx("reservations")
                    .insert({
                        room_id: Number(data.roomId),
                        user_id: Number(data.userId),
                        participants: data.participants,
                        start_time: data.startTime,
                        end_time: data.endTime,
                        status: "CONFIRMED",
                        cancelled_at: null
                    })
                    .returning("id");

                const row = await reservationWithRelationsQuery(trx)
                    .where("res.id", inserted.id)
                    .first();

                return mapReservation(row);
            });
        },

        async create(data) {
            const [row] = await knex("reservations")
                .insert({
                    room_id: Number(data.roomId),
                    user_id: Number(data.userId),
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