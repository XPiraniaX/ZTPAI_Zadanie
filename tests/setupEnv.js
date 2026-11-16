const dotenv = require("dotenv");
const path = require("path");
dotenv.config({
    path: path.resolve(process.cwd(), ".env"),
    override: false,
    quiet: true
});
process.env.NODE_ENV = "test";
if (!process.env.DATABASE_TEST_URL) {
    throw new Error("DATABASE_TEST_URL is required for integration tests");
}
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for database safety check");
}

const testDatabase = new URL(process.env.DATABASE_TEST_URL);
const developmentDatabase = new URL(process.env.DATABASE_URL);
function databaseIdentity(url) {
    return {
        host: url.hostname.toLowerCase(),
        port: url.port || "5432",
        database: decodeURIComponent(url.pathname)
    };
}

const testIdentity = databaseIdentity(testDatabase);
const developmentIdentity = databaseIdentity(developmentDatabase);
const sameDatabase =
    testIdentity.host === developmentIdentity.host &&
    testIdentity.port === developmentIdentity.port &&
    testIdentity.database === developmentIdentity.database;

if (sameDatabase) {
    throw new Error(
        "Integration tests blocked: test database is identical to development database"
    );
}

console.log(
    `Integration tests database: ${testIdentity.database.slice(1)}`
);
