const AppError = require("../errors/AppError");

function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        err = new AppError("Invalid JSON", {
            statusCode: 400,
            code: "INVALID_JSON"
        });
    }

    const isOperational = err instanceof AppError;

    const statusCode = isOperational ? err.statusCode : 500;
    const code = isOperational ? err.code : "INTERNAL_ERROR";
    const message = isOperational
        ? err.message
        : "Internal server error";

    if (statusCode >= 500) {
        console.error(JSON.stringify({
            requestId: req.id,
            message: err.message,
            stack: err.stack
        }));
    }

    const error = {
        code,
        message
    };

    if (isOperational && err.details !== undefined) {
        error.details = err.details;
    }

    error.requestId = req.id;

    res.status(statusCode).json({ error });
}

module.exports = errorHandler;
