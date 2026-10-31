const express = require("express");
const authorize = require("../../middleware/authorize");

const createRoomsController = require("./rooms.controller");

const {
    roomIdSchema,
    createRoomSchema,
    updateRoomSchema
} = require("./rooms.schemas");

function createRoomsRoutes(roomsRepository, buildingsRepository) {
    const router = express.Router();

    const controller = createRoomsController(
        roomsRepository,
        buildingsRepository
    );

    function validateId(req, res, next) {
        const result = roomIdSchema.safeParse(req.params);

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
    router.get("/", controller.getAllRooms);

    router.get("/:id", validateId, controller.getRoomById);

    // POST – tylko ADMIN
    router.post(
        "/",
        authorize("ADMIN"),
        validateBody(createRoomSchema),
        controller.createRoom
    );

    // PATCH – tylko ADMIN
    router.patch(
        "/:id",
        authorize("ADMIN"),
        validateId,
        validateBody(updateRoomSchema),
        controller.updateRoom
    );

    // DELETE – tylko ADMIN
    router.delete(
        "/:id",
        authorize("ADMIN"),
        validateId,
        controller.deleteRoom
    );

    return router;
}

module.exports = createRoomsRoutes;