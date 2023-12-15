import _ from 'lodash';

const sumResources = ({
    resources,
}) => {
    return _(resources)
        .groupBy(r => r.symbol)
        .map((costs, symbol) => ({
            value: _.ceil(_.sumBy(costs, c => c.value), 4),
            symbol,
        }))
        .value();
};

export default sumResources;