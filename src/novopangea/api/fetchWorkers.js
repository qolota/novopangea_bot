const _ = require('lodash');
const fetchAllWaxData2 = require('../../core/fetchAllWaxData2');
const CONTRACTS = require('../consts/CONTRACTS');
const fetchBuildings = require('./fetchBuildings');
const fetchDistricts = require('./fetchDistricts');
const fetchWorkerConfigs = require('./fetchWorkerConfigs');
const fetchBuildingConfigs = require('./fetchBuildingConfigs');

const fetchWorkers = async ({
    cache = {},
}) => {
    const buildingConfigs = cache.buildingConfigs || await fetchBuildingConfigs({});
    const workerConfigs = cache.workerConfigs || await fetchWorkerConfigs({});
    const districts = cache.districts || await fetchDistricts({});
    const buildings = cache.buildings || await fetchBuildings({
        cache: {
            buildingConfigs,
            districts,
        },
    });
    
    const now = Date.now();
    const workers = await fetchAllWaxData2({
        params: {
            code: CONTRACTS.GAME,
            scope: CONTRACTS.GAME,
            table: 'worker',
        },
        customProcessor: ({row}) => {
            const shiftStart = row.shift_start * 1000;
            const shiftEnd = row.shift_end * 1000;
            const restEnd = row.rest_end * 1000;
            
            return {
                id: row.id,
                owner: row.owner,
                assetId: row.asset_id,
                level: row.level,
                shiftStart,
                shiftEnd,
                restEnd,
                isWorking: now < shiftEnd,
                needSleeping: restEnd === 0,
                isSleeping: now < restEnd,
                district: districts.find(district => district.id === row.district_id),
                config: workerConfigs.find(config => config.id === row.config_id),
                building: buildings.find(building => building.id === row.building_id),
            };
        },
    });

    return workers;
}

module.exports = fetchWorkers;