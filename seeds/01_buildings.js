exports.seed = async function (knex) {
    await knex("reservations").del();
    await knex("rooms").del();
    await knex("buildings").del();

    await knex.raw(`
        ALTER SEQUENCE reservations_id_seq RESTART WITH 1;
        ALTER SEQUENCE rooms_id_seq RESTART WITH 1;
        ALTER SEQUENCE buildings_id_seq RESTART WITH 1;
    `);

    await knex("buildings").insert([
        {
            id: 1,
            name: "Budynek A",
            address: "ul. Warszawska 24, Kraków"
        },
        {
            id: 2,
            name: "Budynek B",
            address: "ul. Karmelicka 10, Kraków"
        }
    ]);
    await knex.raw(
        "ALTER SEQUENCE buildings_id_seq RESTART WITH 3"
    );
};