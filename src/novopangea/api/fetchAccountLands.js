import _ from 'lodash';
import fetchLands from "./fetchLands";

const fetchAccountLands = async ({
    accountName,
    cache = {},
}) => {
    const lands = cache.lands || await fetchLands({});

    const sets = _(lands)
        .groupBy(land => land.district.realm.name)
        .map((lands, realmName) => {
            const qualifiedLands = _(lands)
                .filter(land => {
                    const townhallAccount = land.district.accounts.find(account => account.accountName === accountName);

                    if (townhallAccount == null) {
                        return false;
                    }

                    return townhallAccount.stakedNovo >= 200;
                })
                .value();
            const ownLandsAvailable = _(qualifiedLands)
                .filter(land => land.owner === accountName)
                .filter(land => land.rentExpireTime === 0)
                .filter(land => land.district.level >= 2)
                .sortBy(land => -land.rentPriceObsd)
                .value();

            const externalLandsAvailable = _(qualifiedLands)
                .filter(land => land.owner !== accountName)
                .filter(land => !land.isOwnerOccupied)
                .filter(land => land.rentExpireTime === 0)
                .filter(land => land.isAvailableForRent)
                .filter(land => land.district.level >= 2)
                .sortBy(land => -land.rentPriceObsd)
                .value();

            const bestLands = _([
                ...ownLandsAvailable,
                ...externalLandsAvailable,
            ])
                .map(land => {
                    if (land.owner === accountName) {
                        return {
                            ...land,
                            rentPriceObsd: land.ownRentPriceObsd,
                        };
                    }

                    return {
                        ...land,
                        rentPriceObsd: land.externalRentPriceObsd,
                    };
                })
                .sortBy(land => -land.rentPriceObsd)
                .value();
            
            return {
                realmName,
                bestLands,
                ownLandsAvailable,
                externalLandsAvailable,
            };
        })
        .value();

        return {
            lands: sets,
        };
};

export default fetchAccountLands;