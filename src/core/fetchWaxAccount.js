import {getCache, writeCache} from './cache';
import {WAX_BLOCKS_PROVIDER} from '../configs/ENDPOINTS';

const CACHE_WAX_ACCOUNT_KEY = 'wax_account';
const CACHE_WAX_ACCOUNT_DURATION = 10 * 1000;

const fetchWaxAccount = async (settings) => {
  if (getCache(CACHE_WAX_ACCOUNT_KEY) != null) {
    return getCache(CACHE_WAX_ACCOUNT_KEY);
  }
  const res = await fetch(`${WAX_BLOCKS_PROVIDER}/v1/chain/get_account`, {
    headers: {
      accept: '*/*',
    },
    body: JSON.stringify({
      account_name: settings.accountName,
    }),
    method: 'POST',
  });

  const data = await res.json();
  const account = {
    cpu: data.cpu_limit,
    net: data.net_limit,
    cpuLoad: data.cpu_limit.used / data.cpu_limit.max,
  };

  writeCache(account, CACHE_WAX_ACCOUNT_KEY, CACHE_WAX_ACCOUNT_DURATION);
  return account;
};

export default fetchWaxAccount;
