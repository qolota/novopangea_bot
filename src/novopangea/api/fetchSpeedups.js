import fetchAllWaxData2 from '../../core/fetchAllWaxData2';
import CONTRACTS from '../consts/CONTRACTS';
import fetchSpeedupConfigs from './fetchSpeedupConfigs';

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

export default fetchSpeedups;