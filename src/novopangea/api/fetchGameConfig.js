import _ from 'lodash';
import fetchAllWaxData2 from '../../core/fetchAllWaxData2';
import fetchExchange from './fetchExchange';
import fetchNovoPrice from './fetchNovoPrice';
import convertAllCosts from '../utils/convertAllCosts';
import CONTRACTS from '../consts/CONTRACTS';
import mapResources from '../utils/mapResources';
import findResource from '../utils/findResource';

const fetchGameConfig = async () => {
    const exchange = await fetchExchange();
    const novoPrice = await fetchNovoPrice();
    const configs = await fetchAllWaxData2({
        params: {
            code: CONTRACTS.GAME,
            scope: CONTRACTS.GAME,
            table: 'config',
        },
        customProcessor: ({row}) => {
            const storageInitialBalances = mapResources(row.initial_max_balances);
            const initialUpgradeCost = convertAllCosts({
                costs: _([
                    {
                        factor: row.upgrade_novom_factor,
                        symbol: 'NOVOM',
                    },
                    {
                        factor: row.upgrade_obsd_factor,
                        symbol: 'OBSD',
                    },
                ])
                    .map(cost => {
                        const balance = findResource({
                            resources: storageInitialBalances,
                            symbol: cost.symbol,
                        });

                        return `${_.round(Number(cost.factor) * balance.value, 4)} ${cost.symbol}`;
                    })
                    .value(),
                exchange,
                novoPrice,
            });
            const upgradeDurationFactor = Number(row.upgrade_duration_factor);
            const upgradeCosts = _(_.range(20))
                .map(level => ({
                    baseLevel: level + 1,
                    nextLevel: level + 2,
                    storageBalances: _(storageInitialBalances)
                        .map(balance => ({
                            value: _.round(balance.value * Math.pow(upgradeDurationFactor, level), 4),
                            symbol: balance.symbol,
                        }))
                        .value(),
                    cost: convertAllCosts({
                        costs: _(initialUpgradeCost.costs)
                            .map(cost => `${_.round(cost.value * Math.pow(upgradeDurationFactor, level), 4)} ${cost.symbol}`)
                            .value(),
                        exchange,
                        novoPrice,
                    }),
                }))
                .value();

            return {
                id: row.id,
                plotRentAmount: convertAllCosts({
                    costs: [row.plot_rent_amount],
                    exchange,
                    novoPrice,
                }),
                storageInitialBalances,
                upgradeStartDuration: row.upgrade_start_duration,
                initialUpgradeCost,
                upgradeOutputFactor: Number(row.upgrade_output_factor),
                upgradeDurationFactor,
                isGameActive: row.maintenance_mode === 0,
                upgradeCosts: _(upgradeCosts)
                    .map(upgradeCost => ({
                        ...upgradeCost,
                        totalWaxUpgradeCost: _(upgradeCosts)
                            .filter(c => c.baseLevel <= upgradeCost.baseLevel)
                            .sumBy(c => c.cost.waxCost),
                    }))
                    .value(),
            };
        },
    });

    return configs[0];
};

export default fetchGameConfig;