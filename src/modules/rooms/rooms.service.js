const NotFoundError = require("../../errors/NotFoundError");

function createRoomsService(roomsRepository, buildingsRepository) {
    async function getAllRooms() {
        return roomsRepository.findAll();
    }

    async function getRoomById(id) {
        const room = await roomsRepository.findById(id);

        if (!room) {
            throw new NotFoundError("Room not found");
        }

        return room;
    }

    async function createRoom(data) {
        const building = await buildingsRepository.findById(data.buildingId);

        if (!building) {
            throw new NotFoundError("Building not found");
        }

        return roomsRepository.create(data);
    }

    return {
        getAllRooms,
        getRoomById,
        createRoom
    };
}

module.exports = { createRoomsService };