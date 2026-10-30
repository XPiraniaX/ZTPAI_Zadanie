const NotFoundError = require("../../errors/NotFoundError");

function createBuildingsService(buildingsRepository, roomsRepository) {
    async function getAllBuildings() {
        return buildingsRepository.findAll();
    }

    async function getBuildingById(id) {
        const building = await buildingsRepository.findById(id);

        if (!building) {
            throw new NotFoundError("Building not found");
        }

        return building;
    }

    async function getRoomsByBuildingId(id) {
        const building = await buildingsRepository.findById(id);

        if (!building) {
            throw new NotFoundError("Building not found");
        }

        return roomsRepository.findByBuildingId(id);
    }

    async function createBuilding(data) {
        return buildingsRepository.create(data);
    }

    return {
        getAllBuildings,
        getBuildingById,
        getRoomsByBuildingId,
        createBuilding
    };
}

module.exports = { createBuildingsService };
