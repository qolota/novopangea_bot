import _ from 'lodash';

const convertRecources = ({
    exchange,
    resources,
}) => {
    return _.sumBy(resources, r => {
        if (r.from === r.to) {
            return r.amount;
        }
        const position = exchange.find(position => position.from === r.from && position.to === r.to);

        return position.rate * r.amount;
    });
};

export default convertRecources;