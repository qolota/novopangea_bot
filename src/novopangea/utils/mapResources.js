import _ from 'lodash';
import mapResource from './mapResource';

const mapResources = (resources) => {
    return _(resources)
        .map(mapResource)
        .value();
};

export default mapResources;