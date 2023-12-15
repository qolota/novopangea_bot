import _ from 'lodash';

const printBalances = ({
    balances,
}) => {
    return balances.map(c => `${c.symbol}:${_.round(c.value, 4)}`).join(', ');
}

export default printBalances;