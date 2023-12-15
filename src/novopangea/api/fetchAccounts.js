import _ from 'lodash';
import fetchAllWaxData2 from '../../core/fetchAllWaxData2';
import CONTRACTS from '../consts/CONTRACTS';
import mapResources from '../utils/mapResources';
import convertAllCosts from '../utils/convertAllCosts';
import fetchExchange from './fetchExchange';
import fetchNovoPrice from './fetchNovoPrice';
import mapResource from '../utils/mapResource';

const fetchAccounts = async ({
    cache = {}
}) => {
    const exchange = cache.exchange || await fetchExchange();
    const novoPrice = cache.novoPrice || await fetchNovoPrice();
    const novoAccounts = await fetchAllWaxData2({
        params: {
            code: CONTRACTS.GAME,
            scope: CONTRACTS.GAME,
            table: 'novotknusers',
        },
        customProcessor: ({row}) => ({
            accountName: row.account,
            novoSpent: mapResource(row.spent).value,
            novoBalance: mapResource(row.novo_converted).value,
            novoDeposited: mapResource(row.novo_deposited).value,
            novoStaked: mapResource(row.total_stake_districts),
            nextChoiceDistrictTime: row.next_choice_district * 1000,
            nextWithdrawBalance: row.next_withdraw_balance * 1000,
            actionsUsed: row.actions_used,
            homeDistrictId: row.home_district,
        }),
    });

    
    const accounts = await fetchAllWaxData2({
        params: {
            code: CONTRACTS.GAME,
            scope: CONTRACTS.GAME,
            table: 'accounts',
        },
        customProcessor: ({row}) => {
            const novoAccount = novoAccounts.find(account => account.accountName === row.account);
            
            return {
                accountName: row.account,
                level: row.level,
                score: row.score,
                balances: _.compact([
                    ...mapResources(row.balances),
                    novoAccount != null
                        ? {
                            value: novoAccount.novoBalance,
                            symbol: 'NOVO'
                        }
                        : null,
                ]),
                maxBalances: mapResources(row.max_balances),
                totalBalance: convertAllCosts({
                    costs: [
                        ...row.balances,
                        novoAccount != null
                            ? `${novoAccount.novoBalance} NOVO`
                            : `0  NOVO`,
                    ],
                    exchange,
                    novoPrice,
                    ...novoAccount,
                }),
                nextWithdrawBalance: novoAccount != null
                    ? novoAccount.nextWithdrawBalance
                    : null,
            };
        },
    });

    return accounts;
};

export default fetchAccounts;