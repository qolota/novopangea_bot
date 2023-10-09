const _ = require('lodash');
const CONTRACTS = require('../consts/CONTRACTS');

const renewRent = ({
    accountName,
    landIds,
}) => {
    return {
        account: CONTRACTS.GAME,
        name: 'renewrent',
        authorization: [
            {
                actor: accountName,
                permission: 'active',
            },
        ],
        data: {
            owner: accountName,
            land_ids: landIds,
        },
    };
};

module.exports = renewRent;