const _ = require('lodash');
const mapResource = require('./mapResource');

const mapResources = (resources) => {
    return _(resources)
        .map(mapResource)
        .value();
};

module.exports = mapResources;