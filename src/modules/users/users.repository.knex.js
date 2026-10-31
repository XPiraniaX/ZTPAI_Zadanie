function createUsersRepository(knex) {
    return {
        async create(data) {
            const [user] = await knex("users")
                .insert({
                    email: data.email,
                    password_hash: data.passwordHash,
                    role: "USER"
                })
                .returning([
                    "id",
                    "email",
                    "role",
                    "created_at"
                ]);

            return mapUser(user);
        },

        async findByEmail(email) {
            const user = await knex("users")
                .where({ email })
                .first();

            return user || null;
        },

        async findById(id) {
            const user = await knex("users")
                .where({ id: Number(id) })
                .first();

            return mapUser(user);
        }
    };
}

function mapUser(row) {
    if (!row) return null;

    return {
        id: row.id,
        email: row.email,
        role: row.role,
        createdAt: row.created_at
    };
}

module.exports = { createUsersRepository };