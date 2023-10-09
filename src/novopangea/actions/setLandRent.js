const CONTRACTS = require('../consts/CONTRACTS');

const setLandRent = ({
    accountName,
    id,
    rentObsd,
    isOwnerOccupied,
    landConfigId,
}) => {
    return {
        account: CONTRACTS.GAME,
        name: 'setlandrent',
        authorization: [
            {
                actor: accountName,
                permission: 'active',
            },
        ],
        data: {
            id,
            owner_occupied: isOwnerOccupied,
            rent: `${rentObsd.toFixed(4)} OBSD`,
            landcfg_id: landConfigId,
        },
    };
};

module.exports = setLandRent;