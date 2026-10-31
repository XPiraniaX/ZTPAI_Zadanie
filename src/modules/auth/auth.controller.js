const { createAuthService } = require("./auth.service");

function createAuthController(usersRepository) {
    const authService = createAuthService(usersRepository);

    async function register(req, res, next) {
        try {
            const user = await authService.register(req.validated.body);
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    }

    return {
        register
    };
}

module.exports = createAuthController;