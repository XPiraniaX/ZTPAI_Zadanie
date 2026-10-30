require("dotenv").config();

const { createApp } = require("./app");

// Repozytoria in-memory
const { createBuildingsRepository: createBuildingsMemoryRepository } =
    require("./modules/buildings/buildings.repository.memory");

const { createRoomsRepository: createRoomsMemoryRepository } =
    require("./modules/rooms/rooms.repository.memory");

const { createReservationsRepository: createReservationsMemoryRepository } =
    require("./modules/reservations/reservations.repository.memory");

// Repozytoria Knex
const { createBuildingsRepository: createBuildingsKnexRepository } =
    require("./modules/buildings/buildings.repository.knex");

const { createRoomsRepository: createRoomsKnexRepository } =
    require("./modules/rooms/rooms.repository.knex");

const { createReservationsRepository: createReservationsKnexRepository } =
    require("./modules/reservations/reservations.repository.knex");

let knex;
let buildingsRepository;
let roomsRepository;
let reservationsRepository;

if (process.env.STORAGE === "memory") {
    console.log("Using in-memory repositories");

    buildingsRepository = createBuildingsMemoryRepository();
    roomsRepository = createRoomsMemoryRepository();
    reservationsRepository = createReservationsMemoryRepository();
} else {
    console.log("Using PostgreSQL repositories");

    const knexConfig = require("../knexfile");
    knex = require("knex")(knexConfig.development);

    buildingsRepository = createBuildingsKnexRepository(knex);
    roomsRepository = createRoomsKnexRepository(knex);
    reservationsRepository = createReservationsKnexRepository(knex);
}

const app = createApp({
    buildingsRepository,
    roomsRepository,
    reservationsRepository
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

function shutdown() {
    server.close(async () => {
        if (knex) {
            await knex.destroy();
        }

        process.exit(0);
    });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);