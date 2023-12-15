import fetchAllWaxData2 from '../../core/fetchAllWaxData2';
import CONTRACTS from '../consts/CONTRACTS';
import convertAllCosts from '../utils/convertAllCosts';
import fetchExchange from './fetchExchange';
import fetchNovoPrice from './fetchNovoPrice';

const fetchWorkerConfigs = async ({
    cache = {},
}) => {
    const exchange = cache.exchange || await fetchExchange();
    const novoPrice = cache.novoPrice || await fetchNovoPrice();
    const workerConfigs = await fetchAllWaxData2({
        params: {
            code: CONTRACTS.GAME,
            scope: CONTRACTS.GAME,
            table: "workercfg",
        },
        customProcessor: ({row}) => {
            return {
                id: row.id,
                shiftTime: row.shift_time,
                restTime: row.rest_time,
                level: row.level,
                yieldMultiplier: Number(row.yield_multiplier),
                wageMultiplier: Number(row.wage_multiplier),
                shiftCost: convertAllCosts({
                    costs: row.shift_cost,
                    exchange,
                    novoPrice,
                }),
                foodCost: convertAllCosts({
                    costs: [row.food_cost],
                    exchange,
                    novoPrice,
                }),
                totalShiftCost: convertAllCosts({
                    costs: [
                        ...row.shift_cost,
                        row.food_cost,
                    ],
                    exchange,
                    novoPrice,
                }),
            };
        },
    });

    return workerConfigs;
};

export default fetchWorkerConfigs;