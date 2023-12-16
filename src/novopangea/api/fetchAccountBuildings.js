import _ from 'lodash';
import fetchBuildings from "./fetchBuildings";
import equalizeResources from '../utils/equalizeResources';
import fetchWorkerConfigs from './fetchWorkerConfigs';
import sumResources from '../utils/sumResources';
import multiplyResources from '../utils/multiplyResources';
import BUILDINGS_TO_TOWNHALL from '../consts/BUILDINGS_TO_TOWNHALL';

const REST_BUILDINGS = ['rest', 'creature'];
const SHIFT_TIME_MS = 12 * 60 * 60 * 1000;

const fetchAccountBuildings = async ({
    accountName,
    cache = {},
}) => {
    const now = Date.now();
    const buildings = cache.buildings || await fetchBuildings({});
    const workerConfigs = cache.workerConfigs || await fetchWorkerConfigs({});
    const ownBuildingsWithoutWageSet = _(buildings)
        .filter(building => building.owner === accountName)
        .filter(building => building.contractWage.waxCost === 0)
        .filter(building => building.district.level >= BUILDINGS_TO_TOWNHALL[building.level])
        .value();
    const ownBuildingsExpiredRentSet = _(buildings)
        .filter(building => building.owner === accountName)
        .filter(building => building.land.owner === accountName)
        .filter(building => (building.land.rentExpireTime - now) < SHIFT_TIME_MS)
        .filter(building => building.numWorkers === 0)
        .filter(building => building.district.level >= BUILDINGS_TO_TOWNHALL[building.level])
        .value();
    const ownBuildingsExpiredExternalRentSet = _(buildings)
        .filter(building => building.owner === accountName)
        .filter(building => building.land.owner !== accountName)
        .filter(building => building.land.rentExpireTime < now)
        .filter(building => building.district.level >= BUILDINGS_TO_TOWNHALL[building.level])
        .filter(building => building.numWorkers === 0)
        .value();
    const ownStaleBuildings = _(buildings)
        .filter(building => building.owner === accountName)
        .filter(building => building.district.level < BUILDINGS_TO_TOWNHALL[building.level])
        .filter(building => building.numWorkers === 0)
        .value();
    const sets = _(buildings)
        .groupBy(building => building.district.realm.name)
        .map((buildings, realmName) => ({
            realmName,
            buildings: _(_.range(1, 6))
                .map(level => {
                    const workerConfig = workerConfigs.find(config => config.level === level);

                    const leveledResourceBuildings = _(buildings)
                        .filter(building => !REST_BUILDINGS.includes(building.config.resourceType))
                        .filter(building => building.level >= level && building.minWorkerLevel <= level)
                        .filter(building => (building.land.rentExpireTime - now) > SHIFT_TIME_MS)
                        .filter(building => building.contractWage.waxCost > 0)
                        .filter(building => building.numWorkers < building.config.workerCapacity)
                        .value();
                    
                    // job buildings
                    const externalJobsAvailable = _(leveledResourceBuildings)
                        .filter(building => building.owner !== accountName)
                        .filter(building => !building.isOnlyOwnWorkersAllowed)
                        .sortBy(building => -building.contractWage.waxCost)
                        .groupBy(building => {
                            const targetWage = multiplyResources({
                                resources: building.contractWage.costs,
                                multiplier: workerConfig.wageMultiplier,
                            });
                            const targetResources = sumResources({
                                resources: multiplyResources({
                                    resources: [
                                        ...workerConfig.shiftCost.costs,
                                        ...targetWage,
                                    ],
                                    multiplier: 6,
                                }),
                            });
                            
                            const requestedResources = equalizeResources({
                                targetResources,
                                currentResources: building.account.balances,
                            });
                
                            return requestedResources.length === 0
                                ? 'enoughResources'
                                : 'notEnoughResources';
                        })
                        .value();
                    const ownJobsAvailable = _(leveledResourceBuildings)
                        .filter(building => building.owner === accountName)
                        .filter(building => -building.config.shiftYield.waxCost)
                        .value();
                    const bestJobBuildings = _([
                        ...externalJobsAvailable.enoughResources || [],
                        ...ownJobsAvailable,
                    ])
                        .map(building => {
                            if (building.owner === accountName) {
                                return {
                                    ...building,
                                    jobProfitObsd: building.yieldsObsd[level - 1],
                                };
                            }

                            return {
                                ...building,
                                jobProfitObsd: building.wagesObsd[level - 1],
                            };
                        })
                        .sortBy(building => building.jobProfitObsd)
                        .value();

                    // rest buildings
                    const restBuildings = _(buildings)
                        .filter(building => building.config.resourceType === 'rest')
                        .filter(building => (building.land.rentExpireTime - now) > SHIFT_TIME_MS)
                        .filter(building => building.numWorkers < building.config.workerCapacity)
                        .filter(building => building.contractWage.waxCost > 0)
                        .value();
                    const externalRestAvailable = _(restBuildings)
                        .filter(building => building.owner !== accountName)
                        .filter(building => !building.isOnlyOwnWorkersAllowed)
                        .sortBy(building => building.nRestPrice)
                        .groupBy(building => {
                            const requestedResources = equalizeResources({
                                targetResources: multiplyResources({
                                    resources: building.config.shiftCost.costs,
                                    multiplier: 6,
                                }),
                                currentResources: building.account.balances,
                            });

                            return requestedResources.length === 0
                                ? 'enoughResources'
                                : 'notEnoughResources';
                        })
                        .value();
                    const ownRestAvailable = _(restBuildings)
                        .filter(building => building.owner === accountName)
                        .sortBy(building => building.nOwnRestPrice)
                        .value();
                    const bestRestBuildings = _([
                        ...externalRestAvailable.enoughResources || [],
                        ...ownRestAvailable,
                    ])
                        .map(building => {
                            if (building.owner === accountName) {
                                return {
                                    ...building,
                                    restCostObsd: building.ownRestsObsd[level - 1],
                                };
                            }

                            return {
                                ...building,
                                restCostObsd: building.externalRestsObsd[level - 1],
                            };
                        })
                        .sortBy(building => -building.restCostObsd)
                        .value();
                    const bestUnskilledRestBuildings = _(bestRestBuildings)
                        .filter(building => {
                            if (building.owner === accountName) {
                                return building.level < 3;
                            }
                
                            return true;
                        })
                        .sortBy(building => -building.restCostObsd)
                        .value();

                    return {
                        // jobs
                        externalJobsAvailable: externalJobsAvailable.enoughResources || [],
                        ownJobsAvailable,
                        bestJobBuildings,

                        // rest
                        externalRestAvailable: externalRestAvailable.enoughResources || [],
                        ownRestAvailable,
                        bestRestBuildings,
                        bestUnskilledRestBuildings,

                        // not enough resources
                        externalJobsUnavailable: externalJobsAvailable.notEnoughResources || [],
                        externalRestUnavailable: externalRestAvailable.notEnoughResources || [],
                    };
                })
                .value(),
        }))
        .value();
    
    const unskilledJobBuildings = _(sets)
        .map(realm => realm.buildings[0].bestJobBuildings)
        .flatten()
        .filter(building => {
            if (building.owner === accountName) {
                return building.level < 3;
            }

            return true;
        })
        .sortBy(building => building.jobProfitObsd)
        .value();
    const unskilledRestBuildings = _(sets)
        .map(realm => realm.buildings[0].bestRestBuildings)
        .flatten()
        .filter(building => {
            if (building.owner === accountName) {
                return building.level < 3;
            }

            return true;
        })
        .sortBy(building => -building.restCostObsd)
        .value();

    return {
        buildings: sets,
        ownBuildingsWithoutWageSet,
        ownBuildingsExpiredRentSet,
        ownBuildingsExpiredExternalRentSet,
        unskilledJobBuildings,
        unskilledRestBuildings,
        ownStaleBuildings,
    };
};

export default fetchAccountBuildings;
