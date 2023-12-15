import _ from 'lodash';
import findResource from './findResource';

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

export default validateResourceLimit;