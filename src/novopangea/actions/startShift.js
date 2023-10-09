const CONTRACTS = require('../consts/CONTRACTS');

const startShift = ({
    accountName,
    assetId,
    realmId,
    districtId,
    buildingId,
}) => {
    return {
        account: CONTRACTS.GAME,
        name: 'stakeworker',
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
            building_id: buildingId,
        },
    };
};

module.exports = startShift;
