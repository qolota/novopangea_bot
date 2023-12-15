const qs = require('query-string');
const _ = require('lodash');
const sleep = require('../../utils/sleep');
const API_ENDPOINTS = require('../consts/API_ENGPOINTS');

const URLS = {
    [API_ENDPOINTS.ASSETS]: 'https://wax.api.atomicassets.io/atomicmarket/v1/assets/',
    [API_ENDPOINTS.ACCOUNTS]: 'https://wax.api.atomicassets.io/atomicassets/v1/accounts/',
    [API_ENDPOINTS.SALES]: 'https://wax.api.atomicassets.io/atomicmarket/v2/sales/',
    [API_ENDPOINTS.TEMPLATES]: 'https://wax.api.atomicassets.io/atomicassets/v1/templates/',
    [API_ENDPOINTS.TEMPLATES_STATS]: 'https://wax.api.atomichub.io/atomicassets/v1/templates/${template_id}/stats',
    [API_ENDPOINTS.LOGS]: 'https://wax.api.atomicassets.io/atomicassets/v1/assets/${asset_id}/logs/',
    [API_ENDPOINTS.TRANSFERS]: 'https://wax.api.atomicassets.io/atomicassets/v1/transfers/',
};

const MIN_POSTPONE_REQUEST_TIME = 500;
let postponeRequestTime = MIN_POSTPONE_REQUEST_TIME;

const fetchAtomichub = async ({
    type,
    params,
}) => {
    let url = URLS[type];
    let _param = params;
    switch (type) {
        case API_ENDPOINTS.LOGS:
            url = url.replace('${asset_id}', params.asset_id);
            _param = _.omit(params, 'asset_id');
            break;
    }
    if (url == null) {
        throw new Error(`Atomic hub utils: type ${type} is not found`);
    }
    const atomicAssetsUrl = `${url}?${qs.stringify(_param)}`;
    console.log(`Loading [${type}] page=[${_param.page}] ${atomicAssetsUrl}`);

    while (true) {
        const res = await fetch(atomicAssetsUrl, {
            headers: new Headers({
                mode: 'no-cors',
            }),
        });
        const data = await res.json();
        if (!data.success) {
            if (data.message === 'Rate limit') {
                postponeRequestTime = postponeRequestTime * 2;
                console.log(`Wait ${postponeRequestTime}ms befor making another AH request`);
                await sleep(postponeRequestTime);
            }
            
            continue;
        }

        postponeRequestTime = MIN_POSTPONE_REQUEST_TIME;
        return data;
    }
};

module.exports = fetchAtomichub;
