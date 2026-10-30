function createRoomsRepository() {
    const rooms = [
        { id: 1, buildingId: 1, name: "101", capacity: 30 },
        { id: 2, buildingId: 1, name: "102", capacity: 20 },
        { id: 3, buildingId: 1, name: "103", capacity: 15 },
        { id: 4, buildingId: 2, name: "101", capacity: 40 },
        { id: 5, buildingId: 2, name: "102", capacity: 25 }
    ];

    let nextId = 6;

    return {
        async findAll() {
            return rooms.map(room => ({ ...room }));
        },

        async findById(id) {
            const room = rooms.find(room => room.id === Number(id));

            return room ? { ...room } : null;
        },

        async create(data) {
            const room = {
                id: nextId++,
                buildingId: data.buildingId,
                name: data.name,
                capacity: data.capacity
            };

            rooms.push(room);

            return { ...room };
        }
    };
}

module.exports = { createRoomsRepository };