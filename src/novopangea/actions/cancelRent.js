import _ from 'lodash';
import CONTRACTS from '../consts/CONTRACTS';

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

export default cancelRent;