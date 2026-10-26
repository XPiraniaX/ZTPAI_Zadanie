const ValidationError = require("../errors/ValidationError");

function validate(schemas = {}) {
    return (req, res, next) => {
        const validated = {};
        const details = [];

        for (const location of ["params", "query", "body"]) {
            const schema = schemas[location];

            if (!schema) continue;

            const result = schema.safeParse(req[location]);

            if (result.success) {
                validated[location] = result.data;
                continue;
            }

            for (const issue of result.error.issues) {
                if (issue.code === "unrecognized_keys") {
                    for (const key of issue.keys) {
                        details.push({
                            location,
                            field: key,
                            message: `Unrecognized key: ${key}`
                        });
                    }
                } else {
                    details.push({
                        location,
                        field: issue.path.join("."),
                        message: issue.message
                    });
                }
            }
        }

        if (details.length > 0) {
            return next(new ValidationError("Validation failed", details));
        }

        req.validated = validated;
        next();
    };
}

module.exports = validate;
