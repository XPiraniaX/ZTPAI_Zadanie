require("dotenv").config();

/** @type {import("knex").Knex.Config} */
module.exports = {
    development: {
        client: "pg",
        connection: process.env.DATABASE_URL,
        migrations: {
            directory: "./migrations",
            extension: "js"
        },
        pool: {
            min: 2,
            max: 10
        }
    }
};
