import _ from 'lodash';
import CONTRACTS from '../consts/CONTRACTS';

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

export default removeWorkers;