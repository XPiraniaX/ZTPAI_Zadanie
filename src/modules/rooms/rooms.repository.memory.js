function createRoomsRepository() {
    const rooms = [
        { id: 1, name: "S1", capacity: 30 },
        { id: 2, name: "S2", capacity: 50 },
        { id: 3, name: "S3", capacity: 12 },
        { id: 4, name: "S4", capacity: 15 }
    ];

    return {
        async findAll() {
            return rooms.map(room => ({ ...room }));
        },

        async findById(id) {
            const room = rooms.find(room => room.id === Number(id));
            return room ? { ...room } : null;
        }
    };
}

module.exports = { createRoomsRepository };
