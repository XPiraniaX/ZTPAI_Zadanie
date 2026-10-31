require("dotenv").config();

const knex = require("knex");
const knexConfig = require("../knexfile");

const db = knex(knexConfig.development);

const API_URL = "http://localhost:3000/api/reservations";

const TEST = {
    roomId: 1,
    reservedBy: "DOUBLE BOOKING TEST",
    participants: 2,
    startTime: "2026-12-15T10:00:00.000Z",
    endTime: "2026-12-15T11:00:00.000Z"
};

async function main() {
    try {
        // Usuwamy wyłącznie poprzednie rekordy tego testu.
        await db("reservations")
            .where("reserved_by", TEST.reservedBy)
            .delete();

        console.log("Wysyłanie 10 równoległych żądań...\n");

        const requests = Array.from({ length: 10 }, async (_, index) => {
            try {
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(TEST)
                });

                const body = await response.json();

                console.log(
                    `Request ${index + 1}: HTTP ${response.status}`
                );

                return response.status;
            } catch (error) {
                console.error(
                    `Request ${index + 1}: ERROR`,
                    error.message
                );

                return null;
            }
        });

        const statuses = await Promise.all(requests);

        const confirmedCount = await db("reservations")
            .where("room_id", TEST.roomId)
            .where("status", "CONFIRMED")
            .where("start_time", "<", TEST.endTime)
            .where("end_time", ">", TEST.startTime)
            .count({ total: "id" })
            .first();

        console.log("\nPodsumowanie:");
        console.log("201:", statuses.filter(s => s === 201).length);
        console.log("409:", statuses.filter(s => s === 409).length);
        console.log("Inne:", statuses.filter(s => s !== 201 && s !== 409).length);

        console.log(
            "Liczba CONFIRMED w bazie dla sali i przedziału:",
            Number(confirmedCount.total)
        );

    } finally {
        await db.destroy();
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});