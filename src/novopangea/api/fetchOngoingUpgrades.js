import _ from 'lodash';
import fetchAllWaxData2 from '../../core/fetchAllWaxData2';
import CONTRACTS from '../consts/CONTRACTS';
import fetchUpgradeConfigs from './fetchUpgradeConfigs';

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

export default fetchOngoingUpgrades;