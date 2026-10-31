const bcrypt = require("bcryptjs");
const crypto = require("crypto");

exports.up = async function (knex) {
    await knex.schema.createTable("reservation_legacy_owners", (table) => {
        table.integer("reservation_id").primary();
        table.string("reserved_by", 150).notNullable();
    });

    await knex.schema.alterTable("reservations", (table) => {
        table.integer("user_id").nullable();
    });

    const reservations = await knex("reservations")
        .select("id", "reserved_by");

    for (const reservation of reservations) {
        const passwordHash = await bcrypt.hash(
            crypto.randomBytes(32).toString("hex"),
            12
        );

        const [user] = await knex("users")
            .insert({
                email: `legacy-reservation-${reservation.id}@room-booking.local`,
                password_hash: passwordHash,
                role: "USER"
            })
            .returning("id");

        await knex("reservation_legacy_owners").insert({
            reservation_id: reservation.id,
            reserved_by: reservation.reserved_by
        });

        await knex("reservations")
            .where({ id: reservation.id })
            .update({ user_id: user.id });
    }

    await knex.schema.alterTable("reservations", (table) => {
        table.integer("user_id").notNullable().alter();

        table.foreign("user_id")
            .references("id")
            .inTable("users")
            .onDelete("RESTRICT")
            .onUpdate("CASCADE");

        table.dropColumn("reserved_by");
    });
};

exports.down = async function (knex) {
    await knex.schema.alterTable("reservations", (table) => {
        table.string("reserved_by", 150).nullable();
    });

    const mappings = await knex("reservation_legacy_owners");

    for (const mapping of mappings) {
        await knex("reservations")
            .where({ id: mapping.reservation_id })
            .update({ reserved_by: mapping.reserved_by });
    }

    await knex.schema.alterTable("reservations", (table) => {
        table.dropForeign("user_id");
        table.dropColumn("user_id");
    });

    await knex.schema.alterTable("reservations", (table) => {
        table.string("reserved_by", 150).notNullable().alter();
    });

    await knex.schema.dropTableIfExists("reservation_legacy_owners");
};