
const {
    toRoomResponse
} = require("./rooms.mapper");

function createRoomsController(roomsService) {
    return {
        async getAllRooms(req, res) {
            const rooms = await roomsService.getAllRooms();
            res.json(rooms.map(toRoomResponse));
        },

        async getRoomById(req, res) {
            const room = await roomsService.getRoomById(
                req.validated.params.id
            );

            res.json(toRoomResponse(room));
        }
    };
}

module.exports = { createRoomsController };
