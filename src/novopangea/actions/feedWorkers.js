const _ = require('lodash');
const CONTRACTS = require('../consts/CONTRACTS');

const feedWorkers = ({
    accountName,
    buildings,
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
            feed_data: _(buildings)
                .map(b => ({
                    residential_id: b.id,
                    worker_ids: [
                        ..._(b.workers)
                            .map(worker => worker.id)
                            .value(),
                    ],
                }))
                .value(),
        },
    };
};

module.exports = feedWorkers;