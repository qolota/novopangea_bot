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
            const restTime = config.resourceType === 'rest'
                ? REST_TIME[`townHall${district.level}`][row.level - 1]
                : null;
            const nRestPrice = restTime != null
                ? restTime / ONE_DAY * contractWage.waxCost
                : null;
            const nRestPriceObsd = restTime != null
                ? restTime / ONE_DAY * contractWage.obsdCost
                : null;
            const nOwnRestPrice = restTime != null
                ? restTime / ONE_DAY * config.shiftCost.waxCost
                : null;

            return {
                id: row.id,
                owner: row.owner,
                assetId: row.asset_id,
                district,
                config,
                land: lands.find(land => land.id === row.land_id),
                contractWage,
                isOnlyOwnWorkersAllowed: row.own_workers === 1,
                minWorkerLevel: row.min_worker_level,
                numWorkers: row.num_workers,
                level: row.level,
                restTime,
                nRestPrice,
                nRestPriceObsd,
                nOwnRestPrice,
                account: accounts.find(account => account.accountName === row.owner),
                wagesObsd: config.resourceType !== 'rest'
                    ?_(workerConfigs)
                        .map(c => _.round(contractWage.obsdCost * c.wageMultiplier, 4))
                        .value()
                    : null,
                yieldsObsd: config.resourceType !== 'rest'
                    ?_(workerConfigs)
                        .map(c => _.round(config.shiftYield.obsdCost * c.wageMultiplier - c.shiftCost.obsdCost, 4))
                        .value()
                    : null,
                ownRestsObsd: config.resourceType === 'rest'
                    ? _(workerConfigs)
                        .map(c => {
                            const wagePerSec = c.wageMultiplier * AVG_WAGE_OBSD / c.shiftTime;
                            const restPrice = config.shiftCost.obsdCost + c.foodCost.obsdCost;
                            const extraRestPrice = (restTime - c.shiftTime) * wagePerSec;

                            return restPrice + extraRestPrice;
                        })
                        .value()
                    : null,
                externalRestsObsd: config.resourceType === 'rest'
                    ? _(workerConfigs)
                        .map(c => {
                            const wagePerSec = c.wageMultiplier * AVG_WAGE_OBSD / c.shiftTime;
                            const restPrice = contractWage.obsdCost + c.foodCost.obsdCost;
                            const extraRestPrice = (restTime - c.shiftTime) * wagePerSec;

                            return restPrice + extraRestPrice;
                        })
                        .value()
                    : null,

            };
        },
    });

    return buildings;
};

export default fetchBuildings;