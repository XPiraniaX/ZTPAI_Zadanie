function createBuildingsRepository() {
    const buildings = [
        {
            id: 1,
            name: "Budynek A",
            address: "ul. Warszawska 24, Kraków"
        },
        {
            id: 2,
            name: "Budynek B",
            address: "ul. Karmelicka 10, Kraków"
        }
    ];

    let nextId = 3;

    return {
        async findAll() {
            return buildings.map(building => ({ ...building }));
        },

        async findById(id) {
            const building = buildings.find(
                building => building.id === Number(id)
            );

            return building ? { ...building } : null;
        },

        async create(data) {
            const building = {
                id: nextId++,
                name: data.name,
                address: data.address
            };

            buildings.push(building);

            return { ...building };
        }
    };
}

module.exports = { createBuildingsRepository };