const _ = require('lodash');
const findResource = require('./findResource');

const validateResourceLimit = ({
    resources,
    maxResources,
}) => {
    return _(resources)
        .every(resource => {
            const maxResource = findResource({
                resources: maxResources,
                symbol: resource.symbol,
            });

            if (maxResource == null) {
                return true;
            }

            return resource.value <= maxResource.value;
        });
};

module.exports = validateResourceLimit;