const express = require("express");
const { createRoomsService } = require("./rooms.service");
const { createRoomsController } = require("./rooms.controller");
const validate = require("../../middleware/validate");
const { roomIdSchema } = require("./rooms.schemas");

function createRoomsRoutes(roomsRepository) {
    const router = express.Router();

    const service = createRoomsService(roomsRepository);
    const controller = createRoomsController(service);

    router.get("/", controller.getAllRooms);

    router.get(
        "/:id",
        validate({ params: roomIdSchema }),
        controller.getRoomById
    );

    return router;
}

module.exports = createRoomsRoutes;