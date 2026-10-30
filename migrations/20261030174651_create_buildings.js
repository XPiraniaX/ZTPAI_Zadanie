exports.up = function (knex) {
    return knex.schema.createTable("buildings", (table) => {
        table.increments("id").primary();

        table.string("name", 150).notNullable().unique();
        table.string("address", 255).notNullable();

        table.timestamp("created_at", { useTz: true })
            .notNullable()
            .defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("buildings");
};
