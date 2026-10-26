function toReservationResponse(reservation) {
    const toIsoOrNull = value =>
        value == null ? null : new Date(value).toISOString();

    return {
        id: reservation.id,
        roomId: reservation.roomId,
        reservedBy: reservation.reservedBy,
        participants: reservation.participants,
        startTime: toIsoOrNull(reservation.startTime),
        endTime: toIsoOrNull(reservation.endTime),
        status: reservation.status,
        createdAt: toIsoOrNull(reservation.createdAt),
        cancelledAt: toIsoOrNull(reservation.cancelledAt)
    };
}

module.exports = { toReservationResponse };
