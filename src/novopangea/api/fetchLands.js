const fetchAllWaxData2 = require('../../core/fetchAllWaxData2');
const CONTRACTS = require('../consts/CONTRACTS');
const fetchDistricts = require('./fetchDistricts');
const convertAllCosts = require('../utils/convertAllCosts');
const fetchExchange = require('./fetchExchange');
const fetchNovoPrice = require('./fetchNovoPrice');
const fetchLandConfigs = require('./fetchLandConfigs');
const fetchRealms = require('./fetchRealms');

const fetchLands = async ({
    cache = {},
}) => {
    const exchange = cache.exchange || await fetchExchange();
    const novoPrice = cache.novoPrice || await fetchNovoPrice();
    const realms = cache.realms || await fetchRealms();
    const districts = cache.districts || await fetchDistricts({
        cache: {
            realms,
        },
    });
    const landConfigs = cache.landConfigs || await fetchLandConfigs({
        cache: {
            exchange,
            novoPrice,
        },
    });
    const lands = await fetchAllWaxData2({
        params: {
            code: CONTRACTS.GAME,
            scope: CONTRACTS.GAME,
            table: 'land',
        },
        customProcessor: ({row}) => {
            const config = landConfigs.find(config => config.id === row.config_id);
            const rentCost = convertAllCosts({
                costs: [row.rent === 0 ? `${row.rent} OBSD` : row.rent],
                exchange,
                novoPrice,
            });
            return {
                id: row.id,
                assetId: row.asset_id,
                owner: row.owner,
                renter: row.renter === ''
                    ? null
                    : row.renter,
                isOwnerOccupied: row.owner_occupied === 1,
                isDistrictOwner: row.district_owned === 1,
                isAvailableForRent: row.for_rent === 1,
                lastStakeTime: row.last_stake * 1000,
                rentExpireTime: row.rent_expire * 1000,
                rentCost,
                ownRentPriceObsd: config.plotRentAmount.obsdCost / config.rentTime,
                externalRentPriceObsd: rentCost.obsdCost / config.rentTime,
                config,
                district: districts.find(district => district.id === row.district_id),
            };
        },
    });

    return lands;
};

module.exports = fetchLands;