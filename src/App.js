import './App.css';
import _ from 'lodash';
import { useCallback, useState } from 'react';
import { wax } from './core/wax';
import { startBot, stopBot } from './bot/bot';

function App() {
  const login = useCallback(async () => {
    try {
      const userAccount = await wax.login();
      const pubKeys = wax.pubKeys;
      console.log(`AutoLogin enabled for account: ${userAccount}`);
      console.log(`Active: ${pubKeys[0]} Owner: ${pubKeys[1]}`);
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

  return (
    <div
      style={{
        padding: '12px 24px',
      }}
    >
      <br />
      <br />
      {isBotStarted ? (
        <button onClick={_stopBot}>Stop</button>
      ) : (
        <button onClick={_startBot}>Run</button>
      )}
      <button onClick={login}>Login</button>
      <br />
      <br />
    </div>
  );
}

export default App;
