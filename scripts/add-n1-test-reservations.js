
require("dotenv").config();

const knexConfig = require("../knexfile");
const knex = require("knex")(knexConfig.development);

async function main() {
    const existing = await knex("reservations").count("* as count").first();
    const currentCount = Number(existing.count);

    if (currentCount >= 20) {
        console.log(`W bazie jest już ${currentCount} rezerwacji. Nic nie dodano.`);
        return;
    }

    const rowsToAdd = 20 - currentCount;
    const reservations = [];

    // Rezerwacje testowe w sali nr 1.
    // Każda trwa godzinę i nie nakłada się na pozostałe.
    for (let i = 0; i < rowsToAdd; i++) {
        const day = 1 + Math.floor(i / 5);
        const hour = 10 + (i % 5);

        const startTime = new Date(
            Date.UTC(2026, 11, day, hour, 0, 0)
        );

        const endTime = new Date(
            startTime.getTime() + 60 * 60 * 1000
        );

        reservations.push({
            room_id: 1,
            reserved_by: `N+1 TEST ${i + 1}`,
            participants: 2,
            start_time: startTime,
            end_time: endTime,
            status: "CONFIRMED",
            cancelled_at: null
        });
    }

    await knex("reservations").insert(reservations);

    const result = await knex("reservations")
        .count("* as count")
        .first();

    console.log(`Dodano ${rowsToAdd} rezerwacji testowych.`);
    console.log(`Łączna liczba rezerwacji: ${result.count}`);
}

main()
    .catch(error => {
        console.error("Błąd:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await knex.destroy();
    });
