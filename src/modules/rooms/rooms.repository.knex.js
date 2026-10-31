function createRoomsRepository(knex) {
    function mapRoom(row) {
        if (!row) return null;

        return {
            id: row.id,
            buildingId: row.building_id,
            name: row.name,
            capacity: row.capacity,
            createdAt: row.created_at
        };
    }

    function mapRoomWithBuilding(row) {
        if (!row) return null;

        return {
            id: row.id,
            name: row.name,
            capacity: row.capacity,
            building: {
                id: row.joined_building_id,
                name: row.joined_building_name
            }
        };
    }

    return {
        async findAll() {
            const rows = await knex("rooms")
                .select("*")
                .orderBy("id", "asc");

            return rows.map(mapRoom);
        },

        async findById(id) {
            const row = await knex("rooms as r")
                .join("buildings as b", "b.id", "r.building_id")
                .where("r.id", Number(id))
                .select(
                    "r.id",
                    "r.building_id",
                    "r.name",
                    "r.capacity",
                    "b.id as joined_building_id",
                    "b.name as joined_building_name"
                )
                .first();

            if (!row) return null;

            return {
                id: row.id,
                buildingId: row.building_id,
                name: row.name,
                capacity: row.capacity,
                building: {
                    id: row.joined_building_id,
                    name: row.joined_building_name
                }
            };
        },

        async findByBuildingId(buildingId) {
            const rows = await knex("rooms")
                .where({ building_id: Number(buildingId) })
                .select("*")
                .orderBy("id", "asc");

            return rows.map(mapRoom);
        },

        async create(data) {
            const [row] = await knex("rooms")
                .insert({
                    building_id: Number(data.buildingId),
                    name: data.name,
                    capacity: data.capacity
                })
                .returning("*");

            return mapRoom(row);
        },

        async update(id, data) {
            const updateData = {};

            if (data.buildingId !== undefined) {
                updateData.building_id = Number(data.buildingId);
            }

            if (data.name !== undefined) {
                updateData.name = data.name;
            }

            if (data.capacity !== undefined) {
                updateData.capacity = data.capacity;
            }

            const [row] = await knex("rooms")
                .where({ id: Number(id) })
                .update(updateData)
                .returning("*");

            return mapRoom(row);
        },

        async delete(id) {
            const deleted = await knex("rooms")
                .where({ id: Number(id) })
                .del();

            return deleted > 0;
        }
    };
}

module.exports = { createRoomsRepository };