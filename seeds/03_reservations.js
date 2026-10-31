exports.seed = async function (knex) {
    const admin = await knex("users")
        .where({ email: "admin@roombooking.local" })
        .first("id");

    if (!admin) {
        throw new Error(
            "Admin user not found. Run the admin seed first."
        );
    }

    await knex("reservations")
        .insert([
            {
                id: 1,
                room_id: 1,
                user_id: admin.id,
                participants: 5,
                start_time: "2026-11-10T10:00:00+01:00",
                end_time: "2026-11-10T11:00:00+01:00",
                status: "CONFIRMED",
                cancelled_at: null,
                created_at: "2026-10-01T10:00:00+02:00"
            },
            {
                id: 2,
                room_id: 2,
                user_id: admin.id,
                participants: 8,
                start_time: "2026-11-12T12:00:00+01:00",
                end_time: "2026-11-12T14:00:00+01:00",
                status: "CONFIRMED",
                cancelled_at: null,
                created_at: "2026-10-02T10:00:00+02:00"
            },
            {
                id: 3,
                room_id: 3,
                user_id: admin.id,
                participants: 4,
                start_time: "2026-11-15T09:00:00+01:00",
                end_time: "2026-11-15T10:00:00+01:00",
                status: "CANCELLED",
                cancelled_at: "2026-10-20T12:00:00+02:00",
                created_at: "2026-10-05T10:00:00+02:00"
            },
            {
                id: 4,
                room_id: 4,
                user_id: admin.id,
                participants: 10,
                start_time: "2026-10-30T18:00:00+01:00",
                end_time: "2026-10-30T20:00:00+01:00",
                status: "CONFIRMED",
                cancelled_at: null,
                created_at: "2026-10-01T09:00:00+02:00"
            },
            {
                id: 5,
                room_id: 5,
                user_id: admin.id,
                participants: 6,
                start_time: "2026-11-20T15:00:00+01:00",
                end_time: "2026-11-20T16:30:00+01:00",
                status: "CONFIRMED",
                cancelled_at: null,
                created_at: "2026-10-10T10:00:00+02:00"
            }
        ])
        .onConflict("id")
        .merge();

    await knex.raw(
        "SELECT setval('reservations_id_seq', (SELECT COALESCE(MAX(id), 1) FROM reservations))"
    );
};