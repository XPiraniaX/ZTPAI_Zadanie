
const { createReservationsService } = require("../../src/modules/reservations/reservations.service");
const { createReservationsRepository } = require("../../src/modules/reservations/reservations.repository.memory");
const { createRoomsRepository } = require("../../src/modules/rooms/rooms.repository.memory");

const FIXED_NOW = new Date("2026-11-16T12:00:00.000Z");

const user = {
    id: 1,
    email: "user@example.com",
    role: "USER"
};

const anotherUser = {
    id: 2,
    email: "another@example.com",
    role: "USER"
};

const admin = {
    id: 3,
    email: "admin@example.com",
    role: "ADMIN"
};

function createTestContext() {
    const roomsRepository = createRoomsRepository();

    const users = [user, anotherUser, admin];

    const usersRepository = {
        async findById(id) {
            return users.find(
                item => item.id === Number(id)
            ) || null;
        }
    };

    const reservationsRepository = createReservationsRepository(
        roomsRepository,
        usersRepository
    );

    const service = createReservationsService(
        reservationsRepository,
        roomsRepository,
        () => new Date(FIXED_NOW)
    );

    return {
        service,
        roomsRepository,
        reservationsRepository
    };
}

function validReservation(overrides = {}) {
    return {
        roomId: 1,
        participants: 10,
        startTime: "2026-11-16T14:00:00.000Z",
        endTime: "2026-11-16T15:00:00.000Z",
        ...overrides
    };
}

async function expectErrorCode(promise, expectedCode) {
    await expect(promise).rejects.toHaveProperty(
        "code",
        expectedCode
    );
}

describe("Reservations service - unit tests", () => {

    // 1. Częściowe nakładanie się rezerwacji
    test("rejects partially overlapping reservations", async () => {
        const { service } = createTestContext();

        await service.createReservation(
            validReservation(),
            user.id
        );

        await expectErrorCode(
            service.createReservation(
                validReservation({
                    startTime: "2026-11-16T14:30:00.000Z",
                    endTime: "2026-11-16T15:30:00.000Z"
                }),
                anotherUser.id
            ),
            "ROOM_ALREADY_BOOKED"
        );
    });

    // 2. Zawieranie się przedziałów
    test("rejects reservations contained within another reservation", async () => {
        const { service } = createTestContext();

        await service.createReservation(
            validReservation({
                startTime: "2026-11-16T14:00:00.000Z",
                endTime: "2026-11-16T16:00:00.000Z"
            }),
            user.id
        );

        await expectErrorCode(
            service.createReservation(
                validReservation({
                    startTime: "2026-11-16T14:30:00.000Z",
                    endTime: "2026-11-16T15:30:00.000Z"
                }),
                anotherUser.id
            ),
            "ROOM_ALREADY_BOOKED"
        );
    });

    // 3. Przedziały stykające się są dozwolone
    test("allows reservations that touch at their boundaries", async () => {
        const { service } = createTestContext();

        await service.createReservation(
            validReservation({
                startTime: "2026-11-16T14:00:00.000Z",
                endTime: "2026-11-16T15:00:00.000Z"
            }),
            user.id
        );

        const reservation = await service.createReservation(
            validReservation({
                startTime: "2026-11-16T15:00:00.000Z",
                endTime: "2026-11-16T16:00:00.000Z"
            }),
            anotherUser.id
        );

        expect(reservation.status).toBe("CONFIRMED");
    });

    // 4. Rezerwacje w różnych salach są dozwolone
    test("allows reservations in different rooms at the same time", async () => {
        const { service } = createTestContext();

        await service.createReservation(
            validReservation({ roomId: 1 }),
            user.id
        );

        const reservation = await service.createReservation(
            validReservation({ roomId: 2 }),
            anotherUser.id
        );

        expect(reservation.roomId).toBe(2);
    });

    // 5. Anulowana rezerwacja nie blokuje terminu
    test("CANCELLED reservation does not block the time slot", async () => {
        const { service, reservationsRepository } = createTestContext();

        const existing = await service.createReservation(
            validReservation(),
            user.id
        );

        await reservationsRepository.update(existing.id, {
            status: "CANCELLED",
            cancelledAt: "2026-11-16T11:00:00.000Z"
        });

        const reservation = await service.createReservation(
            validReservation(),
            anotherUser.id
        );

        expect(reservation.status).toBe("CONFIRMED");
    });

    // 6. Pojemność sali
    test.each([
        {
            participants: 30,
            expected: "allowed"
        },
        {
            participants: 31,
            expected: "rejected"
        }
    ])(
        "room capacity: $participants participants ($expected)",
        async ({ participants, expected }) => {
            const { service } = createTestContext();

            const operation = service.createReservation(
                validReservation({
                    roomId: 1,
                    participants
                }),
                user.id
            );

            if (expected === "allowed") {
                await expect(operation).resolves.toMatchObject({
                    participants,
                    status: "CONFIRMED"
                });
            } else {
                await expectErrorCode(operation, "CONFLICT");
            }
        }
    );

    // 7. Dopuszczalny czas trwania rezerwacji
    test.each([
        {
            duration: "15 minutes",
            startTime: "2026-11-16T14:00:00.000Z",
            endTime: "2026-11-16T14:15:00.000Z",
            allowed: true
        },
        {
            duration: "14 minutes",
            startTime: "2026-11-16T14:00:00.000Z",
            endTime: "2026-11-16T14:14:00.000Z",
            allowed: false
        },
        {
            duration: "8 hours and 1 minute",
            startTime: "2026-11-16T14:00:00.000Z",
            endTime: "2026-11-16T22:01:00.000Z",
            allowed: false
        }
    ])(
        "reservation duration: $duration (allowed=$allowed)",
        async ({ startTime, endTime, allowed }) => {
            const { service } = createTestContext();

            const operation = service.createReservation(
                validReservation({ startTime, endTime }),
                user.id
            );

            if (allowed) {
                await expect(operation).resolves.toMatchObject({
                    status: "CONFIRMED"
                });
            } else {
                await expectErrorCode(
                    operation,
                    "VALIDATION_ERROR"
                );
            }
        }
    );

    // 8. Nie można anulować rozpoczętej rezerwacji
    test("rejects cancellation of a reservation that has already started", async () => {
        const { service, reservationsRepository } = createTestContext();

        const reservation = await reservationsRepository.create({
            roomId: 1,
            userId: user.id,
            participants: 10,
            startTime: "2026-11-16T11:30:00.000Z",
            endTime: "2026-11-16T13:30:00.000Z"
        });

        await expectErrorCode(
            service.cancelReservation(reservation.id, user),
            "RESERVATION_ALREADY_STARTED"
        );
    });

    // 9. Podwójne anulowanie jest idempotentne
    test("double cancellation is idempotent and preserves cancelledAt", async () => {
        const { service } = createTestContext();

        const reservation = await service.createReservation(
            validReservation(),
            user.id
        );

        const firstCancellation = await service.cancelReservation(
            reservation.id,
            user
        );

        const secondCancellation = await service.cancelReservation(
            reservation.id,
            user
        );

        expect(firstCancellation.status).toBe("CANCELLED");
        expect(secondCancellation.status).toBe("CANCELLED");

        expect(secondCancellation.cancelledAt).toBe(
            firstCancellation.cancelledAt
        );
    });

    // 10. USER nie może anulować cudzej rezerwacji
    test("rejects cancellation of another user's reservation", async () => {
        const { service } = createTestContext();

        const reservation = await service.createReservation(
            validReservation(),
            user.id
        );

        await expectErrorCode(
            service.cancelReservation(reservation.id, anotherUser),
            "NOT_FOUND"
        );
    });

    // 11. ADMIN może anulować cudzą rezerwację
    test("allows ADMIN to cancel another user's reservation", async () => {
        const { service } = createTestContext();

        const reservation = await service.createReservation(
            validReservation(),
            user.id
        );

        const cancelled = await service.cancelReservation(
            reservation.id,
            admin
        );

        expect(cancelled.status).toBe("CANCELLED");
    });

    // 12. Nie można utworzyć rezerwacji dla nieistniejącej sali
    test("rejects reservation for a non-existing room", async () => {
        const { service } = createTestContext();

        await expectErrorCode(
            service.createReservation(
                validReservation({ roomId: 999 }),
                user.id
            ),
            "NOT_FOUND"
        );
    });
});
