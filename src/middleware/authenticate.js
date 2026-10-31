const jwt = require("jsonwebtoken");
const AppError = require("../errors/AppError");

function authenticate(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return next(
            new AppError("Authentication required", {
                statusCode: 401,
                code: "UNAUTHORIZED"
            })
        );
    }

    const token = authorization.substring(7).trim();

    if (!token) {
        return next(
            new AppError("Authentication required", {
                statusCode: 401,
                code: "UNAUTHORIZED"
            })
        );
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        return next(new Error("JWT_SECRET is not configured"));
    }

    try {
        const decoded = jwt.verify(token, secret, {
            algorithms: ["HS256"]
        });

        if (
            typeof decoded.sub !== "string" ||
            !decoded.role
        ) {
            throw new Error("Invalid token payload");
        }

        req.user = {
            id: decoded.sub,
            role: decoded.role
        };

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(
                new AppError("Token has expired", {
                    statusCode: 401,
                    code: "TOKEN_EXPIRED"
                })
            );
        }

        return next(
            new AppError("Invalid or expired token", {
                statusCode: 401,
                code: "INVALID_TOKEN"
            })
        );
    }
}

module.exports = authenticate;