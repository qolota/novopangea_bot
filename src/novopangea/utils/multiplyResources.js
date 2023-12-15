import _ from 'lodash';

const multiplyResources = ({
    resources,
    multiplier,
}) => {
    return _(resources)
        .map(r => ({
            value: r.value * multiplier,
            symbol: r.symbol,
        }))
        .value();
};

export default multiplyResources;