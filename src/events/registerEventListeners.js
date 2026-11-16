function registerEventListeners({
                                    eventBus,
                                    auditLogRepository,
                                    reservationsRepository,
                                    logger = console
                                }) {
    // Listener 1: zapis wszystkich zdarzeń do audit_log
    eventBus.on("reservation.created", async (payload) => {
        await auditLogRepository.create(
            "reservation.created",
            payload
        );
    });

    eventBus.on("reservation.cancelled", async (payload) => {
        await auditLogRepository.create(
            "reservation.cancelled",
            payload
        );
    });

    // Listener 2: powiadomienie o anulowaniu przez ADMIN
    eventBus.on("reservation.cancelled", async (payload) => {
        const cancelledBy = payload.cancelledBy;

        if (
            cancelledBy?.role !== "ADMIN" ||
            Number(cancelledBy.id) === Number(payload.userId)
        ) {
            return;
        }

        const reservation = await reservationsRepository.findById(
            payload.reservationId
        );

        const email = reservation?.user?.email;

        if (!email) {
            logger.warn(
                `[notification] Cannot notify reservation owner: email not found`
            );
            return;
        }

        logger.log(
            `[notification] to: ${email} | Reservation ${payload.reservationId} was cancelled by an administrator.`
        );
    });
}

module.exports = { registerEventListeners };
