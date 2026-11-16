const config = require("./config");

const { createApp } = require("./app");

// Repozytoria in-memory
const { createUsersRepository: createUsersMemoryRepository } =
    require("./modules/users/users.repository.memory");

const { createBuildingsRepository: createBuildingsMemoryRepository } =
    require("./modules/buildings/buildings.repository.memory");

const { createRoomsRepository: createRoomsMemoryRepository } =
    require("./modules/rooms/rooms.repository.memory");

const { createReservationsRepository: createReservationsMemoryRepository } =
    require("./modules/reservations/reservations.repository.memory");

// Repozytoria Knex
const { createUsersRepository: createUsersKnexRepository } =
    require("./modules/users/users.repository.knex");

const { createBuildingsRepository: createBuildingsKnexRepository } =
    require("./modules/buildings/buildings.repository.knex");

const { createRoomsRepository: createRoomsKnexRepository } =
    require("./modules/rooms/rooms.repository.knex");

const { createReservationsRepository: createReservationsKnexRepository } =
    require("./modules/reservations/reservations.repository.knex");

const { EventBus } = require("./events/eventBus");
const { registerEventListeners } =
    require("./events/registerEventListeners");

const {
    createAuditLogRepository
} = require("./modules/auditLog/auditLog.repository.knex");

let knex;
let usersRepository;
let buildingsRepository;
let roomsRepository;
let reservationsRepository;
let auditLogRepository;

// Wybór sposobu przechowywania danych
if (config.STORAGE === "memory") {
    console.log("Using in-memory repositories");

    usersRepository = createUsersMemoryRepository();
    buildingsRepository = createBuildingsMemoryRepository();

    roomsRepository = createRoomsMemoryRepository(
        buildingsRepository
    );

    reservationsRepository = createReservationsMemoryRepository(
        roomsRepository,
        usersRepository
    );
} else {
    console.log("Using PostgreSQL repositories");

    const knexConfig = require("../knexfile");

    knex = require("knex")(knexConfig.development);

    usersRepository = createUsersKnexRepository(knex);
    buildingsRepository = createBuildingsKnexRepository(knex);
    roomsRepository = createRoomsKnexRepository(knex);

    reservationsRepository = createReservationsKnexRepository(knex);
    auditLogRepository = createAuditLogRepository(knex);
}

// Event Bus
const eventBus = new EventBus();

if (auditLogRepository) {
    registerEventListeners({
        eventBus,
        auditLogRepository,
        reservationsRepository
    });

    console.log("Event listeners registered.");
}

// Utworzenie aplikacji Express
const app = createApp({
    usersRepository,
    buildingsRepository,
    roomsRepository,
    reservationsRepository,
    eventBus,
    auditLogRepository
});

// Uruchomienie serwera
const server = app.listen(config.PORT, () => {
    console.log(`Server running on http://localhost:${config.PORT}`);
});

// Bezpieczne zamykanie aplikacji
let isShuttingDown = false;

async function shutdown(signal) {
    if (isShuttingDown) {
        return;
    }

    isShuttingDown = true;
    console.log(`Received ${signal}. Starting graceful shutdown...`);

    server.close(async (error) => {
        if (error) {
            console.error("Error while closing HTTP server:", error);
            process.exitCode = 1;
        }

        try {
            if (knex) {
                await knex.destroy();
                console.log("Database connection pool closed.");
            }

            console.log("Graceful shutdown completed.");
        } catch (dbError) {
            console.error("Error while closing database pool:", dbError);
            process.exitCode = 1;
        }
    });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
