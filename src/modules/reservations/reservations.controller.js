const {
    toReservationResponse
} = require("./reservations.mapper");

function createReservationsController(reservationsService) {
    return {
        async getAll(req, res) {
            const result =
                await reservationsService.getAllReservations(
                    req.validated.query
                );

            res.json({
                data: result.data.map(toReservationResponse),
                meta: result.meta
            });
        },

        async getById(req, res) {
            const reservation =
                await reservationsService.getReservationById(
                    req.validated.params.id
                );

            res.json(toReservationResponse(reservation));
        },

        async create(req, res) {
            const reservation =
                await reservationsService.createReservation(
                    req.validated.body
                );

            res.status(201)
                .location(`/api/reservations/${reservation.id}`)
                .json(toReservationResponse(reservation));
        },

        async cancel(req, res) {
            const reservation =
                await reservationsService.cancelReservation(
                    req.validated.params.id
                );

            res.json(toReservationResponse(reservation));
        }
    };
}

module.exports = { createReservationsController };