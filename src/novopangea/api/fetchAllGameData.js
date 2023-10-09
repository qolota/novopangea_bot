const fetchExchange = require('./fetchExchange');
const fetchNovoPrice = require('./fetchNovoPrice');
const fetchAccountBuildings = require('./fetchAccountBuildings');
const fetchAccountWorkers = require('./fetchAccountWorkers');
const fetchBuildings = require('./fetchBuildings');
const fetchWorkerConfigs = require('./fetchWorkerConfigs');
const fetchDistricts = require('./fetchDistricts');
const fetchRealms = require('./fetchRealms');
const fetchBuildingConfigs = require('./fetchBuildingConfigs');
const fetchLands = require('./fetchLands');
const fetchLandConfigs = require('./fetchLandConfigs');
const fetchSpeedupConfigs = require('./fetchSpeedupConfigs');
const fetchAccountTransfers = require('./fetchAccountTransfers');
const fetchAccounts = require('./fetchAccounts');
const fetchWorkers = require('./fetchWorkers');
const fetchAccountLands = require('./fetchAccountLands');
const fetchOngoingUpgrades = require('./fetchOngoingUpgrades');
const fetchUpgradeConfigs = require('./fetchUpgradeConfigs');

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

module.exports = fetchAllGameData;
