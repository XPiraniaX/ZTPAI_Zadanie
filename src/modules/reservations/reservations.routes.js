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

/**
 * @swagger
 * /api/reservations:
 *   get:
 *     tags:
 *       - Reservations
 *     summary: Pobranie listy rezerwacji
 *     description: USER widzi wyłącznie swoje rezerwacje. ADMIN może przeglądać wszystkie i filtrować je po userId.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Filtr użytkownika dostępny dla ADMIN. Dla USER parametr jest ignorowany.
 *       - in: query
 *         name: roomId
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: buildingId
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 20
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Pole i kierunek sortowania zgodne ze schematem zapytań.
 *     responses:
 *       200:
 *         description: Lista rezerwacji z informacją o paginacji.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationList'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   post:
 *     tags:
 *       - Reservations
 *     summary: Utworzenie rezerwacji
 *     description: Tworzy rezerwację dla zalogowanego użytkownika. Obowiązują reguły pojemności sali i kolizji terminów.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservationInput'
 *     responses:
 *       201:
 *         description: Rezerwacja została utworzona.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /api/reservations/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *       description: Identyfikator rezerwacji.
 *
 *   get:
 *     tags:
 *       - Reservations
 *     summary: Pobranie szczegółów rezerwacji
 *     description: Dostęp ma właściciel rezerwacji lub ADMIN. Inny USER otrzymuje 404.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Szczegóły rezerwacji.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /api/reservations/{id}/cancel:
 *   patch:
 *     tags:
 *       - Reservations
 *     summary: Anulowanie rezerwacji
 *     description: Anulować może właściciel rezerwacji lub ADMIN. Nie można anulować rozpoczętej rezerwacji.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Identyfikator rezerwacji.
 *     responses:
 *       200:
 *         description: Rezerwacja została anulowana.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

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
