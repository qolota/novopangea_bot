const _ = require('lodash');
const CONTRACTS = require('../consts/CONTRACTS');

const removeWorkers = ({
    accountName,
    workerIds,
}) => {
    return {
        account: CONTRACTS.GAME,
        name: 'remworker',
        authorization: [
            {
                actor: accountName,
                permission: 'active',
            },
        ],
        data: {
            owner: accountName,
            ids: workerIds,
        },
    };
};

module.exports = removeWorkers;