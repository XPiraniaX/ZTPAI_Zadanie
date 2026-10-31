const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const AppError = require("../../errors/AppError");
const ConflictError = require("../../errors/ConflictError");
const config = require("../../config");

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

    async function login(data) {
        const user = await usersRepository.findByEmail(data.email);

        if (!user) {
            throw new AppError("Invalid email or password", {
                statusCode: 401,
                code: "INVALID_CREDENTIALS"
            });
        }

        const passwordMatches = await bcrypt.compare(
            data.password,
            user.password_hash
        );

        if (!passwordMatches) {
            throw new AppError("Invalid email or password", {
                statusCode: 401,
                code: "INVALID_CREDENTIALS"
            });
        }

        const expiresIn = config.JWT_EXPIRES_IN;
        const secret = config.JWT_SECRET;

        const accessToken = jwt.sign(
            {
                role: user.role
            },
            secret,
            {
                algorithm: "HS256",
                subject: String(user.id),
                expiresIn
            }
        );

        return {
            accessToken,
            tokenType: "Bearer",
            expiresIn
        };
    }

    async function getMe(userId) {
        const user = await usersRepository.findById(userId);

        if (!user) {
            throw new AppError("User not found", {
                statusCode: 404,
                code: "USER_NOT_FOUND"
            });
        }

        return user;
    }

    return {
        register,
        login,
        getMe
    };
}

module.exports = { createAuthService };
