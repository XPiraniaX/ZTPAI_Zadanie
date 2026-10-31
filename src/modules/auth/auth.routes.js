
const express = require("express");

const createAuthController = require("./auth.controller");
const authenticate = require("../../middleware/authenticate");

const {
    registerSchema,
    loginSchema
} = require("../users/users.schemas");

const validate = require("../../middleware/validate");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Rejestracja nowego użytkownika
 *     description: Tworzy konto użytkownika na podstawie adresu e-mail i hasła.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Użytkownik został utworzony.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logowanie użytkownika
 *     description: Weryfikuje dane logowania i zwraca token JWT.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Logowanie zakończone powodzeniem.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Dane zalogowanego użytkownika
 *     description: Zwraca dane użytkownika na podstawie identyfikatora z tokenu JWT.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dane zalogowanego użytkownika.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

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
