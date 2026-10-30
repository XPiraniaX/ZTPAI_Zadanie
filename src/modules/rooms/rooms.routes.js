const express = require("express");
const createRoomsController = require("./rooms.controller");
const {
    roomIdSchema,
    createRoomSchema
} = require("./rooms.schemas");

function createRoomsRoutes(roomsRepository, buildingsRepository) {
    const router = express.Router();

    const controller = createRoomsController(
        roomsRepository,
        buildingsRepository
    );

    router.get("/", controller.getAllRooms);

    router.get("/:id", (req, res, next) => {
        const result = roomIdSchema.safeParse(req.params);

        if (!result.success) {
            return res.status(400).json({
                error: "Validation failed",
                details: result.error.issues
            });
        }

        next();
    }, controller.getRoomById);

    router.post("/", (req, res, next) => {
        const result = createRoomSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: "Validation failed",
                details: result.error.issues
            });
        }

        req.body = result.data;
        next();
    }, controller.createRoom);

    return router;
}

module.exports = createRoomsRoutes;