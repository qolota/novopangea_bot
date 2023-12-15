import CONTRACTS from '../consts/CONTRACTS';

const removeBuilding = ({
    accountName,
    buildingId,
}) => {
    return {
        account: CONTRACTS.GAME,
        name: 'removebuild',
        authorization: [
            {
                actor: accountName,
                permission: 'active',
            },
        ],
        data: {
            owner: accountName,
            id: buildingId,
        },
    };
};

export default removeBuilding;