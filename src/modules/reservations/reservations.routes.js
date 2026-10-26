const express = require("express");
const {
    createReservationsService
} = require("./reservations.service");
const {
    createReservationsController
} = require("./reservations.controller");
const validate = require("../../middleware/validate");
const {
    createReservationSchema,
    reservationIdSchema,
    roomIdQuerySchema
} = require("./reservations.schemas");

function createReservationsRoutes(
    reservationsRepository,
    roomsRepository
) {
    const router = express.Router();

    const service = createReservationsService(
        reservationsRepository,
        roomsRepository
    );

    const controller = createReservationsController(service);

    router.get(
        "/",
        validate({ query: roomIdQuerySchema }),
        controller.getAll
    );

    router.post(
        "/",
        validate({ body: createReservationSchema }),
        controller.create
    );

    router.patch(
        "/:id/cancel",
        validate({ params: reservationIdSchema }),
        controller.cancel
    );

    return router;
}

module.exports = createReservationsRoutes;