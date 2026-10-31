const express = require("express");
const authorize = require("../../middleware/authorize");
const validate = require("../../middleware/validate");

const createRoomsController = require("./rooms.controller");

const {
    roomIdSchema,
    createRoomSchema,
    updateRoomSchema
} = require("./rooms.schemas");

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     tags:
 *       - Rooms
 *     summary: Pobranie listy sal
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista sal.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Room'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   post:
 *     tags:
 *       - Rooms
 *     summary: Utworzenie sali (ADMIN)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoomInput'
 *     responses:
 *       201:
 *         description: Sala została utworzona.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /api/rooms/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *       description: Identyfikator sali.
 *
 *   get:
 *     tags:
 *       - Rooms
 *     summary: Pobranie szczegółów sali
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Szczegóły sali.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   patch:
 *     tags:
 *       - Rooms
 *     summary: Aktualizacja sali (ADMIN)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoomPatch'
 *     responses:
 *       200:
 *         description: Sala została zaktualizowana.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   delete:
 *     tags:
 *       - Rooms
 *     summary: Usunięcie sali (ADMIN)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sala została usunięta.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

function createRoomsRoutes(roomsRepository, buildingsRepository) {
    const router = express.Router();

    const controller = createRoomsController(
        roomsRepository,
        buildingsRepository
    );

    const validateId = validate({
        params: roomIdSchema
    });

    router.get("/", controller.getAllRooms);

    router.get(
        "/:id",
        validateId,
        controller.getRoomById
    );

    router.post(
        "/",
        authorize("ADMIN"),
        validate({ body: createRoomSchema }),
        controller.createRoom
    );

    router.patch(
        "/:id",
        authorize("ADMIN"),
        validateId,
        validate({ body: updateRoomSchema }),
        controller.updateRoom
    );

    router.delete(
        "/:id",
        authorize("ADMIN"),
        validateId,
        controller.deleteRoom
    );

    return router;
}

module.exports = createRoomsRoutes;
