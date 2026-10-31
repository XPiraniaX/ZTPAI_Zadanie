const config = require("./src/config");

/** @type {import("knex").Knex.Config} */
module.exports = {
    development: {
        client: "pg",
        connection: config.DATABASE_URL,

        migrations: {
            directory: "./migrations",
            extension: "js"
        },

        seeds: {
            directory: "./seeds",
            extension: "js"
        },

        pool: {
            min: 2,
            max: 10
        }
    }
};
