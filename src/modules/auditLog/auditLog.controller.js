function createAuditLogController(auditLogRepository) {
    return {
        async getAll(req, res, next) {
            try {
                const filters = req.validated.query;

                const result = await auditLogRepository.findAll(filters);

                res.json({
                    data: result.data,
                    meta: {
                        page: filters.page,
                        limit: filters.limit,
                        total: result.total,
                        totalPages: Math.ceil(result.total / filters.limit)
                    }
                });
            } catch (error) {
                next(error);
            }
        }
    };
}

module.exports = {
    createAuditLogController
};