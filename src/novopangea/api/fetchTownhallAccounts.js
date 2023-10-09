const fetchAllWaxData2 = require('../../core/fetchAllWaxData2');
const CONTRACTS = require('../consts/CONTRACTS');

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

module.exports = fetchTownhallAccounts;