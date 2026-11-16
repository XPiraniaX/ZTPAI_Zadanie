const request = require("supertest");
const knexFactory = require("knex");

const knexConfig = require("../../knexfile");
const { createApp } = require("../../src/app");

const {
    createUsersRepository
} = require("../../src/modules/users/users.repository.knex");

const {
    createBuildingsRepository
} = require("../../src/modules/buildings/buildings.repository.knex");

const {
    createRoomsRepository
} = require("../../src/modules/rooms/rooms.repository.knex");

const {
    createReservationsRepository
} = require("../../src/modules/reservations/reservations.repository.knex");

const {
    createAuditLogRepository
} = require("../../src/modules/auditLog/auditLog.repository.knex");

const { EventBus } = require("../../src/events/eventBus");

const {
    registerEventListeners
} = require("../../src/events/registerEventListeners");

const db = knexFactory(knexConfig.test);

const auditLogRepository = createAuditLogRepository(db);
const reservationsRepository = createReservationsRepository(db);
const eventBus = new EventBus();

registerEventListeners({
    eventBus,
    auditLogRepository,
    reservationsRepository
});

const app = createApp({
    usersRepository: createUsersRepository(db),
    buildingsRepository: createBuildingsRepository(db),
    roomsRepository: createRoomsRepository(db),
    reservationsRepository,
    auditLogRepository,
    eventBus
});

const PASSWORD = "IntegrationTest123!";

let buildingId;
let roomId;

async function registerAndLogin(email) {
    const registration = await request(app)
        .post("/api/auth/register")
        .send({
            email,
            password: PASSWORD
        });

    expect(registration.status).toBe(201);

    const login = await request(app)
        .post("/api/auth/login")
        .send({
            email,
            password: PASSWORD
        });

    expect(login.status).toBe(200);
    expect(login.body.accessToken).toBeDefined();

    return {
        user: registration.body,
        token: login.body.accessToken
    };
}

async function registerAdminAndLogin(email) {
    const { user } = await registerAndLogin(email);

    await db("users")
        .where({ id: user.id })
        .update({ role: "ADMIN" });

    const login = await request(app)
        .post("/api/auth/login")
        .send({
            email,
            password: PASSWORD
        });

    expect(login.status).toBe(200);
    expect(login.body.accessToken).toBeDefined();

    return login.body.accessToken;
}

function futureSlot(offsetHours = 0) {
    const start = new Date(
        Date.now() + 24 * 60 * 60 * 1000 + offsetHours * 60 * 60 * 1000
    );

    const end = new Date(start.getTime() + 60 * 60 * 1000);

    return {
        startTime: start.toISOString(),
        endTime: end.toISOString()
    };
}

async function createReservation(token, slot = futureSlot()) {
    return request(app)
        .post("/api/reservations")
        .set("Authorization", `Bearer ${token}`)
        .send({
            roomId,
            participants: 5,
            ...slot
        });
}

async function createAuditLogEntries() {
    await db("audit_log").insert([
        {
            event_type: "reservation.created",
            payload: {
                reservationId: 101,
                roomId: 1,
                userId: 1
            },
            created_at: "2026-11-16T10:00:00.000Z"
        },
        {
            event_type: "reservation.cancelled",
            payload: {
                reservationId: 102,
                roomId: 1,
                userId: 2
            },
            created_at: "2026-11-16T11:00:00.000Z"
        },
        {
            event_type: "reservation.created",
            payload: {
                reservationId: 103,
                roomId: 2,
                userId: 3
            },
            created_at: "2026-11-16T12:00:00.000Z"
        }
    ]);
}

beforeAll(async () => {
    await db.migrate.latest();
});

beforeEach(async () => {
    await db.raw(`
        TRUNCATE TABLE
            audit_log,
            reservation_legacy_owners,
            reservations,
            rooms,
            buildings,
            users
        RESTART IDENTITY CASCADE
    `);

    const [building] = await db("buildings")
        .insert({
            name: "Integration Test Building",
            address: "Test Street 1"
        })
        .returning("id");

    buildingId = building.id;

    const [room] = await db("rooms")
        .insert({
            building_id: buildingId,
            name: "Integration Test Room",
            capacity: 20
        })
        .returning("id");

    roomId = room.id;
});

afterAll(async () => {
    await db.destroy();
});

describe("Integration tests - API", () => {

    test("registration, login and GET /api/auth/me", async () => {
        const email = "auth-test@example.com";

        const registration = await request(app)
            .post("/api/auth/register")
            .send({
                email,
                password: PASSWORD
            });

        expect(registration.status).toBe(201);
        expect(registration.body.email).toBe(email);
        expect(registration.body.role).toBe("USER");

        const login = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password: PASSWORD
            });

        expect(login.status).toBe(200);
        expect(login.body.accessToken).toBeDefined();
        expect(login.body.tokenType).toBe("Bearer");

        const me = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${login.body.accessToken}`);

        expect(me.status).toBe(200);
        expect(me.body.email).toBe(email);
        expect(me.body.role).toBe("USER");
    });

    test("POST /api/reservations creates a reservation and returns Location", async () => {
        const { user, token } = await registerAndLogin(
            "create-reservation@example.com"
        );

        const response = await createReservation(token);

        expect(response.status).toBe(201);
        expect(response.body.id).toBeDefined();
        expect(response.headers.location).toBe(
            `/api/reservations/${response.body.id}`
        );

        const savedReservation = await db("reservations")
            .where({ id: response.body.id })
            .first();

        expect(savedReservation).toBeDefined();
        expect(Number(savedReservation.user_id)).toBe(Number(user.id));
        expect(Number(savedReservation.room_id)).toBe(Number(roomId));
        expect(savedReservation.status).toBe("CONFIRMED");
    });

    test("invalid reservation body returns 400 with validation details", async () => {
        const { token } = await registerAndLogin(
            "invalid-body@example.com"
        );

        const response = await request(app)
            .post("/api/reservations")
            .set("Authorization", `Bearer ${token}`)
            .send({
                roomId: "not-a-number",
                participants: 0,
                startTime: "invalid-date",
                endTime: "invalid-date",
                unexpectedField: true
            });

        expect(response.status).toBe(400);
        expect(response.body.error.code).toBe("VALIDATION_ERROR");
        expect(response.body.error.message).toBe("Validation failed");
        expect(response.body.error.details).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    location: "body",
                    field: "roomId"
                }),
                expect.objectContaining({
                    location: "body",
                    field: "participants"
                }),
                expect.objectContaining({
                    location: "body",
                    field: "unexpectedField"
                })
            ])
        );
    });

    test("protected endpoint without token returns 401", async () => {
        const response = await request(app)
            .get("/api/reservations");

        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe("UNAUTHORIZED");
    });

    test("USER cannot create a room - returns 403", async () => {
        const { token } = await registerAndLogin(
            "forbidden-room@example.com"
        );

        const response = await request(app)
            .post("/api/rooms")
            .set("Authorization", `Bearer ${token}`)
            .send({
                buildingId,
                name: "Unauthorized Room",
                capacity: 10
            });

        expect(response.status).toBe(403);
        expect(response.body.error.code).toBe("FORBIDDEN");

        const rooms = await db("rooms")
            .where({ name: "Unauthorized Room" });

        expect(rooms).toHaveLength(0);
    });

    test("USER cannot retrieve another user's reservation - returns 404", async () => {
        const owner = await registerAndLogin(
            "reservation-owner@example.com"
        );

        const otherUser = await registerAndLogin(
            "other-user@example.com"
        );

        const created = await createReservation(owner.token);

        expect(created.status).toBe(201);

        const response = await request(app)
            .get(`/api/reservations/${created.body.id}`)
            .set("Authorization", `Bearer ${otherUser.token}`);

        expect(response.status).toBe(404);
        expect(response.body.error.code).toBe("NOT_FOUND");
    });

    test("overlapping reservation returns 409 ROOM_ALREADY_BOOKED", async () => {
        const { token } = await registerAndLogin(
            "overlap-test@example.com"
        );

        const slot = futureSlot();

        const first = await createReservation(token, slot);

        expect(first.status).toBe(201);

        const overlapping = await createReservation(token, {
            startTime: new Date(
                new Date(slot.startTime).getTime() + 30 * 60 * 1000
            ).toISOString(),
            endTime: new Date(
                new Date(slot.endTime).getTime() + 30 * 60 * 1000
            ).toISOString()
        });

        expect(overlapping.status).toBe(409);
        expect(overlapping.body.error.code).toBe("ROOM_ALREADY_BOOKED");
    });

    test("reservation pagination returns correct total and limited data", async () => {
        const { token } = await registerAndLogin(
            "pagination-test@example.com"
        );

        const first = await createReservation(token, futureSlot(0));
        const second = await createReservation(token, futureSlot(2));
        const third = await createReservation(token, futureSlot(4));

        expect(first.status).toBe(201);
        expect(second.status).toBe(201);
        expect(third.status).toBe(201);

        const response = await request(app)
            .get("/api/reservations?page=1&limit=2")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.meta.total).toBe(3);
        expect(response.body.meta.page).toBe(1);
        expect(response.body.meta.limit).toBe(2);
        expect(response.body.data).toHaveLength(2);
    });

    // AUDIT LOG

    test("GET /api/admin/audit-log without token returns 401", async () => {
        const response = await request(app)
            .get("/api/admin/audit-log");

        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe("UNAUTHORIZED");
    });

    test("USER cannot access audit log - returns 403", async () => {
        const { token } = await registerAndLogin(
            "audit-user@example.com"
        );

        const response = await request(app)
            .get("/api/admin/audit-log")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(403);
        expect(response.body.error.code).toBe("FORBIDDEN");
    });

    test("ADMIN can retrieve audit log sorted from newest to oldest", async () => {
        const token = await registerAdminAndLogin(
            "audit-admin@example.com"
        );

        await createAuditLogEntries();

        const response = await request(app)
            .get("/api/admin/audit-log")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(3);
        expect(response.body.meta).toMatchObject({
            page: 1,
            limit: 20,
            total: 3,
            totalPages: 1
        });

        expect(response.body.data[0].payload.reservationId).toBe(103);
        expect(response.body.data[1].payload.reservationId).toBe(102);
        expect(response.body.data[2].payload.reservationId).toBe(101);
    });

    test("audit log supports eventType filtering and pagination", async () => {
        const token = await registerAdminAndLogin(
            "audit-pagination-admin@example.com"
        );

        await createAuditLogEntries();

        const filteredResponse = await request(app)
            .get("/api/admin/audit-log?eventType=reservation.created")
            .set("Authorization", `Bearer ${token}`);

        expect(filteredResponse.status).toBe(200);
        expect(filteredResponse.body.meta.total).toBe(2);
        expect(filteredResponse.body.data).toHaveLength(2);

        expect(
            filteredResponse.body.data.every(
                item => item.eventType === "reservation.created"
            )
        ).toBe(true);

        const paginatedResponse = await request(app)
            .get("/api/admin/audit-log?page=1&limit=2")
            .set("Authorization", `Bearer ${token}`);

        expect(paginatedResponse.status).toBe(200);
        expect(paginatedResponse.body.meta).toMatchObject({
            page: 1,
            limit: 2,
            total: 3,
            totalPages: 2
        });
        expect(paginatedResponse.body.data).toHaveLength(2);
    });

    // EVENT BUS - ERROR ISOLATION

    test("listener failure does not prevent reservation creation", async () => {
        const { token } = await registerAndLogin(
            "event-listener-error@example.com"
        );

        const error = new Error("Simulated audit log failure");

        const errorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        const unsubscribe = eventBus.on(
            "reservation.created",
            async () => {
                throw error;
            }
        );

        try {
            const response = await createReservation(token);

            expect(response.status).toBe(201);
            expect(response.body.id).toBeDefined();

            expect(errorSpy).toHaveBeenCalledWith(
                expect.stringContaining("Listener failed"),
                error
            );
        } finally {
            unsubscribe();
            errorSpy.mockRestore();
        }
    });
});
