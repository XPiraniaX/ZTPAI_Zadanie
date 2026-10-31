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

    async function login(req, res, next) {
        try {
            const result = await authService.login(req.validated.body);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async function me(req, res, next) {
        try {
            const user = await authService.getMe(req.user.id);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    return {
        register,
        login,
        me
    };
}

module.exports = createAuthController;