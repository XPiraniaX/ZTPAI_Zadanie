
const config = require("./src/config");

const migrations = {
    directory: "./migrations",
    extension: "js"
};

module.exports = {
    development: {
        client: "pg",
        connection: config.DATABASE_URL,
        migrations,
        seeds: {
            directory: "./seeds",
            extension: "js"
        },
        pool: {
            min: 2,
            max: 10
        }
    },

    test: {
        client: "pg",
        connection: config.DATABASE_TEST_URL,
        migrations,
        pool: {
            min: 0,
            max: 5
        }
    }
};
