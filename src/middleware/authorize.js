const AppError = require("../errors/AppError");

function authorize(...allowedRoles) {
    return function (req, res, next) {
        if (!req.user) {
            return next(new AppError("Authentication required", {
                statusCode: 401,
                code: "UNAUTHORIZED"
            }));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new AppError("Insufficient permissions", {
                statusCode: 403,
                code: "FORBIDDEN"
            }));
        }

        return next();
    };
}

module.exports = authorize;