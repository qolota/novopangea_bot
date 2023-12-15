import _ from 'lodash';
import fetchAllWaxData2 from '../../core/fetchAllWaxData2';
import CONTRACTS from '../consts/CONTRACTS';
import fetchBuildings from './fetchBuildings';
import fetchDistricts from './fetchDistricts';
import fetchWorkerConfigs from './fetchWorkerConfigs';
import fetchBuildingConfigs from './fetchBuildingConfigs';

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

export default fetchWorkers;