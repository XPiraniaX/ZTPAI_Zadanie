const express = require("express");

const createAuthController = require("./auth.controller");
const authenticate = require("../../middleware/authenticate");

const {
    registerSchema,
    loginSchema
} = require("../users/users.schemas");

const validate = require("../../middleware/validate");

function createAuthRoutes(usersRepository) {
    const router = express.Router();
    const controller = createAuthController(usersRepository);

    router.post(
        "/register",
        validate({ body: registerSchema }),
        controller.register
    );

    router.post(
        "/login",
        validate({ body: loginSchema }),
        controller.login
    );

    router.get(
        "/me",
        authenticate,
        controller.me
    );

    return router;
}

module.exports = createAuthRoutes;