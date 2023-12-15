import CONTRACTS from '../consts/CONTRACTS';

const setBuildWage = ({
    accountName,
    id,
    wageObsd,
    isOnlyOwnWorkersAllowed,
    minWorkerLevel,
}) => {
    return {
        account: CONTRACTS.GAME,
        name: 'setbuldwage',
        authorization: [
            {
                actor: accountName,
                permission: 'active',
            },
        ],
        data: {
            id,
            contract_wage: `${wageObsd.toFixed(4)} OBSD`,
            own_workers: isOnlyOwnWorkersAllowed,
            min_worker_level: minWorkerLevel,
        },
    };
};

export default setBuildWage;