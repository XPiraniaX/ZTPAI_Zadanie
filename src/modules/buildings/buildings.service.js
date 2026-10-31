const NotFoundError = require("../../errors/NotFoundError");
const ConflictError = require("../../errors/ConflictError");

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

    async function updateBuilding(id, data) {
        await getBuildingById(id);

        return buildingsRepository.update(id, data);
    }

    async function deleteBuilding(id) {
        await getBuildingById(id);

        try {
            await buildingsRepository.delete(id);
        } catch (error) {
            if (error.code === "23503") {
                throw new ConflictError(
                    "Building cannot be deleted because it contains rooms",
                    "BUILDING_IN_USE"
                );
            }

            throw error;
        }

        return { message: "Building deleted successfully" };
    }

    return {
        getAllBuildings,
        getBuildingById,
        getRoomsByBuildingId,
        createBuilding,
        updateBuilding,
        deleteBuilding
    };
}

module.exports = { createBuildingsService };