const NotFoundError = require("../../errors/NotFoundError");

function createRoomsService(roomsRepository) {
    return {
        async getAllRooms() {
            return roomsRepository.findAll();
        },

        async getRoomById(id) {
            const room = await roomsRepository.findById(id);

            if (!room) {
                throw new NotFoundError("Room not found");
            }

            return room;
        }
    };
}

module.exports = { createRoomsService };
