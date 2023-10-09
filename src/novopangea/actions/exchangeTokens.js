const _ = require('lodash');
const CONTRACTS = require('../consts/CONTRACTS');

const exchangeTokens = ({
    accountName,
    valueFrom,
    symbolFrom,
    symbolTo,
}) => {
    return {
        account: CONTRACTS.EXCHANGE,
        name: 'exchange',
        authorization: [
            {
                actor: accountName,
                permission: 'active',
            },
        ],
        data: {
            account_name: accountName,
            from: `${valueFrom.toFixed(4)} ${symbolFrom.toUpperCase()}`,
            to: symbolTo.toUpperCase(),
        },
    };
};

module.exports = exchangeTokens;