import _ from 'lodash';
import convertRecources from './convertRecources';
import RESOURCES from '../consts/RESOURSES';
import mapResources from './mapResources';

const convertAllCosts = ({
    costs,
    exchange,
    novoPrice,
}) => {
    const _costs = _(mapResources(costs))
        .filter(c => c.value > 0)
        .value();
    const exchangeResources = _.map(_costs, c => ({
        from: c.symbol,
        to: RESOURCES.OBSD,
        amount: c.value,
    }));
    const obsdCost = convertRecources({
        exchange,
        resources: exchangeResources,
    });
    const novoCost = convertRecources({
        exchange,
        resources: [{
            from: RESOURCES.OBSD,
            to: RESOURCES.NOVO,
            amount: obsdCost,
        }],
    })
    const waxCost = novoCost * novoPrice;

    return {
        costs: _costs,
        obsdCost,
        novoCost,
        waxCost,
    };
};

export default convertAllCosts;