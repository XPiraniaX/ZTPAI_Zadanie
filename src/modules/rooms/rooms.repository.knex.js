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

    return {
        async findAll() {
            const rows = await knex("rooms")
                .select("*")
                .orderBy("id", "asc");

            return rows.map(mapRoom);
        },

        async findById(id) {
            const row = await knex("rooms")
                .where({ id: Number(id) })
                .first();

            return mapRoom(row);
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
        }
    };
}

module.exports = { createRoomsRepository };