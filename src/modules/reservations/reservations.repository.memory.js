function createReservationsRepository(roomsRepository, usersRepository) {
    const reservations = [];

    let nextId = 1;

    async function mapReservation(reservation) {
        if (!reservation) return null;

        const room = await roomsRepository.findById(reservation.roomId);
        const user = await usersRepository.findById(reservation.userId);

        return {
            ...reservation,
            user: user
                ? {
                    id: user.id,
                    email: user.email
                }
                : null,
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
        async findAll(filters = {}) {
            let filtered = [...reservations];

            if (filters.roomId !== undefined) {
                filtered = filtered.filter(
                    item => item.roomId === Number(filters.roomId)
                );
            }

            if (filters.buildingId !== undefined) {
                const rooms = await Promise.all(
                    filtered.map(item =>
                        roomsRepository.findById(item.roomId)
                    )
                );

                filtered = filtered.filter((item, index) =>
                    rooms[index]?.building?.id === Number(filters.buildingId)
                );
            }

            if (filters.status !== undefined) {
                filtered = filtered.filter(
                    item => item.status === filters.status
                );
            }

            if (filters.from !== undefined) {
                const from = new Date(filters.from).getTime();

                filtered = filtered.filter(
                    item => new Date(item.endTime).getTime() > from
                );
            }

            if (filters.to !== undefined) {
                const to = new Date(filters.to).getTime();

                filtered = filtered.filter(
                    item => new Date(item.startTime).getTime() < to
                );
            }

            const total = filtered.length;

            const sortField = filters.sort || "startTime";
            const descending = sortField.startsWith("-");
            const sortName = descending
                ? sortField.substring(1)
                : sortField;

            const sortProperties = {
                startTime: "startTime",
                createdAt: "createdAt",
                participants: "participants"
            };

            const property = sortProperties[sortName];

            if (!property) {
                throw new Error("Unsupported reservation sort column");
            }

            filtered.sort((a, b) => {
                let comparison;

                if (property === "participants") {
                    comparison = a[property] - b[property];
                } else {
                    comparison =
                        new Date(a[property]).getTime() -
                        new Date(b[property]).getTime();
                }

                if (descending) comparison *= -1;

                return comparison !== 0
                    ? comparison
                    : a.id - b.id;
            });

            const page = filters.page || 1;
            const limit = filters.limit || 20;
            const offset = (page - 1) * limit;

            const pageItems = filtered.slice(offset, offset + limit);

            return {
                data: await Promise.all(pageItems.map(mapReservation)),
                total
            };
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
                userId: Number(data.userId),
                participants: data.participants,
                startTime: new Date(data.startTime).toISOString(),
                endTime: new Date(data.endTime).toISOString(),
                status: "CONFIRMED",
                createdAt: new Date().toISOString(),
                cancelledAt: null
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