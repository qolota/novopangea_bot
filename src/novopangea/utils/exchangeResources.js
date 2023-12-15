import MIN_TRANSACTION_VALUE from '../consts/MIN_TRANSACTION_VALUE';

import _ from 'lodash';
import findResource from './findResource';
import RESOURCES from '../consts/RESOURSES';
import sumResources from './sumResources';
import equalizeResources from './equalizeResources';
import exchangeTokens from '../actions/exchangeTokens';
import validateResourceLimit from './validateResourceLimit';
import printBalances from './printBalances';


// 1. transfer all resources to OBSD
// 2. transfer OBSD to NOVO
// 3. calculate how much OBSD needed in total
// 4. transfer NOVO to OBSD 
// 5. transfer OBSD to all other resources

const requestResources = ({
    symbolFrom,
    resources,
    exchange,
}) => {
    return _(resources)
        .map(resource => {
            const resourceExchange = exchange.find(e => e.from === symbolFrom && e.to === resource.symbol);

            if (symbolFrom === resource.symbol) {
                const valueFrom = _.ceil(resource.value / MIN_TRANSACTION_VALUE[resource.symbol]) * MIN_TRANSACTION_VALUE[resource.symbol];
                return {
                    valueFrom,
                    symbolFrom,
                    valueTo: valueFrom,
                    symbolTo: resource.symbol,
                };
            }

            const valueFrom = _.ceil(resource.value / resourceExchange.rate);

            return {
                valueFrom,
                symbolFrom,
                valueTo: valueFrom * MIN_TRANSACTION_VALUE[resource.symbol],
                symbolTo: resource.symbol,
            };
        })
        .value();
};

const exchangeResources = ({
    accountName,
    exchange,
    balances,
    maxBalances,
    requestedResources,
}) => {
    const maxNoneNovaBalances = _([
        RESOURCES.NOVOE,
        RESOURCES.NOVOM,
        RESOURCES.NOVOF,
        RESOURCES.OBSD,
    ])
        .map(symbol => findResource({
            resources: maxBalances,
            symbol,
        }))
        .value();
    const requestedObsd = requestResources({
        symbolFrom: RESOURCES.OBSD,
        resources: requestedResources,
        exchange,
    });
    const totalRequestedObsd = sumResources({
        resources: _(requestedObsd)
            .map(resource => ({
                value: resource.valueFrom,
                symbol: resource.symbolFrom,
            }))
            .value(),
    });
    const requestedNovo = requestResources({
        symbolFrom: RESOURCES.NOVO,
        resources: totalRequestedObsd,
        exchange,
    });
    const totalRequestedNovo = sumResources({
        resources: _(requestedNovo)
            .map(resource => ({
                value: resource.valueFrom,
                symbol: resource.symbolFrom,
            }))
            .value(),
    });

    const insufficientNovo = equalizeResources({
        targetResources: totalRequestedNovo,
        currentResources: balances,
    });

    if (insufficientNovo.length > 0) {
        console.log(`Not enough resources: ${printBalances({balances: insufficientNovo})}`);
        return {
            action: 'stop',
            message: `Not enough resources: ${printBalances({balances: insufficientNovo})}`,
        };
    }

    const nextObsdBalance = sumResources({
        resources: [
            ...balances,
            // reduce NOVO
            ..._(totalRequestedNovo)
                .map(res => ({
                    value: -res.value,
                    symbol: res.symbol,
                }))
                .value(),
            // add OBSD
            ..._(requestedNovo)
                .map(res => ({
                    value: res.valueTo,
                    symbol: res.symbolTo,
                }))
                .value(),
        ],
    });

    const isValidObsdBalance = validateResourceLimit({
        resources: nextObsdBalance,
        maxResources: maxNoneNovaBalances,
    });
    
    if (!isValidObsdBalance) {
        return {
            action: 'stop',
            message: `Requested more than maximum storage capacity. Next balance: ${printBalances({balances: nextObsdBalance})}. Max capacity: ${printBalances({balances: maxNoneNovaBalances})}`,
        };
    }

    const nextOtherBalances = sumResources({
        resources: [
            ...nextObsdBalance,
            // reduce OBSD
            ..._(requestedObsd)
                .map(res => ({
                    value: -res.valueFrom,
                    symbol: res.symbolFrom,
                }))
                .value(),
            // add other resources
            ..._(requestedObsd)
                .map(res => ({
                    value: res.valueTo,
                    symbol: res.symbolTo,
                }))
                .value(),
        ],
    });

    const isValidOtherBalances = validateResourceLimit({
        resources: nextOtherBalances,
        maxResources: maxNoneNovaBalances,
    });

    if (!isValidOtherBalances) {
        return {
            action: 'stop',
            message: `Requested more than maximum storage capacity. Next balance: ${printBalances({balances: nextOtherBalances})}. Max capacity: ${printBalances({balances: maxNoneNovaBalances})}
            `,
        };
    }

    const nextBalances = sumResources({
        resources: [
            ...nextOtherBalances,
            // reduce costs
            ..._(requestedResources)
                .map(res => ({
                    value: -res.value,
                    symbol: res.symbol,
                }))
                .value(),
        ]
    });

    const actions = [
        ..._(requestedNovo)
            .map(res => exchangeTokens({
                accountName,
                valueFrom: res.valueFrom,
                symbolFrom: res.symbolFrom,
                symbolTo: res.symbolTo,
            }))
            .value(),
        ..._(requestedObsd)
            .filter(res => res.symbolTo !== RESOURCES.OBSD)
            .map(res => exchangeTokens({
                accountName,
                valueFrom: res.valueFrom,
                symbolFrom: res.symbolFrom,
                symbolTo: res.symbolTo,
            }))
            .value(),
    ];

    return {
        nextBalances,
        actions,
    };
};

export default exchangeResources;