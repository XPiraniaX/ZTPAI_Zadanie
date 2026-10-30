exports.seed = async function (knex) {
    await knex("reservations").insert([
        {
            id: 1,
            room_id: 1,
            reserved_by: "Jan Kowalski",
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
            reserved_by: "Anna Nowak",
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
            reserved_by: "Piotr Wiśniewski",
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
            reserved_by: "Maria Zielińska",
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
            reserved_by: "Tomasz Lewandowski",
            participants: 6,
            start_time: "2026-11-20T15:00:00+01:00",
            end_time: "2026-11-20T16:30:00+01:00",
            status: "CONFIRMED",
            cancelled_at: null,
            created_at: "2026-10-10T10:00:00+02:00"
        }
    ]);

    await knex.raw(
        "ALTER SEQUENCE reservations_id_seq RESTART WITH 6"
    );
};