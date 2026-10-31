const NotFoundError = require("../../errors/NotFoundError");
const ConflictError = require("../../errors/ConflictError");

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

    async function updateRoom(id, data) {
        await getRoomById(id);

        if (data.buildingId !== undefined) {
            const building = await buildingsRepository.findById(
                data.buildingId
            );

            if (!building) {
                throw new NotFoundError("Building not found");
            }
        }

        return roomsRepository.update(id, data);
    }

    async function deleteRoom(id) {
        await getRoomById(id);

        try {
            await roomsRepository.delete(id);
        } catch (error) {
            if (error.code === "23503") {
                throw new ConflictError(
                    "Room cannot be deleted because it has reservations",
                    "ROOM_IN_USE"
                );
            }

            throw error;
        }

        return { message: "Room deleted successfully" };
    }

    return {
        getAllRooms,
        getRoomById,
        createRoom,
        updateRoom,
        deleteRoom
    };
}

module.exports = { createRoomsService };