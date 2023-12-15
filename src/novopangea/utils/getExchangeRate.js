import _ from 'lodash';

const getExchangeRate = ({
    exchange,
    resources,
    exchangeStrategy,
}) => {
    return _(resources)
        .map(r => {
            const symbolFrom = exchangeStrategy[r.symbol];
            const resourceExchange = exchange.find(e => e.from === symbolFrom && e.to === r.symbol);

            return {
                valueFrom: _.ceil(r.value / resourceExchange.rate),
                symbolFrom,
                valueTo: r.value,
                symbolTo: r.symbol,
            };
        })
        .value();
};

export default getExchangeRate;