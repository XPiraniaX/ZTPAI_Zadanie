exports.up = function (knex) {
    return knex.schema.createTable("rooms", (table) => {
        table.increments("id").primary();

        table.integer("building_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("buildings")
            .onDelete("RESTRICT")
            .onUpdate("CASCADE");

        table.string("name", 100).notNullable();

        table.integer("capacity").notNullable();

        table.timestamp("created_at", { useTz: true })
            .notNullable()
            .defaultTo(knex.fn.now());

        table.unique(["building_id", "name"]);

        table.check("capacity > 0", [], "rooms_capacity_check");

        table.index(["building_id"], "rooms_building_id_idx");
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("rooms");
};
