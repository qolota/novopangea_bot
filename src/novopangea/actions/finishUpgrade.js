import CONTRACTS from '../consts/CONTRACTS';

const finishUpgrade = ({
    accountName,
    assetId,
}) => {
    return {
        account: CONTRACTS.GAME,
        name: 'upnftend',
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

export default finishUpgrade;