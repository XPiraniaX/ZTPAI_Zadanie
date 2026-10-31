const bcrypt = require("bcryptjs");
const ConflictError = require("../../errors/ConflictError");

function createAuthService(usersRepository) {
    async function register(data) {
        const passwordHash = await bcrypt.hash(data.password, 12);

        try {
            return await usersRepository.create({
                email: data.email,
                passwordHash
            });
        } catch (error) {
            if (
                error.code === "23505" &&
                error.constraint === "users_email_unique"
            ) {
                throw new ConflictError(
                    "Email is already taken",
                    "EMAIL_TAKEN"
                );
            }

            throw error;
        }
    }

    return {
        register
    };
}

module.exports = { createAuthService };