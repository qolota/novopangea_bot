const _ = require('lodash');
const fetchAllWaxData2 = require('../../core/fetchAllWaxData2');
const CONTRACTS = require('../consts/CONTRACTS');
const fetchAssets = require('../../atomicassets/api/fetchAssets');
const fetchWorkerConfigs = require('./fetchWorkerConfigs');
const fetchBuildingConfigs = require('./fetchBuildingConfigs');
const fetchSpeedupConfigs = require('./fetchSpeedupConfigs');

const fetchAccountTransfers = async ({
    accountName,
    cache = {},
}) => {
    const workerConfigs = cache.workerConfigs || await fetchWorkerConfigs({});
    const buildingConfigs = cache.buildingConfigs || await fetchBuildingConfigs({});
    const speedupConfigs = cache.speedupConfigs || await fetchSpeedupConfigs();
    const transfers = await fetchAllWaxData2({
        params: {
            code: CONTRACTS.GAME,
            scope: CONTRACTS.GAME,
            table: 'transfers',
        },
        customProcessor: ({row}) => ({
            assetId: row.asset_id,
            owner: row.owner,
            time: row.time * 1000,
        }),
    });
    
    const accountTransfers = _(transfers)
        .filter(transfer => transfer.owner === accountName)
        .value();
    
    let assets = {
        workers: [],
        buildings: [],
        travelpasses: [],
        speedups: [],
    };
    if (accountTransfers.length > 0) {
        const _assets = _(await fetchAssets({
            params: {
                ids: _.map(accountTransfers, t => t.assetId).join(','),
            },
            customProcessor: ({asset}) => {
                switch(asset.schema.schema_name) {
                    case 'worker':
                        const workerLevel = Number(asset.data.rarity.split(' ')[1]);
                        const isSkilledWorker = asset.data.realm !== 'Unskilled';
                        return {
                            assetId: asset.asset_id,
                            level: workerLevel,
                            realmName: isSkilledWorker
                                ? asset.data.realm
                                : null,
                            config: workerConfigs.find(config => config.level === workerLevel),
                            isSkilledWorker,
                            numShiftsLeft: isSkilledWorker
                                ? 0
                                : Number(asset.data.shifts),
                            key: 'workers',
                        };
                    case 'building':
                        const buildingLevel = Number(asset.data.rarity.split(' ')[1]);
                        const resourceType = asset.data.resource.toLowerCase();
                        return {
                            assetId: asset.asset_id,
                            level: buildingLevel,
                            realmName: asset.data.realm,
                            config: buildingConfigs.find(config => config.level === buildingLevel && config.resourceType === resourceType),
                            key: 'buildings',
                        };
                    case 'travelpass':
                        return {
                            assetId: asset.asset_id,
                            realmName: asset.data.realm,
                            key: 'travelpasses',
                        };
                    case 'land':
                        return {
                            assetId: asset.asset_id,
                            realmName: asset.data.realm,
                            key: 'lands',
                        };
                    case 'chapter.one':
                    case 'chapter.two':
                    case 'sketch':
                    case 'promo':
                        return {
                            assetId: asset.asset_id,
                            realmName: asset.data.realm,
                            rarity: asset.data.rarity || asset.data.Rarity,
                            color: asset.data.color,
                            config: speedupConfigs.find(config => config.level === asset.data.rarity),
                            key: 'speedups',
                        };
                }
            },
        }))
            .groupBy(asset => asset.key)
            .value();
        
        assets = {
            ...assets,
            ..._assets,
        };
    }

    return assets;
};

module.exports = fetchAccountTransfers;