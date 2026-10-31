const express = require("express");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("./docs/swagger");

const createAuthRoutes = require("./modules/auth/auth.routes");
const createBuildingsRoutes = require("./modules/buildings/buildings.routes");
const createRoomsRoutes = require("./modules/rooms/rooms.routes");
const createReservationsRoutes = require("./modules/reservations/reservations.routes");

const authenticate = require("./middleware/authenticate");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");

const NotFoundError = require("./errors/NotFoundError");

function createApp({
                       usersRepository,
                       buildingsRepository,
                       roomsRepository,
                       reservationsRepository
                   }) {
    const app = express();

    app.use(requestLogger);
    app.use(express.json());

    // Dokumentacja OpenAPI - publicznie dostępna
    app.get("/api/openapi.json", (req, res) => {
        res.json(swaggerSpec);
    });

    // Swagger UI
    app.use(
        "/api/docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, {
            explorer: true,
            persistAuthorization: true,
            swaggerOptions: {
                displayRequestDuration: true,
                docExpansion: "list"
            }
        })
    );

    // Publiczne endpointy autoryzacji
    app.use(
        "/api/auth",
        createAuthRoutes(usersRepository)
    );

    // Globalna autoryzacja pozostałych endpointów
    app.use((req, res, next) => {
        return authenticate(req, res, next);
    });

    // Buildings
    app.use(
        "/api/buildings",
        createBuildingsRoutes(
            buildingsRepository,
            roomsRepository
        )
    );

    // Rooms
    app.use(
        "/api/rooms",
        createRoomsRoutes(
            roomsRepository,
            buildingsRepository
        )
    );

    // Reservations
    app.use(
        "/api/reservations",
        createReservationsRoutes(
            reservationsRepository,
            roomsRepository
        )
    );

    // Nieznana trasa
    app.use((req, res, next) => {
        next(new NotFoundError("Route not found"));
    });

    // Globalna obsługa błędów
    app.use(errorHandler);

    return app;
}

module.exports = { createApp };
