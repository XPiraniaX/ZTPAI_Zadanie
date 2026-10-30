const express = require("express");
const createBuildingsController = require("./buildings.controller");
const {
    createBuildingSchema,
    buildingIdSchema
} = require("./buildings.schemas");

function createBuildingsRoutes(buildingsRepository, roomsRepository) {
    const router = express.Router();
    const controller = createBuildingsController(
        buildingsRepository,
        roomsRepository
    );

    router.get("/", controller.getAllBuildings);

    router.get("/:id/rooms", (req, res, next) => {
        const result = buildingIdSchema.safeParse(req.params);

        if (!result.success) {
            return res.status(400).json({
                error: "Validation failed",
                details: result.error.issues
            });
        }

        req.params.id = String(result.data.id);
        next();
    }, controller.getRoomsByBuildingId);

    router.get("/:id", (req, res, next) => {
        const result = buildingIdSchema.safeParse(req.params);

        if (!result.success) {
            return res.status(400).json({
                error: "Validation failed",
                details: result.error.issues
            });
        }

        req.params.id = String(result.data.id);
        next();
    }, controller.getBuildingById);

    router.post("/", (req, res, next) => {
        const result = createBuildingSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: "Validation failed",
                details: result.error.issues
            });
        }

        req.body = result.data;
        next();
    }, controller.createBuilding);

    return router;
}

module.exports = createBuildingsRoutes;
