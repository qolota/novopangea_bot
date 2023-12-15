import CONTRACTS from '../consts/CONTRACTS';

const startUpgrade = ({
    accountName,
    assetId,
}) => {
    return {
        account: CONTRACTS.GAME,
        name: 'upnftstart',
        authorization: [
            {
                actor: accountName,
                permission: 'active',
            },
        ],
        data: {
            asset_id: assetId,
        },
    };
};

export default startUpgrade;