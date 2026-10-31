const jwt = require("jsonwebtoken");
const AppError = require("../errors/AppError");
const config = require("../config");

function authenticate(req, res, next) {
    const authorization = req.headers.authorization;

    if (
        typeof authorization !== "string" ||
        !authorization.startsWith("Bearer ")
    ) {
        return next(new AppError("Authentication required", {
            statusCode: 401,
            code: "UNAUTHORIZED"
        }));
    }

    const token = authorization.substring(7).trim();

    if (!token) {
        return next(new AppError("Authentication required", {
            statusCode: 401,
            code: "UNAUTHORIZED"
        }));
    }

    try {
        const decoded = jwt.verify(
            token,
            config.JWT_SECRET,
            { algorithms: ["HS256"] }
        );

        if (
            typeof decoded.sub !== "string" ||
            !["USER", "ADMIN"].includes(decoded.role)
        ) {
            throw new Error("Invalid token payload");
        }

        req.user = {
            id: decoded.sub,
            role: decoded.role
        };

        return next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(new AppError("Token expired", {
                statusCode: 401,
                code: "TOKEN_EXPIRED"
            }));
        }

        return next(new AppError("Invalid or expired token", {
            statusCode: 401,
            code: "INVALID_TOKEN"
        }));
    }
}

module.exports = authenticate;
