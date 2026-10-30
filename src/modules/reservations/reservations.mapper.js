function toReservationResponse(reservation) {
    const toIsoOrNull = value =>
        value == null ? null : new Date(value).toISOString();

    return {
        id: reservation.id,
        room: reservation.room
            ? {
                id: reservation.room.id,
                name: reservation.room.name,
                building: reservation.room.building
                    ? {
                        id: reservation.room.building.id,
                        name: reservation.room.building.name
                    }
                    : null
            }
            : null,
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
