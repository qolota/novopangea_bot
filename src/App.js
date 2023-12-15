import './App.css';
import { useCallback, useEffect, useState } from 'react';
import { wax } from './core/wax';
import { startBot, stopBot } from './bot/bot';
import {
  setEconomyValues,
  ECONOMY_VALUES,
} from './novopangea/consts/ECONOMY_VALUES';

const getInitParams = () => ([
  {
    key: 'claimwax',
    name: 'Claim Wax',
    enabled: false,
  },
  {
    key: 'novopangea',
    name: 'Novopangea',
    enabled: false,
    params: ECONOMY_VALUES,
  },
]);

function App() {
  const [allBotSettings, setAllBotSettings] = useState([]);
  useEffect(() => {
    let allBotSettings = localStorage.getItem('allBotSettings');
    if (allBotSettings == null) {
      allBotSettings = JSON.stringify(getInitParams());
      localStorage.setItem('allBotSettings', allBotSettings);
    }

    setEconomyValues({
      economyValues: JSON.parse(allBotSettings)
        .find(botSettings => botSettings.key === 'novopangea')
        .params,
    });
    setAllBotSettings(JSON.parse(allBotSettings));
  }, []);
  const login = useCallback(async () => {
    try {
      const userAccount = await wax.login();
      console.log(`AutoLogin enabled for account: ${userAccount}`);
    } catch (err) {
      console.log(err);
      console.log(err.message);
    }
  }, []);

  const [isBotStarted, setIsBotStarted] = useState(false);
  const _startBot = useCallback(async () => {
    startBot();
    setIsBotStarted(true);
  }, []);

  const _stopBot = useCallback(async () => {
    stopBot();
    setIsBotStarted(false);
  }, []);

  const toggleBot = useCallback(({
    botSettings,
  }) => {
    botSettings.enabled = !botSettings.enabled;
    localStorage.setItem('allBotSettings', JSON.stringify(allBotSettings));
    setEconomyValues({
      economyValues: allBotSettings
        .find(botSettings => botSettings.key === 'novopangea')
        .params,
    });
    setAllBotSettings([
      ...allBotSettings,
    ]);
  }, [allBotSettings, setAllBotSettings]);

  const resetSettings = useCallback(() => {
    const nextAllBotSettigns = getInitParams();
    localStorage.setItem('allBotSettings', JSON.stringify(nextAllBotSettigns));
    setEconomyValues({
      economyValues: nextAllBotSettigns
        .find(botSettings => botSettings.key === 'novopangea')
        .params,
    });
    setAllBotSettings(nextAllBotSettigns);
  }, [setAllBotSettings]);

  const npSetJobProfit = useCallback(({
    botSettings,
    index,
    newProfit,
  }) => {
    botSettings.params.JOB_MIN_PROFITS_OBSD[index] = newProfit;
    localStorage.setItem('allBotSettings', JSON.stringify(allBotSettings));
    setEconomyValues({
      economyValues: allBotSettings
        .find(botSettings => botSettings.key === 'novopangea')
        .params,
    });
    setAllBotSettings([
      ...allBotSettings,
    ]);
  },[allBotSettings, setAllBotSettings]);

  const npSetRestCost = useCallback(({
    botSettings,
    index,
    newCost,
  }) => {
    botSettings.params.REST_MAX_COST_OBSD[index] = newCost;
    localStorage.setItem('allBotSettings', JSON.stringify(allBotSettings));
    setEconomyValues({
      economyValues: allBotSettings
        .find(botSettings => botSettings.key === 'novopangea')
        .params,
    });
    setAllBotSettings([
      ...allBotSettings,
    ]);
  },[allBotSettings, setAllBotSettings]);
  
  const toggleActivity = useCallback(({
    botSettings,
    activity,
  }) => {
    botSettings.params[activity.key] = !botSettings.params[activity.key];
    localStorage.setItem('allBotSettings', JSON.stringify(allBotSettings));
    setEconomyValues({
      economyValues: allBotSettings
        .find(botSettings => botSettings.key === 'novopangea')
        .params,
    });
    setAllBotSettings([
      ...allBotSettings,
    ]);
  }, [allBotSettings, setAllBotSettings]);

  const npSetMaxLandRentPrice = useCallback(({
    botSettings,
    newPrice,
  }) => {
    botSettings.params.MAX_LAND_RENT_PRICE_OBSD = newPrice;
    localStorage.setItem('allBotSettings', JSON.stringify(allBotSettings));
    setEconomyValues({
      economyValues: allBotSettings
        .find(botSettings => botSettings.key === 'novopangea')
        .params,
    });
    setAllBotSettings([
      ...allBotSettings,
    ]);
  }, [allBotSettings, setAllBotSettings]);
  
  const npSetUpgradeWorkersToLevel = useCallback(({
    botSettings,
    newLevel,
  }) => {
    botSettings.params.UPGRADE_WORKERS_TO_LVL = newLevel;
    localStorage.setItem('allBotSettings', JSON.stringify(allBotSettings));
    setEconomyValues({
      economyValues: allBotSettings
        .find(botSettings => botSettings.key === 'novopangea')
        .params,
    });
    setAllBotSettings([
      ...allBotSettings,
    ]);
  }, [allBotSettings, setAllBotSettings]);

  return (
    <div
      style={{
        padding: '12px 24px',
        maxWidth: '600px',
      }}
    >
      <div>Hi there, this page contains WAX bots. You assume all possible risks start using this bot, please check terms and condition of each WAX project if bots allowed.</div>
      <br/>
      <br/>
      <div>
        <div>🎄 Wishing you a Merry Christmas and a joyful holiday season! 🎅 May your days be filled with warmth, laughter, and the love of family and friends. 🎁 Let the ❄️ snowflakes bring magic to your days and the spirit of the season fill your heart with happiness. ⛄ Have a wonderful time, and may the 🕯️ light of peace and goodwill shine upon you. Happy holidays! 🦌🔔</div>
        <br/>
        <div><b>If you'd like the bot please support me by sending crypto or assets to my wallet:</b> <a href="https://atomichub.io/profile/wax-mainnet/ete2o.c.wam"  target='_blank' rel="noreferrer">ete2o.c.wam</a></div>
      </div>
      <br/>
      <br/>
      {isBotStarted ? (
        <button onClick={_stopBot}>Stop</button>
      ) : (
        <button onClick={_startBot}>Run</button>
      )}
      <button onClick={login}>Login</button>
      <br />
      <br />
      <button onClick={resetSettings}>Reset Settings</button>
      <div><b>All changed settings applied immediately!!!</b></div>
      <br />
      <div>
        Open a browser developer console to monitor how bot is workign. To open a browser console press <code>Option + ⌘ + J</code> (on macOS), or <code>Shift + CTRL + J</code> (on Windows/Linux) in Chrome browser.
      </div>
      <br />
      <br />
      {allBotSettings.map(botSettings => {
        const enableCheckboxId = `enable-checkbox-${botSettings.key}`;
        return <div key={botSettings.key} className='bot-settings'>
          <h2>{botSettings.name}</h2>
          {botSettings.key === 'claimwax'
            ? <div>Visit WAX wallet <a href="https://wallet.wax.io/staking-rewards" target='_blank' rel="noreferrer">staking page</a>.</div>
            : null
          }
          {botSettings.key === 'novopangea'
            ? <div>Visit novopangea game <a href="https://novopangea.io/" target='_blank' rel="noreferrer">website</a>.</div>
            : null
          }
          <br/>
          <input id={enableCheckboxId} type='checkbox' checked={botSettings.enabled} onChange={() => {
            toggleBot({
              botSettings,
            });
          }}/>
          <label htmlFor={enableCheckboxId}>Enabled</label>
          {botSettings.key === 'novopangea'
            ? <>
              <hr />
              <h3>Settings</h3>
            </>
            : null
          }
          {botSettings.key === 'novopangea'
            ? <>
              <h4>Bot Activities</h4>
              {[
                {key: 'ENABLE_SHIFT_SKILLED_WORKERS', name: 'Start Skilled Workers shift in own or other buildings',},
                {key: 'ENABLE_REST_SKILLED_WORKERS', name: 'Rest Skilled Workers in own or other buildings',},
                {key: 'ENABLE_SHIFT_UNSKILLED_WORKERS', name: 'Start Unskilled Workers shift in own or other buildings',},
                {key: 'ENABLE_REST_UNSKILLED_WORKERS', name: 'Rest Unskilled Workers in own or other buildings',},
                {key: 'ENABLE_RENEW_RENT_LANDS', name: 'Prepare and renew own lands',},
              ].map((activity) => {
                const botActivityCheckboxId = `np-bot-activities-checkbox-id-${activity.key}`;
                return <div key={activity.key}>
                  <input type="checkbox" id={botActivityCheckboxId} checked={botSettings.params[activity.key]} onChange={() => {
                    toggleActivity({
                      botSettings,
                      activity,
                    });
                  }}/>
                  <label htmlFor={botActivityCheckboxId}>{activity.name}</label>{' '}
                </div>
              })}
            </>
            : null
          }

          
          {botSettings.key === 'novopangea'
            ? <>
              <h4>Job Min Profits (OBSD)</h4>
              {botSettings.params.JOB_MIN_PROFITS_OBSD.map((minProfit, index) => {
                const minProfitInputId = `min-profit-input-id-${index}`;
                return <div key={index}>
                  <label htmlFor={minProfitInputId}>Level {index + 1}</label>{' '}
                  <input type="number" id={minProfitInputId} value={minProfit} onChange={(event) => {
                    npSetJobProfit({
                      botSettings,
                      index,
                      newProfit: Number(event.target.value),
                    });
                  }}/>
                </div>
              })}
            </>
            : null
          }
          {botSettings.key === 'novopangea'
            ? <>
              <h4>Rest Max Cost (OBSD)</h4>
              <div>Food you spend for resting should be included in this price</div>
              {botSettings.params.REST_MAX_COST_OBSD.map((maxCost, index) => {
                const maxRestCostInputId = `rest-max-cost-input-id-${index}`;
                return <div key={index}>
                  <label htmlFor={maxRestCostInputId}>Level {index + 1}</label>{' '}
                  <input type="number" id={maxRestCostInputId} value={maxCost} onChange={(event) => {
                    npSetRestCost({
                      botSettings,
                      index,
                      newCost: Number(event.target.value),
                    });
                  }}/>
                </div>
              })}
            </>
            : null
          }
          {botSettings.key === 'novopangea'
            ? <>
              <h4>Rent external lands (OBSD/sec)</h4>
              <div>Only applied for lands owned by other players</div>
              <br/>
              <div>
                <input  
                  type="checkbox"
                  id={`${botSettings.params.ENABLE_RENT_EXTERNAL_LANDS}-checkbox`}
                  checked={botSettings.params.ENABLE_RENT_EXTERNAL_LANDS}
                  onChange={() => {
                    toggleActivity({
                      botSettings,
                      activity: {
                        key: 'ENABLE_RENT_EXTERNAL_LANDS',
                      },
                    });
                  }}
                />
                <label htmlFor={`${botSettings.params.ENABLE_RENT_EXTERNAL_LANDS}-checkbox`}>Enable</label>{' '}
              </div>
              <br/>
              <input type="number" value={botSettings.params.MAX_LAND_RENT_PRICE_OBSD} onChange={(event) => {
                npSetMaxLandRentPrice({
                  botSettings,
                  newPrice: Number(event.target.value),
                });
              }}/>
            </>
            : null
          }
          {botSettings.key === 'novopangea'
            ? <>
              <h4>Upgrage Skilled Workers (Level)</h4>
              <div>If not enough resources for upgrade, workers will start shifts</div>
              <br/>
              <div>
                <input  
                  type="checkbox"
                  id={`${botSettings.params.ENABLE_WORKER_UPGRADES}-checkbox`}
                  checked={botSettings.params.ENABLE_WORKER_UPGRADES}
                  onChange={() => {
                    toggleActivity({
                      botSettings,
                      activity: {
                        key: 'ENABLE_WORKER_UPGRADES',
                      },
                    });
                  }}
                />
                <label htmlFor={`${botSettings.params.ENABLE_WORKER_UPGRADES}-checkbox`}>Enable</label>{' '}
              </div>
              <br/>
              <input type="number" value={botSettings.params.UPGRADE_WORKERS_TO_LVL} onChange={(event) => {
                npSetUpgradeWorkersToLevel({
                  botSettings,
                  newLevel: Number(event.target.value),
                });
              }}/>
            </>
            : null
          }



{/* MIN_RENT_BUILDING_LEVELS */}
        </div>;
      })}
    </div>
  );
}

export default App;
