const { createBuildingsService } = require("./buildings.service");

function createBuildingsController(buildingsRepository, roomsRepository) {
    const buildingsService = createBuildingsService(
        buildingsRepository,
        roomsRepository
    );

    async function getAllBuildings(req, res, next) {
        try {
            const buildings = await buildingsService.getAllBuildings();
            res.status(200).json(buildings);
        } catch (error) {
            next(error);
        }
    }

    async function getBuildingById(req, res, next) {
        try {
            const building = await buildingsService.getBuildingById(
                req.params.id
            );
            res.status(200).json(building);
        } catch (error) {
            next(error);
        }
    }

    async function getRoomsByBuildingId(req, res, next) {
        try {
            const rooms = await buildingsService.getRoomsByBuildingId(
                req.params.id
            );
            res.status(200).json(rooms);
        } catch (error) {
            next(error);
        }
    }

    async function createBuilding(req, res, next) {
        try {
            const building = await buildingsService.createBuilding(req.body);
            res.status(201).json(building);
        } catch (error) {
            next(error);
        }
    }

    return {
        getAllBuildings,
        getBuildingById,
        getRoomsByBuildingId,
        createBuilding
    };
}

module.exports = createBuildingsController;
