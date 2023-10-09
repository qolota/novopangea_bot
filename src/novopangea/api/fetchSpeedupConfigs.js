const fetchAllWaxData2 = require('../../core/fetchAllWaxData2');
const CONTRACTS = require('../consts/CONTRACTS');

const fetchSpeedupConfigs = async () => {
    const speedupConfigs = await fetchAllWaxData2({
        params: {
            code: CONTRACTS.GAME,
            scope: CONTRACTS.GAME,
            table: 'speedupcfg',
        },
        customProcessor: ({row}) => ({
            rarity: row.rarity,
            speedMultiplier: row.multiplier,
        }),
    });

    return speedupConfigs;
};

module.exports = fetchSpeedupConfigs;