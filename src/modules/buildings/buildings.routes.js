const express = require("express");
const authorize = require("../../middleware/authorize");
const validate = require("../../middleware/validate");

const createBuildingsController = require("./buildings.controller");

const {
    createBuildingSchema,
    updateBuildingSchema,
    buildingIdSchema
} = require("./buildings.schemas");

/**
 * @swagger
 * /api/buildings:
 *   get:
 *     tags:
 *       - Buildings
 *     summary: Pobranie listy budynków
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista budynków.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Building'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   post:
 *     tags:
 *       - Buildings
 *     summary: Utworzenie budynku (ADMIN)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BuildingInput'
 *     responses:
 *       201:
 *         description: Budynek został utworzony.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Building'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /api/buildings/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *       description: Identyfikator budynku.
 *
 *   get:
 *     tags:
 *       - Buildings
 *     summary: Pobranie szczegółów budynku
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Szczegóły budynku.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Building'
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
 *       - Buildings
 *     summary: Aktualizacja budynku (ADMIN)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BuildingPatch'
 *     responses:
 *       200:
 *         description: Budynek został zaktualizowany.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Building'
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
 *       - Buildings
 *     summary: Usunięcie budynku (ADMIN)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Budynek został usunięty.
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
 * /api/buildings/{id}/rooms:
 *   get:
 *     tags:
 *       - Buildings
 *     summary: Pobranie sal należących do budynku
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Identyfikator budynku.
 *     responses:
 *       200:
 *         description: Lista sal w budynku.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Room'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

function createBuildingsRoutes(buildingsRepository, roomsRepository) {
    const router = express.Router();

    const controller = createBuildingsController(
        buildingsRepository,
        roomsRepository
    );

    const validateId = validate({
        params: buildingIdSchema
    });

    router.get("/", controller.getAllBuildings);

    router.get(
        "/:id/rooms",
        validateId,
        controller.getRoomsByBuildingId
    );

    router.get(
        "/:id",
        validateId,
        controller.getBuildingById
    );

    router.post(
        "/",
        authorize("ADMIN"),
        validate({ body: createBuildingSchema }),
        controller.createBuilding
    );

    router.patch(
        "/:id",
        authorize("ADMIN"),
        validateId,
        validate({ body: updateBuildingSchema }),
        controller.updateBuilding
    );

    router.delete(
        "/:id",
        authorize("ADMIN"),
        validateId,
        controller.deleteBuilding
    );

    return router;
}

module.exports = createBuildingsRoutes;
