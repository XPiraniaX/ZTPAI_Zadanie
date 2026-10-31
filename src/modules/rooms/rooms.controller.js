const { createRoomsService } = require("./rooms.service");

function createRoomsController(roomsRepository, buildingsRepository) {
    const roomsService = createRoomsService(
        roomsRepository,
        buildingsRepository
    );

    async function getAllRooms(req, res, next) {
        try {
            const rooms = await roomsService.getAllRooms();
            res.status(200).json(rooms);
        } catch (error) {
            next(error);
        }
    }

    async function getRoomById(req, res, next) {
        try {
            const room = await roomsService.getRoomById(req.params.id);
            res.status(200).json(room);
        } catch (error) {
            next(error);
        }
    }

    async function createRoom(req, res, next) {
        try {
            const room = await roomsService.createRoom(req.body);
            res.status(201).json(room);
        } catch (error) {
            next(error);
        }
    }

    async function updateRoom(req, res, next) {
        try {
            const room = await roomsService.updateRoom(
                req.params.id,
                req.body
            );

            res.status(200).json(room);
        } catch (error) {
            next(error);
        }
    }

    async function deleteRoom(req, res, next) {
        try {
            const result = await roomsService.deleteRoom(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    return {
        getAllRooms,
        getRoomById,
        createRoom,
        updateRoom,
        deleteRoom
    };
}

module.exports = createRoomsController;