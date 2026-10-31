const bcrypt = require("bcryptjs");

exports.seed = async function (knex) {
    const email = "admin@roombooking.local";
    const password = "Admin123456!";

    const passwordHash = await bcrypt.hash(password, 12);

    await knex("users")
        .insert({
            email,
            password_hash: passwordHash,
            role: "ADMIN"
        })
        .onConflict("email")
        .ignore();
};