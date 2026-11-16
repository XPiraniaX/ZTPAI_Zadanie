const config = require("./src/config");

const migrations = {
    directory: "./migrations",
    extension: "js"
};

const seeds = {
    directory: "./seeds",
    extension: "js"
};

const productionDatabase = {
    client: "pg",
    connection: config.DATABASE_URL,
    migrations,
    seeds,
    pool: {
        min: 2,
        max: 10
    }
};

module.exports = {
    development: {
        ...productionDatabase
    },

    production: {
        ...productionDatabase
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
