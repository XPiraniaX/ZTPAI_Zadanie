const {
    toReservationResponse
} = require("./reservations.mapper");

function createReservationsController(reservationsService) {
    return {
        async getAll(req, res, next) {
            try {
                const result =
                    await reservationsService.getAllReservations(
                        req.validated.query
                    );

                res.json({
                    data: result.data.map(toReservationResponse),
                    meta: result.meta
                });
            } catch (error) {
                next(error);
            }
        },

        async getById(req, res, next) {
            try {
                const reservation =
                    await reservationsService.getReservationById(
                        req.validated.params.id
                    );

                res.json(toReservationResponse(reservation));
            } catch (error) {
                next(error);
            }
        },

        async create(req, res, next) {
            try {
                const reservation =
                    await reservationsService.createReservation(
                        req.validated.body,
                        req.user.id
                    );

                res.status(201)
                    .location(`/api/reservations/${reservation.id}`)
                    .json(toReservationResponse(reservation));
            } catch (error) {
                next(error);
            }
        },

        async cancel(req, res, next) {
            try {
                const reservation =
                    await reservationsService.cancelReservation(
                        req.validated.params.id
                    );

                res.json(toReservationResponse(reservation));
            } catch (error) {
                next(error);
            }
        }
    };
}

module.exports = { createReservationsController };