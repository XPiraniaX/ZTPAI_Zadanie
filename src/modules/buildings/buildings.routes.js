const express = require("express");
const authorize = require("../../middleware/authorize");

const createBuildingsController = require("./buildings.controller");

const {
    createBuildingSchema,
    updateBuildingSchema,
    buildingIdSchema
} = require("./buildings.schemas");

function createBuildingsRoutes(buildingsRepository, roomsRepository) {
    const router = express.Router();

    const controller = createBuildingsController(
        buildingsRepository,
        roomsRepository
    );

    function validateId(req, res, next) {
        const result = buildingIdSchema.safeParse(req.params);

        if (!result.success) {
            return res.status(400).json({
                error: "Validation failed",
                details: result.error.issues
            });
        }

        req.params.id = String(result.data.id);
        next();
    }

    function validateBody(schema) {
        return (req, res, next) => {
            const result = schema.safeParse(req.body);

            if (!result.success) {
                return res.status(400).json({
                    error: "Validation failed",
                    details: result.error.issues
                });
            }

            req.body = result.data;
            next();
        };
    }

    // GET – każdy zalogowany użytkownik
    router.get("/", controller.getAllBuildings);

    router.get("/:id/rooms", validateId, controller.getRoomsByBuildingId);

    router.get("/:id", validateId, controller.getBuildingById);

    // POST – tylko ADMIN
    router.post(
        "/",
        authorize("ADMIN"),
        validateBody(createBuildingSchema),
        controller.createBuilding
    );

    // PATCH – tylko ADMIN
    router.patch(
        "/:id",
        authorize("ADMIN"),
        validateId,
        validateBody(updateBuildingSchema),
        controller.updateBuilding
    );

    // DELETE – tylko ADMIN
    router.delete(
        "/:id",
        authorize("ADMIN"),
        validateId,
        controller.deleteBuilding
    );

    return router;
}

module.exports = createBuildingsRoutes;