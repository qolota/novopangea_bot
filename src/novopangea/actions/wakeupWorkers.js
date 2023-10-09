const CONTRACTS = require('../consts/CONTRACTS');

const wakeupWorkers = ({
    accountName,
    workerIds,
}) => {
    return {
        account: CONTRACTS.GAME,
        name: 'wakeworker',
        authorization: [
            {
                actor: accountName,
                permission: 'active',
            },
        ],
        data: {
            ids: workerIds,
        },
    };
};

module.exports = wakeupWorkers;