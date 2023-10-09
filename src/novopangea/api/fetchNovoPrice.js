const _ = require('lodash');
const fetchMarkets = require('../../alcor/api/fetchMarkets');

const fetchNovoPrice = async () => {
    const markets = await fetchMarkets();
    const charmMarket = markets['NOVO+tokens.novo'];
    const pool = _(charmMarket.pools)
        .find(pool => {
            return _(pool.symbols)
                .map(symbol => symbol.fullTokenName)
                .filter(symbol => symbol === 'WAX+eosio.token')
                .value()
                .length > 0;
        });

    if (pool == null) {
        return null;
    }

    const symbol = pool
        .symbols
        .find(symbol => symbol.fullTokenName !== 'WAX+eosio.token');

    if (symbol == null) {
        return null;
    }

    return symbol.price;
};

module.exports = fetchNovoPrice;