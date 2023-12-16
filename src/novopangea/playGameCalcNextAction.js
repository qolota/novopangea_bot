import _ from 'lodash';
import setBuildWage from './actions/setBuildWage';
import wakeupWorkers from './actions/wakeupWorkers';
import multiplyResources from './utils/multiplyResources';
import sumResources from './utils/sumResources';
import exchangeTokens from './actions/exchangeTokens';
import getExchangeRate from './utils/getExchangeRate';
import RESOURCES from './consts/RESOURSES';
import EXCHANGE_STRATEGY from './consts/EXCHANGE_STRATEGY';
import MIN_TRANSACTION_VALUE from './consts/MIN_TRANSACTION_VALUE';
import findResource from './utils/findResource';
import startShift from './actions/startShift';
import log from '../utils/log';
import renewRent from './actions/renewRent';
import feedOneWorker from './actions/feedOneWorker';
import stakeBuilding from './actions/stakeBuilding';
import fetchAllGameData from './api/fetchAllGameData';
import removeBuilding from './actions/removeBuilding';
import setLandRent from './actions/setLandRent';
import startUpgrade from './actions/startUpgrade';
import finishUpgrade from './actions/finishUpgrade';
import exchangeResources from './utils/exchangeResources';
import {
    getEconomyValues,
} from './consts/ECONOMY_VALUES';

const findBuildings = ({
    buildings,
    realmName,
    level,
    buildingSetName,
}) => {
    return buildings
        .find(b => b.realmName === realmName)
        .buildings[level - 1][buildingSetName];
};

const findLands = ({
    lands,
    realmName,
    landSetName,
}) => {
    return lands.find(land => land.realmName === realmName)[landSetName];
};

// -------------------------------------------------------- //
// ---------               BALANCE               ---------- //
// -------------------------------------------------------- //
const MAX_OBSD_BALANCE = 20;

const getNextStateAfterTransferExcessObsdToNovo = ({
    prevState,
    accountName,
}) => {
    const obsdBalance = findResource({
        resources: prevState.resources,
        symbol: RESOURCES.OBSD,
    });
    
    if (obsdBalance.value <= MAX_OBSD_BALANCE) {
        return;
    }

    const excessObsResource = {
        value: _.floor((obsdBalance.value - MAX_OBSD_BALANCE + 3) / MIN_TRANSACTION_VALUE.NOVO) * MIN_TRANSACTION_VALUE.NOVO,
        symbol: RESOURCES.OBSD,
    };

    return {
        action: 'exchange',
        actions: [
            exchangeTokens({
                accountName,
                valueFrom: excessObsResource.value,
                symbolFrom: excessObsResource.symbol,
                symbolTo: RESOURCES.NOVO,
            }),
        ],
        resources: sumResources({
            resources: [
                ...prevState.resources,
                {
                    value: -excessObsResource.value,
                    symbol: excessObsResource.symbol,
                },
            ],
        }),
        availableWorkers: _.cloneDeep(prevState.availableWorkers),
        availableBuildings: _.cloneDeep(prevState.availableBuildings),
        availableLands: _.cloneDeep(prevState.availableLands),
        settings: _.cloneDeep(prevState.settings),
    };
};

const getNextStateAfterTransferAllResourecesToObsd = ({
    prevState,
    exchange,
    accountName,
}) => {
    const restBalances = _([
        RESOURCES.NOVOE,
        RESOURCES.NOVOM,
        RESOURCES.NOVOF,
    ])
        .map(symbol => findResource({
            resources: prevState.resources,
            symbol,
        }))
        .value();
    const hasRestResources = _.some(restBalances, b => {
        return b.value >= MIN_TRANSACTION_VALUE[b.symbol];
    });

    if (!hasRestResources) {
        return;
    }

    // convert all resources to OBSD
    const exchangeRestResources = getExchangeRate({
        exchange,
        resources: _(restBalances)
            .map(b => ({
                value: _.floor(b.value / MIN_TRANSACTION_VALUE[b.symbol]) * MIN_TRANSACTION_VALUE[b.symbol],
                symbol: b.symbol,
            }))
            .filter(b => b.value > 0)
            .value(),
        exchangeStrategy: EXCHANGE_STRATEGY,
    });
    const exchangedObsdBalance = sumResources({
        resources: _(exchangeRestResources)
            .map(r => ({
                value: r.valueFrom,
                symbol: r.symbolFrom,
            }))
            .value(),
    });

    return {
        action: 'exchange',
        actions: _(exchangeRestResources)
            .map(b => exchangeTokens({
                accountName,
                valueFrom: b.valueTo,
                symbolFrom: b.symbolTo,
                symbolTo: b.symbolFrom,
            }))
            .value(),
        resources: sumResources({
            resources: [
                ...prevState.resources,
                ...exchangedObsdBalance,
                ..._(exchangeRestResources)
                    .map(b => ({
                        value: -b.valueTo,
                        symbol: b.symbolTo,
                    }))
                    .value(),
            ],
        }),
        availableWorkers: _.cloneDeep(prevState.availableWorkers),
        availableBuildings: _.cloneDeep(prevState.availableBuildings),
        availableLands: _.cloneDeep(prevState.availableLands),
        settings: _.cloneDeep(prevState.settings),
    };
};

// -------------------------------------------------------- //
// ---------                JOB                  ---------- //
// -------------------------------------------------------- //
const getNextStateAfterOwnShiftStart = ({
    prevState,
    accountName,
    exchange,
    building,
    worker,
    account,
}) => {
    const totalYield = multiplyResources({
        resources: building.shiftYield.costs,
        multiplier: worker.config.yieldMultiplier,
    });

    const nextState = exchangeResources({
        accountName,
        exchange,
        balances: prevState.resources,
        maxBalances: account.maxBalances,
        requestedResources: worker.config.shiftCost.costs,
    });

    if (nextState.action === 'stop') {
        return nextState;
    }

    return {
        action: 'start_own_shift',
        actions: [
            ...nextState.actions,
            startShift({
                accountName,
                assetId: worker.assetId,
                realmId: building.realmId,
                districtId: building.districtId,
                buildingId: building.id,
            }),
        ],
        resources: sumResources({
            resources: [
                ...nextState.nextBalances,
                ...totalYield,
            ],
        }),
        availableWorkers: _.cloneDeep(prevState.availableWorkers),
        availableBuildings: _.cloneDeep(prevState.availableBuildings),
    };
};

const getNextStateAfterExternalShiftStart = ({
    prevState,
    accountName,
    building,
    worker,
    account, // TODO validate max storage capacity
}) => {
    console.log(JSON.stringify(worker, null, 2));
    return {
        action: 'start_external_shift',
        actions: [
            startShift({
                accountName,
                assetId: worker.assetId,
                realmId: building.realmId,
                districtId: building.districtId,
                buildingId: building.id,
            }),
        ],
        resources: sumResources({
            resources: [
                ...prevState.resources,
                // total shift wage
                ...multiplyResources({
                    resources: building.contractWage.costs,
                    multiplier: worker.config.wageMultiplier,
                }),
            ],
        }),
        availableWorkers: _.cloneDeep(prevState.availableWorkers),
        availableBuildings: _.cloneDeep(prevState.availableBuildings),
    };
};

const getNextStateAfterShiftStart = ({
    prevState,
    accountName,
    exchange,
    account,
}) => {
    if (prevState.availableWorkers.length === 0) {
        return;
    }

    if (prevState.availableBuildings.length === 0) {
        return;
    }

    // find a suitable building for a next worker
    const _prevState = _.cloneDeep(prevState);
    const worker = _prevState.availableWorkers.pop();
    const building = _prevState.availableBuildings.pop();
    building.numWorkers++;

    if (building.numWorkers < building.maxWorkers) {
        _prevState.availableBuildings.push(building);
    }

    if (building.isOwnBuilding) {
        return getNextStateAfterOwnShiftStart({
            prevState: _prevState,
            accountName,
            exchange,
            building,
            worker,
            account,
        });
    }

    return getNextStateAfterExternalShiftStart({
        prevState: _prevState,
        accountName,
        building,
        worker,
        account,
    });
};

const _prepShiftBuildings = ({
    accountName,
    buildings,
    level,
}) => {
    const economyValues = getEconomyValues();
    return _(buildings)
        .map(building => ({
            id: building.id,
            realmId: building.district.realm.id,
            districtId: building.district.id,
            isOwnBuilding: building.owner === accountName,
            numWorkers: building.numWorkers,
            maxWorkers: building.config.workerCapacity,
            // wage fields for both own and external jobs
            jobProfitObsd: building.jobProfitObsd,
            contractWage: building.contractWage,
            shiftYield: building.config.shiftYield,
        }))
        .filter(building => building.jobProfitObsd > economyValues.JOB_MIN_PROFITS_OBSD[level - 1])
        .sortBy(building => building.jobProfitObsd)
        .value();
};

const _getStartMixedShiftAction = ({
    accountName,
    exchange,
    account,
    gameSettings,
    realm,
    actionName,
}) => {
    const states = [
        {
            action: 'init',
            resources: account.balances,
            availableWorkers: _.cloneDeep(realm.availableWorkers),
            availableBuildings: _.cloneDeep(realm.availableBuildings),
        },
    ];

    while (true) {
        const prevState = states[states.length - 1];

        if (prevState.availableWorkers.length === 0) {
            break;
        }
        if (prevState.availableBuildings.length === 0) {
            break;
        }

        const nextStateTransferExcessObsdToNovo = getNextStateAfterTransferExcessObsdToNovo({
            prevState,
            accountName,
        });

        if (nextStateTransferExcessObsdToNovo != null) {
            states.push(nextStateTransferExcessObsdToNovo);
            continue;
        }

        const nextStateAfterTransferAllResourecesToObsd = getNextStateAfterTransferAllResourecesToObsd({
            prevState,
            exchange,
            accountName,
        });

        if (nextStateAfterTransferAllResourecesToObsd != null) {
            states.push(nextStateAfterTransferAllResourecesToObsd);
            continue;
        }

        const nextStateAfterShiftStart = getNextStateAfterShiftStart({
            prevState,
            accountName,
            exchange,
            account,
        });

        if (nextStateAfterShiftStart != null) {
            if (nextStateAfterShiftStart.action === 'stop') {
                log({
                    project: gameSettings.name,
                    message: nextStateAfterShiftStart.action.message,
                });
                break;
            }

            states.push(nextStateAfterShiftStart);
        }
    }

    const actions = _(states)
        .map(state => state.actions)
        .compact()
        .flatten()
        .value();
    
    if (actions.length === 0) {
        return;
    }

    return {
        action: actionName,
        isMultipleTransactions: true,
        actions: _.chunk(actions, 12),
    };
};

const getStartMixedShiftAction = ({
    accountName,
    exchange,
    account,
    buildings,
    workers,
    gameSettings,
}) => {
    if (workers.length === 0) {
        return;
    }

    const realms = _(workers)
        .groupBy(worker => worker.level)
        .map((workers, level) => {
            const _level = Number(level);
            return _(workers)
                .groupBy(worker => worker.realmName)
                .map((workers, realmName) => ({
                    realmName,
                    level: _level,
                    availableWorkers: workers,
                    availableBuildings: _prepShiftBuildings({
                        accountName,
                        buildings: findBuildings({
                            buildings,
                            realmName,
                            level: _level,
                            buildingSetName: 'bestJobBuildings'
                        }),
                        level: _level,
                    }),
                }))
                .value();
        })
        .flatten()
        .sortBy(realm => -realm.level)
        .value();

    // processing one realm at once
    const realm = realms.find(realm => realm.availableBuildings.length > 0);
    
    if (realm == null) {
        log({
            project: gameSettings.name,
            message: `[SKILLED] No available job buildings but ${workers.length} available workers`,
        });
        return null;
    }

    return _getStartMixedShiftAction({
        accountName,
        exchange,
        account,
        gameSettings,
        realm,
        actionName: 'start_mixed_shifts',
    });
};

const getStartMixedUnskilledShiftAction = ({
    accountName,
    exchange,
    account,
    buildings,
    workers,
    gameSettings,
}) => {
    if (workers.length === 0) {
        return;
    }
    
    const realm = {
        availableWorkers: workers,
        availableBuildings: _prepShiftBuildings({
            accountName,
            buildings,
            level: 1,
        }),
    };
    // console.log(`[UNSKILLED] Job buildings: `, realm);

    return _getStartMixedShiftAction({
        accountName,
        exchange,
        account,
        gameSettings,
        realm,
        actionName: 'start_mixed_unskilled_shifts',
    });
};

// -------------------------------------------------------- //
// ---------                REST                 ---------- //
// -------------------------------------------------------- //
const getNextStateAfterRestStart = ({
    prevState,
    accountName,
    exchange,
    account,
}) => {
    if (prevState.availableWorkers.length === 0) {
        return;
    }

    if (prevState.availableBuildings.length === 0) {
        return;
    }

    // find a suitable building for a next worker
    const availableWorkers = _.cloneDeep(prevState.availableWorkers);
    const availableBuildings = _.cloneDeep(prevState.availableBuildings);
    const worker = availableWorkers.pop();
    const building = availableBuildings.pop();
    building.numWorkers++;

    if (building.numWorkers < building.maxWorkers) {
        availableBuildings.push(building);
    }

    // calculate total cost depends on rest building ownership
    let totalCosts;
    if (building.isOwnBuilding) {
        totalCosts = sumResources({
            resources: [
                ...building.shiftCost.costs,
                ...worker.config.foodCost.costs,
            ],
        });
    } else {
        totalCosts = sumResources({
            resources: [
                ...building.contractWage.costs,
                ...worker.config.foodCost.costs,
            ],
        });
    }

    const nextState = exchangeResources({
        accountName,
        exchange,
        balances: prevState.resources,
        maxBalances: account.maxBalances,
        requestedResources: totalCosts,
    });

    if (nextState.action === 'stop') {
        return nextState;
    }

    return {
        action: building.isOwnBuilding
            ? 'start_own_rest'
            : 'start_external_rest',
        actions: [
            ...nextState.actions,
            feedOneWorker({
                accountName,
                buildingId: building.id,
                workerId: worker.id,
                realmId: building.realmId,
                districtId: building.districtId,
            }),
        ],
        resources: sumResources({
            resources: [
                ...nextState.nextBalances,
            ],
        }),
        availableWorkers,
        availableBuildings,
    };
};

const _getStartMixedRestAction = ({
    accountName,
    exchange,
    account,
    gameSettings,
    realm,
    actionName,
}) => {
    const states = [
        {
            action: 'init',
            resources: account.balances,
            availableWorkers: _.cloneDeep(realm.availableWorkers),
            availableBuildings: _.cloneDeep(realm.availableBuildings),
        },
    ];

    while (true) {
        const prevState = states[states.length - 1];

        if (prevState.availableWorkers.length === 0) {
            break;
        }
        if (prevState.availableBuildings.length === 0) {
            break;
        }

        const nextStateTransferExcessObsdToNovo = getNextStateAfterTransferExcessObsdToNovo({
            prevState,
            accountName,
        });

        if (nextStateTransferExcessObsdToNovo != null) {
            states.push(nextStateTransferExcessObsdToNovo);
            continue;
        }

        const nextStateAfterTransferAllResourecesToObsd = getNextStateAfterTransferAllResourecesToObsd({
            prevState,
            exchange,
            accountName,
        });

        if (nextStateAfterTransferAllResourecesToObsd != null) {
            states.push(nextStateAfterTransferAllResourecesToObsd);
            continue;
        }

        const nextStateAfterRestStart = getNextStateAfterRestStart({
            prevState,
            accountName,
            exchange,
            account,
        });

        if (nextStateAfterRestStart != null) {
            if (nextStateAfterRestStart.action === 'stop') {
                log({
                    project: gameSettings.name,
                    message: nextStateAfterRestStart.action.message,
                });
                break;
            }

            states.push(nextStateAfterRestStart);
        }
    }

    const actions = _(states)
        .map(state => state.actions)
        .compact()
        .flatten()
        .value();
    
    if (actions.length === 0) {
        return;
    }
    
    return {
        action: actionName,
        isMultipleTransactions: true,
        actions: _.chunk(actions, 12),
    };
};

const _prepRestBuildings = ({
    accountName,
    buildings,
    level,
}) => {
    const economyValues = getEconomyValues();
    return _(buildings)
        .map(building => ({
            id: building.id,
            realmId: building.district.realm.id,
            districtId: building.district.id,
            isOwnBuilding: building.owner === accountName,
            numWorkers: building.numWorkers,
            maxWorkers: building.config.workerCapacity,
            // wage fields for both own and external jobs
            restCostObsd: building.restCostObsd,
            contractWage: building.contractWage,
            shiftCost: building.config.shiftCost,
        }))
        .filter(building => building.restCostObsd < economyValues.REST_MAX_COST_OBSD[level - 1])
        .sortBy(building => -building.restCostObsd)
        .value();
};

const getStartMixedRestAction = ({
    accountName,
    exchange,
    account,
    buildings,
    workers,
    gameSettings,
}) => {
    if (workers.length === 0) {
        return;
    }

    const realms = _(workers)
        .groupBy(worker => worker.level)
        .map((workers, level) => {
            const _level = Number(level);
            return _(workers)
                .groupBy(worker => worker.district.realm.name)
                .map((workers, realmName) => ({
                    realmName,
                    level: _level,
                    availableWorkers: workers,
                    availableBuildings: _prepRestBuildings({
                        accountName,
                        buildings: findBuildings({
                            buildings,
                            realmName,
                            level: _level,
                            buildingSetName: 'bestRestBuildings'
                        }),
                        level: _level,
                    }),
                }))
                .value();
        })
        .flatten()
        .sortBy(realm => -realm.level)
        .value();
    
    // processing one realm at once
    const realm = realms.find(realm => realm.availableBuildings.length > 0);
    
    if (realm == null) {
        log({
            project: gameSettings.name,
            message: `[SKILLED] No available rest buildings but ${workers.length} available workers`,
        });
        return null;
    }

    return _getStartMixedRestAction({
        accountName,
        exchange,
        account,
        gameSettings,
        realm,
        actionName: 'start_mixed_rests',
    });
};

const getStartMixedUnskilledRestAction = ({
    accountName,
    exchange,
    account,
    buildings,
    workers,
    gameSettings,
}) => {
    if (workers.length === 0) {
        return;
    }

    const realms = _(workers)
        .groupBy(worker => worker.district.realm.name)
        .map((workers, realmName) => ({
            realmName,
            availableWorkers: workers,
            availableBuildings: _prepRestBuildings({
                accountName,
                buildings: findBuildings({
                    buildings,
                    realmName,
                    level: 1,
                    buildingSetName: 'bestUnskilledRestBuildings'
                }),
                level: 1,
            }),
        }))
        .value();
    
    // processing one realm at once
    const realm = realms.find(realm => realm.availableBuildings.length > 0);
    
    if (realm == null) {
        log({
            project: gameSettings.name,
            message: `[UNSKILLED] No available rest buildings but ${workers.length} available workers`,
        });
        return null;
    }

    return _getStartMixedRestAction({
        accountName,
        exchange,
        account,
        gameSettings,
        realm,
        actionName: 'start_mixed_unskilled_rests',
    });
};

// -------------------------------------------------------- //
// ---------                 RENT                ---------- //
// -------------------------------------------------------- //
const getRenewRentAction = ({
    accountName,
    exchange,
    account,
    buildings,
    gameSettings,
}) => {
    if (buildings.length === 0) {
        return;
    }

    const lands = _(buildings)
        .map(building => building.land)
        .value();
    
    const totalCosts = sumResources({
        resources: _(lands)
            .map(land => land.config.plotRentAmount.costs)
            .flatten()
            .value(),
    });

    const nextState = exchangeResources({
        accountName,
        exchange,
        balances: account.balances,
        maxBalances: account.maxBalances,
        requestedResources: totalCosts,
    });

    if (nextState.action === 'stop') {
        log({
            project: gameSettings.name,
            message: nextState.message,
        });
        return null;
    }

    return {
        action: 'renew_rent',
        actions: [
            ...nextState.actions,
            renewRent({
                accountName,
                landIds: _(lands)
                    .map(land => land.id)
                    .value(),
            }),
        ],
    };
};

const getNextStateAfterRentLandStart = ({
    prevState,
    accountName,
    landConfigs,
    exchange,
    account,
}) => {
    if (prevState.availableBuildings.length === 0) {
        return;
    }

    if (prevState.availableLands.length === 0) {
        return;
    }

    // find a suitable building for a next worker
    const availableBuildings = _.cloneDeep(prevState.availableBuildings);
    const availableLands = _.cloneDeep(prevState.availableLands);
    const building = availableBuildings.pop();
    const land = availableLands.pop();
    const landConfig = _(landConfigs)
        .sortBy(config => config.rentTime)
        .value()[0];

    // calculate total cost depends on land ownership
    let totalCosts = [];
    if (land.isOwnLand) {
        if (!land.isAvailableForRent) {
            totalCosts = [
                ...landConfig.plotRentAmount.costs,
            ];
        }
    } else {
        totalCosts = [
            ...land.rentCost.costs,
        ];
    }

    const nextState = exchangeResources({
        accountName,
        exchange,
        balances: prevState.resources,
        maxBalances: account.maxBalances,
        requestedResources: totalCosts,
    });

    if (nextState.action === 'stop') {
        return nextState;
    }

    return {
        action: land.isOwnLand
            ? 'start_own_land_rent'
            : 'start_external_land_rent',
        actions: _.compact([
            ...nextState.actions,
            land.isOwnLand && !land.isAvailableForRent
                ? setLandRent({
                    accountName,
                    id: land.id,
                    rentObsd: 0,
                    isOwnerOccupied: true,
                    landConfigId: landConfig.id,
                })
                : null,
            stakeBuilding({
                accountName,
                assetId: building.assetId,
                realmId: land.realmId,
                districtId: land.districtId,
                landId: land.id,
            }),
        ]),
        resources: sumResources({
            resources: [
                ...nextState.nextBalances,
            ],
        }),
        availableBuildings,
        availableLands,
    };
};

const getRentMixedLandsAction = ({
    accountName,
    exchange,
    account,
    lands,
    buildings,
    landConfigs,
    gameSettings,
}) => {
    const economyValues = getEconomyValues();
    const qualifiedBuildings = _(buildings)
        .filter(building => building.level >= economyValues.MIN_RENT_BUILDING_LEVELS[building.config.resourceType])
        .value();

    if (qualifiedBuildings.length === 0) {
        return;
    }

    const realms = _(qualifiedBuildings)
        .groupBy(building => building.realmName)
        .map((buildings, realmName) => ({
            realmName,
            availableBuildings: buildings,
            availableLands: _(findLands({
                lands,
                realmName,
                landSetName: 'bestLands',
            }))
                .map(land => ({
                    id: land.id,
                    realmId: land.district.realm.id,
                    districtId: land.district.id,
                    owner: land.owner,
                    isOwnLand: land.owner === accountName,
                    isAvailableForRent: land.isAvailableForRent,
                    rentPriceObsd: land.rentPriceObsd,
                    rentCost: land.rentCost,
                }))
                .filter(land => land.rentPriceObsd < economyValues.MAX_LAND_RENT_PRICE_OBSD)
                .sortBy(land => -land.rentPriceObsd)
                .value(),
        }))
        .value();

    // process one realm at a time
    const realm = realms.find(realm => realm.availableLands.length > 0);

    if (realm == null) {
        log({
            project: gameSettings.name,
            message: `No available lands but ${qualifiedBuildings.length} available buildings: ${qualifiedBuildings.map(b => b.realmName).join(', ')}`,
        });
        return;
    }

    const states = [
        {
            action: 'init',
            resources: account.balances,
            availableBuildings: _.cloneDeep(realm.availableBuildings),
            availableLands: _.cloneDeep(realm.availableLands),
        },
    ];

    while (true) {
        const prevState = states[states.length - 1];

        if (prevState.availableBuildings.length === 0) {
            break;
        }
        if (prevState.availableLands.length === 0) {
            break;
        }

        const nextStateTransferExcessObsdToNovo = getNextStateAfterTransferExcessObsdToNovo({
            prevState,
            accountName,
        });

        if (nextStateTransferExcessObsdToNovo != null) {
            states.push(nextStateTransferExcessObsdToNovo);
            continue;
        }

        const nextStateAfterTransferAllResourecesToObsd = getNextStateAfterTransferAllResourecesToObsd({
            prevState,
            exchange,
            accountName,
        });

        if (nextStateAfterTransferAllResourecesToObsd != null) {
            states.push(nextStateAfterTransferAllResourecesToObsd);
            continue;
        }

        const nextStateAfterRentLandStart = getNextStateAfterRentLandStart({
            prevState,
            accountName,
            exchange,
            landConfigs,
            account,
        });

        if (nextStateAfterRentLandStart != null) {
            if (nextStateAfterRentLandStart.action === 'stop') {
                log({
                    project: gameSettings.name,
                    message: nextStateAfterRentLandStart.action.message,
                });
                break;
            }

            states.push(nextStateAfterRentLandStart);
        }
    }

    const actions = _(states)
        .map(state => state.actions)
        .compact()
        .flatten()
        .value();

    if (actions.length === 0) {
        return;
    }

    return {
        action: 'rent_mixed_lands',
        isMultipleTransactions: true,
        actions: _.chunk(actions, 12),
    };
};

// -------------------------------------------------------- //
// ---------               UPGRADE               ---------- //
// -------------------------------------------------------- //

const getNextStateAfterStartWorkerUpgrade = ({
    prevState,
    accountName,
    exchange,
    account,
}) => {
    const settings = _.cloneDeep(prevState.settings);
    const {
        worker,
        config,
    } = settings.pop();

    const nextState = exchangeResources({
        accountName,
        exchange,
        balances: prevState.resources,
        maxBalances: account.maxBalances,
        requestedResources: config.upgradeCost.costs,
    });

    if (nextState.action === 'stop') {
        return nextState;
    }

    return {
        action: 'upgrading_workers',
        actions: [
            ...nextState.actions,
            startUpgrade({
                accountName,
                assetId: worker.id,
            }),
        ],
        resources: sumResources({
            resources: [
                ...nextState.nextBalances,
            ],
        }),
        settings,
    };
};

const getStartWorkerUpgradesAction = ({
    account,
    exchange,
    accountName,
    upgradeConfigs,
    workers,
    gameSettings,
}) => {
    if (workers.length === 0) {
        return;
    }

    const settings = _(workers)
        .map(worker => ({
            worker,
            config: upgradeConfigs
                .find(config => config.key === worker.realmName)
                .configs
                .find(config => config.baseLevel === worker.level),
        }))
        .value();

    const states = [
        {
            action: 'init',
            resources: account.balances,
            settings: _.cloneDeep(settings),
        },
    ];

    while(true) {
        const prevState = states[states.length - 1];

        if (prevState.settings.length === 0) {
            break;
        }

        const nextStateTransferExcessObsdToNovo = getNextStateAfterTransferExcessObsdToNovo({
            prevState,
            accountName,
        });

        if (nextStateTransferExcessObsdToNovo != null) {
            states.push(nextStateTransferExcessObsdToNovo);
            continue;
        }

        const nextStateAfterTransferAllResourecesToObsd = getNextStateAfterTransferAllResourecesToObsd({
            prevState,
            exchange,
            accountName,
        });

        if (nextStateAfterTransferAllResourecesToObsd != null) {
            states.push(nextStateAfterTransferAllResourecesToObsd);
            continue;
        }

        const nextStateAfterStartWorkerUpgrade = getNextStateAfterStartWorkerUpgrade({
            prevState,
            accountName,
            exchange,
            account,
        });

        if (nextStateAfterStartWorkerUpgrade != null) {
            if (nextStateAfterStartWorkerUpgrade.action === 'stop') {
                log({
                    project: gameSettings.name,
                    message: nextStateAfterStartWorkerUpgrade.action.message,
                });
                break;
            }

            states.push(nextStateAfterStartWorkerUpgrade);
        }
    }

    const actions = _(states)
        .map(state => state.actions)
        .compact()
        .flatten()
        .value();
    
    if (actions.length === 0) {
        return;
    }
    
    return {
        action: 'upgrade_workers',
        isMultipleTransactions: true,
        actions: _.chunk(actions, 12),
    };
};

const getFinishUpgradesAction = ({
    accountName,
    upgrades,
}) => {
    const now = Date.now();

    const finishedUpgrades = _(upgrades)
        .filter(upgrade => upgrade.owner === accountName)
        .filter(upgrade => upgrade.endTime < now)
        .value();

    if (finishedUpgrades.length === 0) {
        return;
    }

    return {
        action: 'finish_upgrades',
        actions: _(finishedUpgrades)
            .map(upgrade => finishUpgrade({
                accountName,
                assetId: upgrade.assetId,
            }))
            .value(),
    }
};

// -------------------------------------------------------- //
// ---------             ENTRY POIN              ---------- //
// -------------------------------------------------------- //
const playGameCalcNextAction = async ({
    accountName,
    gameSettings,
}) => {
    const economyValues = getEconomyValues();
    const {
        exchange,
        account,
        accountBuildings,
        accountWorkers,
        accountLands,
        accountTransfers,
        landConfigs,
        upgradeConfigs,
        upgrades,
    } = await fetchAllGameData({
        accountName,
    });

    // showing alert if some buildings places in district with inappropriate town hall level
    if (accountBuildings.ownStaleBuildings.length > 0) {
        const staleRealms = _(accountBuildings.ownStaleBuildings)
            .map(building => building.district.realm.name)
            .uniq()
            .value();
        log({
            project: gameSettings.name,
            message: `[ACTION NEEDED] ${accountBuildings.ownStaleBuildings.length} stale buildings, need to be moved to another district, relams: ${staleRealms.join(', ')}`,
        });
    }

    // wake up all available workers
    if (accountWorkers.readyToWakeupWorkers.length > 0) {
        return {
            action: 'wakeup',
            isMultipleTransactions: true,
            actions: _(accountWorkers.readyToWakeupWorkers)
                .map(worker => worker.id)
                .chunk(36)
                .map(workerIds => ([
                    wakeupWorkers({
                        accountName,
                        workerIds,
                    }),
                ]))
                .value(),
        };
    }
    
    // set wage for all avaialbe buildings
    if (accountBuildings.ownBuildingsWithoutWageSet.length > 0) {
        return {
            action: 'set_building_wage',
            isMultipleTransactions: true,
            actions: _(accountBuildings.ownBuildingsWithoutWageSet)
                .map(b => setBuildWage({
                    accountName,
                    id: b.id,
                    wageObsd: b.config.minimumWage.obsdCost,
                    isOnlyOwnWorkersAllowed: true,
                    minWorkerLevel: 1,
                }))
                .chunk(12)
                .value(),
        };
    }
    
    // prolong rent for buildings placed on your lands
    if (accountBuildings.ownBuildingsExpiredExternalRentSet.length > 0) {
        return {
            action: 'cancel_external_rent',
            actions: _(accountBuildings.ownBuildingsExpiredExternalRentSet)
                .map(building => removeBuilding({
                    accountName,
                    buildingId: building.id,
                }))
                .value(),
        };
    }
    const startMixedShiftsAction = getStartMixedShiftAction({
        accountName,
        exchange,
        account,
        buildings: accountBuildings.buildings,
        workers: [
            ...accountWorkers.readyToWorkWorkers,
        ],
        gameSettings,
    });

    const startMixedUnskilledShiftsAction = getStartMixedUnskilledShiftAction({
        accountName,
        exchange,
        account,
        buildings: accountBuildings.unskilledJobBuildings,
        workers: accountWorkers.readyToWorkUnskilledWorkers,
        gameSettings,
    });

    const startMixedUnskilledRestAction = getStartMixedUnskilledRestAction({
        accountName,
        exchange,
        account,
        buildings: accountBuildings.buildings,
        workers: accountWorkers.readyToRestUnskilledWorkers,
        gameSettings,
    });
    
    const startMixedRestsAction = getStartMixedRestAction({
        accountName,
        exchange,
        account,
        buildings: accountBuildings.buildings,
        workers: accountWorkers.readyToRestWorkers,
        gameSettings,
    });

    const startRenewRentAction = getRenewRentAction({
        accountName,
        exchange,
        account,
        buildings: accountBuildings.ownBuildingsExpiredRentSet,
        gameSettings,
    });

    const rentExternalLandsAction = getRentMixedLandsAction({
        accountName,
        exchange,
        account,
        lands: accountLands.lands,
        buildings: accountTransfers.buildings,
        landConfigs,
        gameSettings,
    });

    const startWorkerUpgradesAction = getStartWorkerUpgradesAction({
        account,
        exchange,
        accountName,
        upgradeConfigs: upgradeConfigs.workers,
        workers: accountWorkers.readyToUpgradeWorkers,
        gameSettings,
    });

    const finishUpgradesAction = getFinishUpgradesAction({
        accountName,
        upgrades,
    });

    if (finishUpgradesAction != null) {
        return finishUpgradesAction;
    }

    if (economyValues.ENABLE_WORKER_UPGRADES && startWorkerUpgradesAction != null) {
        return startWorkerUpgradesAction;
    }

    if (economyValues.ENABLE_RENT_EXTERNAL_LANDS && rentExternalLandsAction != null) {
        return rentExternalLandsAction;
    }
    
    if (economyValues.ENABLE_REST_SKILLED_WORKERS && startMixedRestsAction != null) {
        return startMixedRestsAction;
    }

    if (economyValues.ENABLE_REST_UNSKILLED_WORKERS && startMixedUnskilledRestAction != null) {
        return startMixedUnskilledRestAction;
    }
    
    if (economyValues.ENABLE_RENEW_RENT_LANDS && startRenewRentAction != null) {
        return startRenewRentAction;
    }

    if (economyValues.ENABLE_SHIFT_SKILLED_WORKERS && startMixedShiftsAction != null) {
        return startMixedShiftsAction;
    }

    if (economyValues.ENABLE_SHIFT_UNSKILLED_WORKERS && startMixedUnskilledShiftsAction != null) {
        return startMixedUnskilledShiftsAction;
    }

    return {
        action: 'wait',
        message: `Nothing to do for ${accountName}`,
    };
};

export default playGameCalcNextAction;
