import _ from 'lodash';
import fetchDistricts from './fetchDistricts';
import fetchAllWaxData2 from '../../core/fetchAllWaxData2';
import CONTRACTS from '../consts/CONTRACTS';
import fetchBuildingConfigs from './fetchBuildingConfigs';
import fetchExchange from './fetchExchange';
import fetchNovoPrice from './fetchNovoPrice';
import convertAllCosts from '../utils/convertAllCosts';
import REST_TIME from '../consts/REST_TIME';
import fetchLands from './fetchLands';
import fetchLandConfigs from './fetchLandConfigs';
import fetchWorkerConfigs from './fetchWorkerConfigs';
import fetchAccounts from './fetchAccounts';

const ONE_DAY = 60 * 60 * 24;
const AVG_WAGE_OBSD = 1.15;
const CREATURE_REST_TIME = 64800;

const getRestBuildingProfile = ({
    config,
    district,
    contractWage,
    workerConfigs,
    buildingLevel,
}) => {
    if (config.buildingType === 'rest') {
        let restTime; 
        if (config.allocationType === 'workers') {
            restTime = REST_TIME[`townHall${district.level}`][buildingLevel - 1];
        }
        
        if (config.allocationType === 'creatures') {
            restTime = CREATURE_REST_TIME;
        }

        if (restTime == null) {
            return {};
        }

        return {
            restTime,
            nRestPrice: restTime / ONE_DAY * contractWage.waxCost,
            nRestPriceObsd: restTime / ONE_DAY * contractWage.obsdCost,
            nOwnRestPrice: restTime / ONE_DAY * config.shiftCost.waxCost,
            nOwnRestPriceObsd: restTime / ONE_DAY * config.shiftCost.waxCost,
            ownRestsObsd: _(workerConfigs)
                .map(workerConfig => {
                    const wagePerSec = workerConfig.wageMultiplier * AVG_WAGE_OBSD / workerConfig.shiftTime;
                    const restPrice = config.shiftCost.obsdCost + workerConfig.foodCost.obsdCost;
                    const extraRestPrice = (restTime - workerConfig.shiftTime) * wagePerSec;

                    return restPrice + extraRestPrice;
                })
                .value(),
            externalRestsObsd: _(workerConfigs)
                .map(workerConfig => {
                    const wagePerSec = workerConfig.wageMultiplier * AVG_WAGE_OBSD / workerConfig.shiftTime;
                    const restPrice = contractWage.obsdCost + workerConfig.foodCost.obsdCost;
                    const extraRestPrice = (restTime - workerConfig.shiftTime) * wagePerSec;

                    return restPrice + extraRestPrice;
                })
                .value(),
        };
    }

    return {};
}

const getJobBuildingProfile = ({
    config,
    workerConfigs,
    contractWage,
}) => {
    if (config.buildingType === 'job' && config.allocationType === 'workers') {
        return {
            wagesObsd: _(workerConfigs)
                .map(workerConfig => _.round(contractWage.obsdCost * workerConfig.wageMultiplier, 4))
                .value(),
            yieldsObsd: _(workerConfigs)
                .map(workerConfig => _.round(config.shiftYield.obsdCost * workerConfig.wageMultiplier - workerConfig.shiftCost.obsdCost, 4))
                .value(),
        };
    }

    return {};
};

const fetchBuildings = async ({
    cache = {},
}) => {
    const exchange = cache.exchange || await fetchExchange();
    const novoPrice = cache.novoPrice || await fetchNovoPrice();
    const districts = cache.districts || await fetchDistricts({});
    const buildingConfigs = cache.buildingConfigs || await fetchBuildingConfigs({});
    const landConfigs = cache.landConfigs || await fetchLandConfigs({
        cache: {
            exchange,
            novoPrice,
        },
    })
    const lands = cache.lands || await fetchLands({
        cache: {
            exchange,
            novoPrice,
            districts,
            landConfigs,
        },
    });
    const workerConfigs = _(cache.workerConfigs || await fetchWorkerConfigs({
        cache: {
            exchange,
            novoPrice,
        },
    }))
        .sortBy(c => c.level)
        .value();
    const accounts = cache.accounts || await fetchAccounts({
        cache: {
            exchange,
            novoPrice,
        },
    });
    const buildings = await fetchAllWaxData2({
        params: {
            code: CONTRACTS.GAME,
            scope: CONTRACTS.GAME,
            table: 'building',
        },
        customProcessor: ({row}) => {
            const district = districts.find(district => district.id === row.district_id);
            const config = buildingConfigs.find(buildingConfig => buildingConfig.id === row.config_id);
            const contractWage = convertAllCosts({
                costs: [row.contract_wage],
                exchange,
                novoPrice,
            });
            const account = accounts.find(account => account.accountName === row.owner);
            const land = lands.find(land => land.id === row.land_id);

            return {
                id: row.id,
                owner: row.owner,
                assetId: row.asset_id,
                district,
                config,
                account,
                land,
                contractWage,
                level: row.level,
                numWorkers: row.num_workers,
                minWorkerLevel: row.min_worker_level,
                isOnlyOwnWorkersAllowed: row.own_workers === 1,
                ...getJobBuildingProfile({
                    config,
                    contractWage,
                    workerConfigs,
                }),
                ...getRestBuildingProfile({
                    district,
                    config,
                    contractWage,
                    workerConfigs,
                    buildingLevel: row.level,
                }),
            };
        },
    });

    return buildings;
};

export default fetchBuildings;