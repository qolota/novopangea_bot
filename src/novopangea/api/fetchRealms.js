const fetchAllWaxData2 = require('../../core/fetchAllWaxData2');
const CONTRACTS = require('../consts/CONTRACTS');

const fetchRealms = async () => {
    const realms = await fetchAllWaxData2({
        params: {
            code: CONTRACTS.GAME,
            scope: CONTRACTS.GAME,
            table: "realms",
        },
    });

    return realms;
};

module.exports = fetchRealms;