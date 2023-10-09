const _ = require('lodash');
const fetchWaxData = require('../../core/fetchWaxData');
const fetchExchange = require('./fetchExchange');
const fetchNovoPrice = require('./fetchNovoPrice');
const convertAllCosts = require('../utils/convertAllCosts');
const CONTRACTS = require('../consts/CONTRACTS');
const mapResources = require('../utils/mapResources');

const fetchAccount = async ({
    accountName,
    cache = {},
}) => {
    const exchange = cache.exchange || await fetchExchange();
    const novoPrice = cache.novoPrice || await fetchNovoPrice();
    const accounts = await fetchWaxData({
        code: CONTRACTS.GAME,
        scope: CONTRACTS.GAME,
        table: 'accounts',
        limit: 1,
        lower_bound: accountName,
        upper_bound: accountName,
        index_position: 1,
        json: true,
        reverse: false,
        show_payer: false,
        key_type: '',
    });

    const accountData = accounts[0];
    const account = {
        level: accountData.level,
        score: accountData.score,
        balances: mapResources(accountData.balances),
        maxBalances: mapResources(accountData.max_balances),
        totalBalance: convertAllCosts({
            costs: accountData.balances,
            exchange,
            novoPrice,
        }),
    };

    return account;
};

module.exports = fetchAccount;