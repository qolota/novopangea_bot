const fetchAllWaxData2 = require('../../core/fetchAllWaxData2');
const CONTRACTS = require('../consts/CONTRACTS');
const fetchSpeedupConfigs = require('./fetchSpeedupConfigs');

const fetchSpeedups = async ({
    cache = {}
}) => {
    const speedupConfigs = cache.speedupConfigs || await fetchSpeedupConfigs();
    const speedups = await fetchAllWaxData2({
        params: {
            code: CONTRACTS.GAME,
            scope: CONTRACTS.GAME,
            table: 'speedup',
        },
        customProcessor: ({row}) => ({
            assetId: row.asset_id,
            owner: row.owner,
            time: row.time * 1000,
            speedupType: row.type,
            targetId: row.target,
            rarity: row.rarity,
            config: speedupConfigs.find(config => config.rarity === row.rarity),
        }),
    });

    return speedups;
};

module.exports = fetchSpeedups;