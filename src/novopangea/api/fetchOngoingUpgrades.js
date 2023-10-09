const _ = require('lodash');
const fetchAllWaxData2 = require('../../core/fetchAllWaxData2');
const CONTRACTS = require('../consts/CONTRACTS');
const fetchUpgradeConfigs = require('./fetchUpgradeConfigs');

const fetchOngoingUpgrades = async ({
    cache = {},
}) => {
    const upgradeConfigs = cache.upgradeConfigs || await fetchUpgradeConfigs({
        cache: {},
    });

    const allConfigs = [
        ..._(upgradeConfigs.buildings)
            .map(group => group.configs)
            .flatten()
            .value(),
        ..._(upgradeConfigs.workers)
            .map(group => group.configs)
            .flatten()
            .value(),
    ]
    const upgrades = await fetchAllWaxData2({
        params: {
            code: CONTRACTS.GAME,
            scope: CONTRACTS.GAME,
            table: 'upgradenft',
        },
        customProcessor: ({row}) => ({
            assetId: row.asset_id,
            owner: row.owner,
            endTime: row.end_time * 1000,
            config: allConfigs.find(config => config.id === row.config_id),
        }),
    });

    return upgrades;
};

module.exports = fetchOngoingUpgrades;