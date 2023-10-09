const fetchAllWaxData2 = require('../../core/fetchAllWaxData2');
const CONTRACTS = require('../consts/CONTRACTS');
const fetchExchange = require('./fetchExchange');
const fetchNovoPrice = require('./fetchNovoPrice');
const convertAllCosts = require('../utils/convertAllCosts');

const fetchBuildingConfigs = async ({
    cache = {}
}) => {
    const exchange = cache.exchange || await fetchExchange();
    const novoPrice = cache.novoPrice || await fetchNovoPrice();
    const buildingConfigs = await fetchAllWaxData2({
        params: {
            code: CONTRACTS.GAME,
            scope: CONTRACTS.GAME,
            table: "buildingcfg",
        },
        customProcessor: ({row}) => ({
            id: row.id,
            level: row.level,
            resourceType: row.resource_type,
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

module.exports = fetchBuildingConfigs;