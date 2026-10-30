const express = require("express");

const createBuildingsRoutes = require("./modules/buildings/buildings.routes");
const createRoomsRoutes = require("./modules/rooms/rooms.routes");
const createReservationsRoutes = require("./modules/reservations/reservations.routes");

const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");
const NotFoundError = require("./errors/NotFoundError");

function createApp({
                       buildingsRepository,
                       roomsRepository,
                       reservationsRepository
                   }) {
    const app = express();

    app.use(requestLogger);
    app.use(express.json());

    app.use(
        "/api/buildings",
        createBuildingsRoutes(buildingsRepository)
    );

    app.use(
        "/api/rooms",
        createRoomsRoutes(roomsRepository, buildingsRepository)
    );

    app.use(
        "/api/reservations",
        createReservationsRoutes(reservationsRepository, roomsRepository)
    );

    app.use((req, res, next) => {
        next(new NotFoundError("Route not found"));
    });

    app.use(errorHandler);

    return app;
}

module.exports = { createApp };