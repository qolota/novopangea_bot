const fetchAllWaxData2 = require('../../core/fetchAllWaxData2');
const CONTRACTS = require('../consts/CONTRACTS');


const fetchExchange = async () => {
    const exchange = await fetchAllWaxData2({
        params: {
            code: CONTRACTS.EXCHANGE,
            scope: CONTRACTS.EXCHANGE,
            table: "exchange",
        },
        customProcessor: ({row}) => ({
            id: row.id,
            from: row.from,
            to: row.to,
            rate: Number(row.rate),
            min: Number(row.min),
        }),
    });

    return exchange;
};

module.exports = fetchExchange;