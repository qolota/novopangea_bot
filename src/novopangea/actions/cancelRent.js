const _ = require('lodash');
const CONTRACTS = require('../consts/CONTRACTS');

const cancelRent = ({
    accountName,
    landId,
}) => {
    return {
        account: CONTRACTS.GAME,
        name: 'cancelrent',
        authorization: [
            {
                actor: accountName,
                permission: 'active',
            },
        ],
        data: {
            owner: accountName,
            id: landId,
        },
    };
};

module.exports = cancelRent;