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
    reservationQuerySchema
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
        validate({ query: reservationQuerySchema }),
        controller.getAll
    );

    router.get(
        "/:id",
        validate({ params: reservationIdSchema }),
        controller.getById
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