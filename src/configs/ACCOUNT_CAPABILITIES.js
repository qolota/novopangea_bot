const ACCOUNT_NAME = '<ADD_YOUR_WALLET_NAME_HERE>';

const ACCOUNT_CAPABILITIES = {
  [ACCOUNT_NAME]: {
      accountName: ACCOUNT_NAME,

      // novopangea
      novopangea_play_game: true,

      // wax
      claim_wax_reward: true,
  },
};

module.exports = ACCOUNT_CAPABILITIES;
