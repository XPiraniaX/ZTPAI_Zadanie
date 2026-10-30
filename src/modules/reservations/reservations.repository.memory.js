function createReservationsRepository(roomsRepository) {
    const reservations = [
        {
            id: 1,
            roomId: 1,
            reservedBy: "Rezerwacja rozpoczęta - seed",
            participants: 2,
            startTime: "2020-01-01T10:00:00.000Z",
            endTime: "2020-01-01T11:00:00.000Z",
            status: "CONFIRMED",
            createdAt: "2019-12-01T10:00:00.000Z",
            cancelledAt: null,
            internalNote: "created via API v2"
        }
    ];

    let nextId = 2;

    async function mapReservation(reservation) {
        if (!reservation) return null;

        const room = await roomsRepository.findById(reservation.roomId);

        return {
            ...reservation,
            room: room
                ? {
                    id: room.id,
                    name: room.name,
                    building: room.building
                }
                : null
        };
    }

    return {
        async findAll() {
            return Promise.all(reservations.map(mapReservation));
        },

        async findById(id) {
            const reservation = reservations.find(
                item => item.id === Number(id)
            );

            return mapReservation(reservation);
        },

        async findByRoomId(roomId) {
            return reservations
                .filter(item => item.roomId === Number(roomId))
                .map(item => ({ ...item }));
        },

        async create(data) {
            const reservation = {
                id: nextId++,
                roomId: Number(data.roomId),
                reservedBy: data.reservedBy,
                participants: data.participants,
                startTime: new Date(data.startTime).toISOString(),
                endTime: new Date(data.endTime).toISOString(),
                status: "CONFIRMED",
                createdAt: new Date().toISOString(),
                cancelledAt: null,
                internalNote: "created via API v2"
            };

            reservations.push(reservation);

            return mapReservation(reservation);
        },

        async update(id, changes) {
            const reservation = reservations.find(
                item => item.id === Number(id)
            );

            if (!reservation) return null;

            Object.assign(reservation, changes);

            return mapReservation(reservation);
        }
    };
}

module.exports = { createReservationsRepository };
