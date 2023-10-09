import * as waxjs from "@waxio/waxjs/dist";
import log from '../utils/log';
const {WAX_BLOCKS_PROVIDER} = require('../configs/ENDPOINTS');

export const wax = new waxjs.WaxJS({
  rpcEndpoint: WAX_BLOCKS_PROVIDER,
});

export const checkIsAutoLogin = async () => {
  const isAutoLoginAvailable = await wax.isAutoLoginAvailable();
  if (isAutoLoginAvailable) {
    const pubKeys = wax.pubKeys;
    console.log(`AutoLogin enabled for account: ${wax.userAccount}`);
    console.log(`Active: ${pubKeys[0]} Owner: ${pubKeys[1]}`);
  }
};

export const execTransaction = async ({project, actions}) => {
  if (actions == null) {
    return;
  }

  const result = await wax.api.transact({
    actions: actions,
  }, {
    blocksBehind: 3,
    expireSeconds: 1200,
  });
  log({
    project,
    message: `Transaction submitted`,
    info: result,
  });

  return result;
};

checkIsAutoLogin();
