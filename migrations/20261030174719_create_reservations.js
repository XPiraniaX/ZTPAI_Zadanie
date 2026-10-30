exports.up = function (knex) {
    return knex.schema.createTable("reservations", (table) => {
        table.increments("id").primary();

        table.integer("room_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("rooms")
            .onDelete("RESTRICT")
            .onUpdate("CASCADE");

        table.string("reserved_by", 150).notNullable();

        table.integer("participants").notNullable();

        table.timestamp("start_time", { useTz: true }).notNullable();
        table.timestamp("end_time", { useTz: true }).notNullable();

        table.string("status", 20)
            .notNullable()
            .defaultTo("CONFIRMED");

        table.timestamp("cancelled_at", { useTz: true }).nullable();

        table.timestamp("created_at", { useTz: true })
            .notNullable()
            .defaultTo(knex.fn.now());

        table.check(
            "end_time > start_time",
            [],
            "reservations_time_check"
        );

        table.check(
            "status IN ('CONFIRMED', 'CANCELLED')",
            [],
            "reservations_status_check"
        );

        table.index(
            ["room_id", "start_time", "end_time"],
            "reservations_room_time_idx"
        );
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("reservations");
};
