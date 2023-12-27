import fetchAllWaxData2 from '../../core/fetchAllWaxData2';
import CONTRACTS from '../consts/CONTRACTS';
import fetchExchange from './fetchExchange';
import fetchNovoPrice from './fetchNovoPrice';
import convertAllCosts from '../utils/convertAllCosts';
import BUILDING_TYPES from '../consts/BUILDING_TYPES';

const fetchBuildingConfigs = async ({
    cache = {}
}) => {
    const exchange = cache.exchange || await fetchExchange();
    const novoPrice = cache.novoPrice || await fetchNovoPrice();
    const buildingConfigs = await fetchAllWaxData2({
        params: {
            code: CONTRACTS.GAME,
            scope: CONTRACTS.GAME,
            table: 'buildingcfg',
        },
        customProcessor: ({row}) => ({
            id: row.id,
            level: row.level,
            resourceType: row.resource_type,
            buildingType: BUILDING_TYPES.RESOURCE_TYPE_TO_BUILDING_TYPE[row.resource_type],
            allocationType: BUILDING_TYPES.RESOURCE_TYPE_TO_ALLOCATION_TYPE[row.resource_type],
            workerCapacity: row.worker_capacity,
            restTime: row.rest_time,
            minimumWage: convertAllCosts({
                costs: [row.minimum_wage],
                exchange,
                novoPrice,
            }),
            shiftCost: convertAllCosts({
                costs: row.shift_cost,
                exchange,
                novoPrice,
            }),
            shiftYield: convertAllCosts({
                costs: row.shift_yield,
                exchange,
                novoPrice,
            }),
        }),
    });

    return buildingConfigs;
};

export default fetchBuildingConfigs;