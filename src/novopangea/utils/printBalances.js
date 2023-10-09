const _ = require('lodash');

const printBalances = ({
    balances,
}) => {
    return balances.map(c => `${c.symbol}:${_.round(c.value, 4)}`).join(', ');
}

module.exports = printBalances;