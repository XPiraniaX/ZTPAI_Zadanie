const { randomUUID } = require("crypto");

function requestLogger(req, res, next) {
    const startedAt = process.hrtime.bigint();

    const incomingId = req.get("X-Request-Id");
    req.id = incomingId && incomingId.trim()
        ? incomingId.trim()
        : randomUUID();

    res.setHeader("X-Request-Id", req.id);

    res.on("finish", () => {
        const elapsedMs =
            Number(process.hrtime.bigint() - startedAt) / 1_000_000;

        console.log(JSON.stringify({
            requestId: req.id,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Number(elapsedMs.toFixed(2))
        }));
    });

    next();
}

module.exports = requestLogger;
