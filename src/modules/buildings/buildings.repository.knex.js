function createBuildingsRepository(knex) {
    function mapBuilding(row) {
        if (!row) return null;

        return {
            id: row.id,
            name: row.name,
            address: row.address,
            createdAt: row.created_at,
            ...(row.rooms_count !== undefined
                ? { roomsCount: Number(row.rooms_count) }
                : {})
        };
    }

    return {
        async findAll() {
            const rows = await knex("buildings as b")
                .leftJoin("rooms as r", "r.building_id", "b.id")
                .select(
                    "b.id",
                    "b.name",
                    "b.address",
                    "b.created_at"
                )
                .count("r.id as rooms_count")
                .groupBy(
                    "b.id",
                    "b.name",
                    "b.address",
                    "b.created_at"
                )
                .orderBy("b.id", "asc");

            return rows.map(mapBuilding);
        },

        async findById(id) {
            const row = await knex("buildings")
                .where({ id: Number(id) })
                .first();

            return mapBuilding(row);
        },

        async findRoomsByBuildingId(id) {
            const rows = await knex("rooms")
                .where({ building_id: Number(id) })
                .select("*")
                .orderBy("id", "asc");

            return rows.map(row => ({
                id: row.id,
                buildingId: row.building_id,
                name: row.name,
                capacity: row.capacity,
                createdAt: row.created_at
            }));
        },

        async create(data) {
            const [row] = await knex("buildings")
                .insert({
                    name: data.name,
                    address: data.address
                })
                .returning("*");

            return mapBuilding(row);
        }
    };
}

module.exports = { createBuildingsRepository };
