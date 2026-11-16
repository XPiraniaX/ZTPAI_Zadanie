const express = require("express");

const authorize = require("../../middleware/authorize");
const validate = require("../../middleware/validate");

const {
    createAuditLogController
} = require("./auditLog.controller");

const {
    auditLogQuerySchema
} = require("./auditLog.schemas");

function createAuditLogRoutes(auditLogRepository) {
    const router = express.Router();

    const controller = createAuditLogController(auditLogRepository);

    router.get(
        "/",
        authorize("ADMIN"),
        validate({ query: auditLogQuerySchema }),
        controller.getAll
    );

    return router;
}

module.exports = createAuditLogRoutes;