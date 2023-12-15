import CONTRACTS from '../consts/CONTRACTS';

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

export default wakeupWorkers;