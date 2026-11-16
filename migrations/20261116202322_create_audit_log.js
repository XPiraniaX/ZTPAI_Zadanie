exports.up = async function (knex) {
    await knex.schema.createTable("audit_log", (table) => {
        table.bigIncrements("id").primary();

        table.string("event_type", 100).notNullable();

        table.jsonb("payload").notNullable();

        table.timestamp("created_at", {
            useTz: true
        }).notNullable().defaultTo(knex.fn.now());
    });

    await knex.schema.raw(`
        CREATE INDEX audit_log_event_type_idx
        ON audit_log (event_type)
    `);

    await knex.schema.raw(`
        CREATE INDEX audit_log_created_at_idx
        ON audit_log (created_at DESC)
    `);
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("audit_log");
};
