import _ from 'lodash';
import fetchBuildings from './fetchBuildings';
import fetchDistricts from './fetchDistricts';
import fetchWorkerConfigs from './fetchWorkerConfigs';
import fetchAccountTransfers from './fetchAccountTransfers';
import fetchBuildingConfigs from './fetchBuildingConfigs';
import fetchSpeedupConfigs from './fetchSpeedupConfigs';
import fetchWorkers from './fetchWorkers';
import fetchOngoingUpgrades from './fetchOngoingUpgrades';
import {
    getEconomyValues,
} from '../consts/ECONOMY_VALUES';

const fetchAccountWorkers = async ({
    accountName,
    cache = {},
}) => {
    const economyValues = getEconomyValues();
    const workerConfigs = cache.workerConfigs || await fetchWorkerConfigs({});
    const buildingConfigs = cache.buildingConfigs || await fetchBuildingConfigs({});
    const speedupConfigs = cache.speedupConfigs || await fetchSpeedupConfigs();
    const districts = cache.districts || await fetchDistricts({});
    const buildings = cache.buildings || await fetchBuildings({
        cache: {
            buildingConfigs,
            districts,
        },
    });
    const { workers: staleWorkers } = cache.accountTransfers || await fetchAccountTransfers({
        accountName,
        cache: {
            workerConfigs,
            buildingConfigs,
            speedupConfigs,
        },
    });
    const skilledStaleWorkers = _(staleWorkers)
        .filter(worker => worker.isSkilledWorker)
        .value();
    const readyToWorkUnskilledWorkers = _(staleWorkers)
        .filter(worker => !worker.isSkilledWorker)
        .value();
    const readyToWorkWorkers = skilledStaleWorkers;
    const readyToUpgradeWorkers = _(skilledStaleWorkers)
        .filter(worker => worker.level < economyValues.UPGRADE_WORKERS_TO_LVL)
        .value();
    const workers = cache.workers || await fetchWorkers({
        cache: {
            buildingConfigs,
            workerConfigs,
            districts,
            buildings,
        },
    });
    const upgrades = cache.upgrades || await fetchOngoingUpgrades({
        cache: {},
    });
    const ongoingWorkerUpgrades = _(upgrades)
        .filter(upgrade => upgrade.config.schema === 'worker')
        .filter(upgrade => upgrade.owner === accountName)
        .value();
    
    const accountWorkers = _(workers)
        .filter(worker => worker.owner === accountName)
        .value();
    const busyWorkers = _(accountWorkers)
        .filter(worker => worker.isWorking)
        .value();
    const restWorkers = _(accountWorkers)
        .filter(worker => !worker.isWorking && worker.isSleeping)
        .value();
    const readyToWakeupWorkers = _(accountWorkers)
        .filter(worker => !worker.isWorking && !worker.needSleeping && !worker.isSleeping)
        .value();
    // TODO: this is a hack should be fixed properly
    // we need to get information about worker from AH
    // but that might be expensive and unstable
    const readyToRestWorkers = _(accountWorkers)
        .filter(worker => !worker.isWorking && worker.needSleeping)
        .filter(worker => worker.level > 1)
        .value();
    const readyToRestUnskilledWorkers = _(accountWorkers)
        .filter(worker => !worker.isWorking && worker.needSleeping)
        .filter(worker => worker.level === 1)
        .value();

    const sets = {
        busyWorkers,
        restWorkers,
        readyToRestWorkers,
        readyToWakeupWorkers,
        readyToWorkWorkers,
        readyToUpgradeWorkers,
        ongoingWorkerUpgrades,
        readyToWorkUnskilledWorkers,
        readyToRestUnskilledWorkers,
    };

    console.log(`Busy workers: ${busyWorkers.length}`);
    console.log(`Rest workers: ${restWorkers.length}`);
    console.log(`Ready to wake up workers: ${readyToWakeupWorkers.length}`);
    console.log(`Ready to rest skilled workers: ${readyToRestWorkers.length}`);
    console.log(`Ready to work skilled workers: ${readyToWorkWorkers.length}`);
    console.log(`Ready to upgrade skilled workers: ${readyToUpgradeWorkers.length}`);
    console.log(`Ongoing skilled workers upgrades: ${ongoingWorkerUpgrades.length}`);
    console.log(`Ready to work unskilled workers: ${readyToWorkUnskilledWorkers.length}`);
    console.log(`Ready to rest unskilled workers: ${readyToRestUnskilledWorkers.length}`);

    return sets;
};

export default fetchAccountWorkers;