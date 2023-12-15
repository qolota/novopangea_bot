import fetchExchange from './fetchExchange';
import fetchNovoPrice from './fetchNovoPrice';
import fetchAccountBuildings from './fetchAccountBuildings';
import fetchAccountWorkers from './fetchAccountWorkers';
import fetchBuildings from './fetchBuildings';
import fetchWorkerConfigs from './fetchWorkerConfigs';
import fetchDistricts from './fetchDistricts';
import fetchRealms from './fetchRealms';
import fetchBuildingConfigs from './fetchBuildingConfigs';
import fetchLands from './fetchLands';
import fetchLandConfigs from './fetchLandConfigs';
import fetchSpeedupConfigs from './fetchSpeedupConfigs';
import fetchAccountTransfers from './fetchAccountTransfers';
import fetchAccounts from './fetchAccounts';
import fetchWorkers from './fetchWorkers';
import fetchAccountLands from './fetchAccountLands';
import fetchOngoingUpgrades from './fetchOngoingUpgrades';
import fetchUpgradeConfigs from './fetchUpgradeConfigs';

const fetchAllGameData = async ({
    accountName,
}) => {
    // tokens
    const exchange = await fetchExchange();
    const novoPrice = await fetchNovoPrice();

    // accounts
    const accounts = await fetchAccounts({
        cache: {
            exchange,
            novoPrice,
        },
    });
    const account = accounts.find(account => account.accountName === accountName);

    // configs
    const landConfigs = await fetchLandConfigs({
        cache: {
            exchange,
            novoPrice,
        },
    })
    const buildingConfigs = await fetchBuildingConfigs({
        cache: {
            exchange,
            novoPrice,
        },
    });
    const workerConfigs = await fetchWorkerConfigs({
        cache: {
            exchange,
            novoPrice,
        },
    });
    const speedupConfigs = await fetchSpeedupConfigs();

    // assets staked in game
    const accountTransfers = await fetchAccountTransfers({
        accountName,
        cache: {
            workerConfigs,
            buildingConfigs,
            speedupConfigs,
        },
    });

    // map
    const realms = await fetchRealms();
    const districts = await fetchDistricts({
        cache: {
            realms,
        },
    });

    // upgrades
    const upgradeConfigs = await fetchUpgradeConfigs({
        cache: {
            exchange,
            novoPrice,
            realms,
        },
    });
    const upgrades = await fetchOngoingUpgrades({
        cache: {
            upgradeConfigs,
        }
    });

    // lands
    const lands = await fetchLands({
        cache: {
            exchange,
            novoPrice,
            realms,
            districts,
            landConfigs,
        },
    });
    const accountLands = await fetchAccountLands({
        accountName,
        cache: {
            lands,
        },
    });

    // buildings
    const buildings = await fetchBuildings({
        cache: {
            exchange,
            novoPrice,
            buildingConfigs,
            workerConfigs,
            landConfigs,
            districts,
            lands,
            accounts,
        },
    });
    const accountBuildings = await fetchAccountBuildings({
        accountName,
        cache: {
            buildings,
            workerConfigs,
        },
    });

    // workers
    const workers = await fetchWorkers({
        cache: {
            buildingConfigs,
            workerConfigs,
            districts,
            buildings,
        },
    });
    const accountWorkers = await fetchAccountWorkers({
        accountName,
        cache: {
            workers,
            buildings,
            districts,
            workerConfigs,
            buildingConfigs,
            speedupConfigs,
            accountTransfers,
            upgrades,
        },
    });

    return {
        exchange,
        novoPrice,
        accounts,
        account,
        landConfigs,
        buildingConfigs,
        workerConfigs,
        speedupConfigs,
        realms,
        districts,
        lands,
        buildings,
        workers,
        accountTransfers,
        accountLands,
        accountBuildings,
        accountWorkers,
        upgradeConfigs,
        upgrades,
    };
};

export default fetchAllGameData;
