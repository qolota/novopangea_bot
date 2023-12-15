import fetchAllWaxData2 from '../../core/fetchAllWaxData2';
import CONTRACTS from '../consts/CONTRACTS';

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

export default fetchSpeedupConfigs;