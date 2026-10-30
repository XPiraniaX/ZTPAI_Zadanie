exports.seed = async function (knex) {
    await knex("rooms").insert([
        {
            id: 1,
            building_id: 1,
            name: "101",
            capacity: 30
        },
        {
            id: 2,
            building_id: 1,
            name: "102",
            capacity: 20
        },
        {
            id: 3,
            building_id: 1,
            name: "103",
            capacity: 15
        },
        {
            id: 4,
            building_id: 2,
            name: "101",
            capacity: 40
        },
        {
            id: 5,
            building_id: 2,
            name: "102",
            capacity: 25
        }
    ]);

    await knex.raw(
        "ALTER SEQUENCE rooms_id_seq RESTART WITH 6"
    );
};