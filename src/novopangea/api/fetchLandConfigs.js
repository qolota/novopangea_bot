const fetchAllWaxData2 = require('../../core/fetchAllWaxData2');
const fetchExchange = require('./fetchExchange');
const fetchNovoPrice = require('./fetchNovoPrice');
const convertAllCosts = require('../utils/convertAllCosts');
const CONTRACTS = require('../consts/CONTRACTS');

const fetchLandConfigs = async ({
    cache = {},
}) => {
    const exchange = cache.exchange || await fetchExchange();
    const novoPrice = cache.novoPrice || await fetchNovoPrice();
    const configs = await fetchAllWaxData2({
        params: {
            code: CONTRACTS.GAME,
            scope: CONTRACTS.GAME,
            table: 'landcfg',
        },
        customProcessor: ({row}) => ({
            id: row.id,
            plotRentAmount: convertAllCosts({
                costs: [row.plot_rent_amount],
                exchange,
                novoPrice,
            }),
            rentTime: row.rent_time,
            workerBufferTime: row.worker_buffer_time,
            renewBufferTime: row.renew_buffer_time,
        }),
    });

    return configs;
};

module.exports = fetchLandConfigs;