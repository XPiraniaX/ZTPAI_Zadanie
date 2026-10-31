function createUsersRepository() {
    const users = [];
    let nextId = 1;

    return {
        async create(data) {
            const existing = users.find(
                user => user.email === data.email
            );

            if (existing) {
                const error = new Error("Duplicate email");
                error.code = "23505";
                error.constraint = "users_email_unique";
                throw error;
            }

            const user = {
                id: nextId++,
                email: data.email,
                password_hash: data.passwordHash,
                role: "USER",
                created_at: new Date()
            };

            users.push(user);

            return mapUser(user);
        },

        async findByEmail(email) {
            return users.find(user => user.email === email) || null;
        },

        async findById(id) {
            return users.find(user => user.id === Number(id)) || null;
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