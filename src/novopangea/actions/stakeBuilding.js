const _ = require('lodash');
const CONTRACTS = require('../consts/CONTRACTS');

const stakeBuilding = ({
    accountName,
    assetId,
    realmId,
    districtId,
    landId,
}) => {
    return {
        account: CONTRACTS.GAME,
        name: 'stakebuild',
        authorization: [
            {
                actor: accountName,
                permission: 'active',
            },
        ],
        data: {
            asset_id: assetId,
            realm_id: realmId,
            district_id: districtId,
            land_id: landId,
        },
    };
};

module.exports = stakeBuilding;