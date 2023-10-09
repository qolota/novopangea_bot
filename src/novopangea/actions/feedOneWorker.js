const _ = require('lodash');
const CONTRACTS = require('../consts/CONTRACTS');

const feedOneWorker = ({
    accountName,
    buildingId,
    workerId,
    realmId,
    districtId,
}) => {
    return {
        account: CONTRACTS.EXCHANGE,
        name: 'feedworker',
        authorization: [
            {
                actor: accountName,
                permission: 'active',
            },
        ],
        data: {
            owner: accountName,
            realm_id: realmId,
            district_id: districtId,
            feed_data: [
                {
                    residential_id: buildingId,
                    worker_ids: [
                        workerId,
                    ],
                },
            ]
        },
    };
};

module.exports = feedOneWorker;