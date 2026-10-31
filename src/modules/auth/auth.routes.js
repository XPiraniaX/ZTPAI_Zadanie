const express = require("express");

const createAuthController = require("./auth.controller");
const { registerSchema } = require("../users/users.schemas");
const validate = require("../../middleware/validate");

function createAuthRoutes(usersRepository) {
    const router = express.Router();
    const controller = createAuthController(usersRepository);

    router.post(
        "/register",
        validate({ body: registerSchema }),
        controller.register
    );

    return router;
}

module.exports = createAuthRoutes;