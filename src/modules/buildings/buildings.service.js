const NotFoundError = require("../../errors/NotFoundError");

function createBuildingsService(buildingsRepository) {
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

    async function createBuilding(data) {
        return buildingsRepository.create(data);
    }

    return {
        getAllBuildings,
        getBuildingById,
        createBuilding
    };
}

module.exports = { createBuildingsService };