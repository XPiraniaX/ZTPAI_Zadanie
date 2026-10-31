const NotFoundError = require("../../errors/NotFoundError");
const ConflictError = require("../../errors/ConflictError");
const ValidationError = require("../../errors/ValidationError");

const ALLOWED_STATUS_TRANSITIONS = {
    CONFIRMED: "CANCELLED",
    CANCELLED: null
};

function createReservationsService(
    reservationsRepository,
    roomsRepository,
    now = () => new Date()
) {
    return {
        async getAllReservations(filters = {}) {
            const result = await reservationsRepository.findAll(filters);

            const page = filters.page || 1;
            const limit = filters.limit || 20;

            return {
                data: result.data,
                meta: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            };
        },

        async getReservationById(id) {
            const reservation = await reservationsRepository.findById(id);

            if (!reservation) {
                throw new NotFoundError("Reservation not found");
            }

            return reservation;
        },

        async createReservation(data, userId) {
            const room = await roomsRepository.findById(data.roomId);

            if (!room) {
                throw new NotFoundError("Room not found");
            }

            if (data.participants > room.capacity) {
                throw new ConflictError("Room capacity exceeded");
            }

            const start = new Date(data.startTime).getTime();
            const end = new Date(data.endTime).getTime();
            const current = now().getTime();

            if (end <= start) {
                throw new ValidationError("Validation failed", [{
                    location: "body",
                    field: "endTime",
                    message: "endTime must be after startTime"
                }]);
            }

            const duration = end - start;
            const MIN_DURATION = 15 * 60 * 1000;
            const MAX_DURATION = 8 * 60 * 60 * 1000;

            if (duration < MIN_DURATION || duration > MAX_DURATION) {
                throw new ValidationError("Validation failed", [{
                    location: "body",
                    field: "endTime",
                    message: "Reservation duration must be between 15 minutes and 8 hours"
                }]);
            }

            if (start < current) {
                throw new ValidationError("Validation failed", [{
                    location: "body",
                    field: "startTime",
                    message: "startTime cannot be in the past"
                }]);
            }

            const reservationData = {
                ...data,
                userId: Number(userId)
            };

            if (
                typeof reservationsRepository.createWithRoomLock === "function"
            ) {
                const result =
                    await reservationsRepository.createWithRoomLock(
                        reservationData,
                        {
                            checkOverlap:
                                process.env.DISABLE_APP_OVERLAP_CHECK !== "true"
                        }
                    );

                if (!result) {
                    throw new NotFoundError("Room not found");
                }

                if (result.conflict) {
                    throw new ConflictError(
                        "Room is already booked for this time",
                        "ROOM_ALREADY_BOOKED"
                    );
                }

                return result;
            }

            const existingReservations =
                await reservationsRepository.findByRoomId(data.roomId);

            const overlaps = existingReservations.some(reservation => {
                if (reservation.status !== "CONFIRMED") {
                    return false;
                }

                const existingStart =
                    new Date(reservation.startTime).getTime();
                const existingEnd =
                    new Date(reservation.endTime).getTime();

                return start < existingEnd && existingStart < end;
            });

            if (overlaps) {
                throw new ConflictError(
                    "Room is already booked for this time",
                    "ROOM_ALREADY_BOOKED"
                );
            }

            return reservationsRepository.create(reservationData);
        },

        async cancelReservation(id) {
            const reservation = await reservationsRepository.findById(id);

            if (!reservation) {
                throw new NotFoundError("Reservation not found");
            }

            if (reservation.status === "CANCELLED") {
                return reservation;
            }

            const nextStatus =
                ALLOWED_STATUS_TRANSITIONS[reservation.status];

            if (!nextStatus) {
                throw new ConflictError(
                    "Reservation cannot be cancelled from its current status"
                );
            }

            const current = now().getTime();
            const start = new Date(reservation.startTime).getTime();

            if (start <= current) {
                throw new ConflictError(
                    "Reservation has already started",
                    "RESERVATION_ALREADY_STARTED"
                );
            }

            return reservationsRepository.update(id, {
                status: nextStatus,
                cancelledAt: now().toISOString()
            });
        }
    };
}

module.exports = { createReservationsService };