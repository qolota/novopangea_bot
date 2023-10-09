const _ = require('lodash');
const fetchRealms = require('./fetchRealms');
const fetchAllWaxData2 = require('../../core/fetchAllWaxData2');
const CONTRACTS = require('../consts/CONTRACTS');
const fetchTownhallAccounts = require('./fetchTownhallAccounts');

const fetchDistricts = async ({
    cache = {},
}) => {
    const realms = cache.realms || await fetchRealms();
    const townhallAccounts = await fetchTownhallAccounts();
    const districts = await fetchAllWaxData2({
        params: {
            code: CONTRACTS.GAME,
            scope: CONTRACTS.GAME,
            table: 'districts',
        },
        customProcessor: ({row}) => ({
            id: row.id,
            realm: realms.find(realm => realm.id === row.realm_id),
            accounts: _(townhallAccounts)
                .filter(account => account.districtId === row.id)
                .value(),
            number: row.number,
            level: row.level,
            balances: row.balances,
            taxRate: Number(row.tax_rate),
        }),
    });

    return districts;
};

module.exports = fetchDistricts;