import fetchAllWaxData2 from '../../core/fetchAllWaxData2';
import CONTRACTS from '../consts/CONTRACTS';

const fetchTownhallAccounts = async () => {
    const townhallAccounts = await fetchAllWaxData2({
        params: {
            code: CONTRACTS.GAME,
            scope: CONTRACTS.GAME,
            table: 'townhalluser',
        },
        customProcessor: ({row}) => ({
            id: row.id,
            accountName: row.account,
            districtId: row.district_id,
            stakedNovo: Number(row.staked.split(' ')[0]),
            nextWithdrawTime: row.next_withdraw * 1000,
        }),
    });

    return townhallAccounts;
};

export default fetchTownhallAccounts;