const _ = require('lodash');
const CONTRACTS = require('../consts/CONTRACTS');

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

module.exports = removeBuilding;