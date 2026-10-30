function createBuildingsRepository(knex) {
    function mapBuilding(row) {
        if (!row) return null;

        return {
            id: row.id,
            name: row.name,
            address: row.address,
            createdAt: row.created_at
        };
    }

    return {
        async findAll() {
            const rows = await knex("buildings")
                .select("*")
                .orderBy("id", "asc");

            return rows.map(mapBuilding);
        },

        async findById(id) {
            const row = await knex("buildings")
                .where({ id: Number(id) })
                .first();

            return mapBuilding(row);
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