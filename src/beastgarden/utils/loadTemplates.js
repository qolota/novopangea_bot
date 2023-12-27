import _ from 'lodash';
import fetchTemplates from '../../atomicassets/api/fetchTemplates';
import {
    getRarityWeight,
} from '../consts/RARITY';
import fetchTemplatesStats from '../../atomicassets/api/fetchTemplatesStats';
import fetchAccountAssetsWaxData from '../../atomicassets/api/fetchAccountAssetsWaxData';

const SUB_POOLS = {
    BEASTS: 155000,
    SPRINGS: 55000,
    PLANTS: 33000,
    FRUITS: 12000,
    SHARDS: 1500,
};

const SHARD_NAME_TO_WEIGHT = {
    "Chest of Shards": 25,
    "Barrow of Shards": 10,
    "Bucket of Shards": 5,
    "Pile of Shards": 3,
    "Floating Shards": 2,
};

const BEAST_RARITY_TO_WEIGHT = {
    "Hardcore":1250,
    "Watt":1000,
    "Droynos":1000,
    "Mindburn":1000,
    "Steelcore":1000,
    "Amperion":750,
    "Zwoynos":750,
    "Soulburn":750,
    "Molcore":625,
    "Heartburn":500,
    "Volt":500,
    "Oynos":500,
    "Paine":375,
    "Avilottl":300,
    "Angrimoire":300,
    "Ni'vlek":300,
    "Hydroid":300,
    "Umbriel":300,
    "Pine":250,
    "Hydros":225,
    "Octome":225,
    "Avi":150,
    "Avilo":225,
    "Kalyke":225,
    "Ti'ehf":225,
    "Crocodex":150,
    "Sui'slec":150,
    "Lunaris":150,
    "Hydro":150,
    "Sting":100,
    "Cherax":50,
    "Foerax":75,
    "Owlaf":50,
    "Elegatir":75,
    "Owlson":75,
    "Zekthul":75,
    "Otunos":75,
    "Magmatur":75,
    "Elegator":50,
    "Zektir":50,
    "Aquinos":50,
    "Magmati":50,
    "Orelion":50,
    "General Nigiri":60,
    "Ionoss":30,
    "Boulder":30,
    "Major Nigiri":40,
    "Oibadrischl":30,
    "Pebble":20,
    "Wolpertinger":20,
    "Stratoss":20,
    "Calima":20,
    "Vulcanis":10,
    "Rat King":10,
    "Beak":10,
    "Ta'kha":10,
    "Poultron":10,
    "Kamazott":20,
    "Brawler":10,
    "Prawnsidon":10,
};

const loadTemplates = async ({
    accountName,
}) => {
    const templates = _(await fetchTemplates({
        params: {
            collection_name: 'beastgardens',
        },
        customProcessor: ({template}) => {
            switch (template.schema.schema_name) {
                case 'beasts':
                    return {
                        evolution: Number(template.immutable_data.evolution),
                        rarity: template.immutable_data.rarity,
                        weight: getRarityWeight(template.immutable_data.rarity),
                    };
                case 'springs':
                case 'shards':
                case 'plants':
                    return {
                        rarity: template.immutable_data.rarity,
                        weight: getRarityWeight(template.immutable_data.rarity),
                    };
                default:
                    return {};
            }
        },
    }))
        .filter(template => ['beasts', 'plants', 'springs', 'fruits', 'shards'].includes(template.schemaName))
        .value();

    for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        const templateStats = await fetchTemplatesStats({
            params: {
                template_id: template.id,
            },
        });
        
        template.burned = templateStats.burned;
        template.availableCount = template.issuedSupply - template.burned;
        switch (template.schemaName) {
            case 'beasts':
                template.assetWeight = BEAST_RARITY_TO_WEIGHT[template.name];
                break;
            case 'springs':
            case 'plants':
                template.assetWeight = template.weight;
                break;
            case 'shards':
                template.assetWeight = SHARD_NAME_TO_WEIGHT[template.name];
                break;
            case 'fruits':
                template.assetWeight = 1;
                break;
        }
        template.totalWeight = template.availableCount * template.assetWeight;
    }

    const WEIGHTS = {
        BEASTS: _(templates)
            .filter(template => template.schemaName === 'beasts')
            .map(template => template.totalWeight)
            .sum(),
        SPRINGS: _(templates)
            .filter(template => template.schemaName === 'springs')
            .map(template => template.totalWeight)
            .sum(),
        PLANTS: _(templates)
            .filter(template => template.schemaName === 'plants')
            .map(template => template.totalWeight)
            .sum(),
        FRUITS: _(templates)
            .filter(template => template.schemaName === 'fruits')
            .map(template => template.totalWeight)
            .sum(),
        SHARDS: _(templates)
            .filter(template => template.schemaName === 'shards')
            .map(template => template.totalWeight)
            .sum(),
    };

    const templatesWithPrice = _(templates)
        .map(template => {
            switch (template.schemaName) {
                case 'beasts':
                    return {
                        ...template,
                        buybackPrice: (SUB_POOLS.BEASTS / WEIGHTS.BEASTS) * template.assetWeight,
                    };
                case 'springs':
                    return {
                        ...template,
                        buybackPrice: (SUB_POOLS.SPRINGS / WEIGHTS.SPRINGS) * template.assetWeight,
                    };
                case 'shards':
                    return {
                        ...template,
                        buybackPrice: (SUB_POOLS.SHARDS / WEIGHTS.SHARDS) * template.assetWeight,
                    };
                case 'plants':
                    return {
                        ...template,
                        buybackPrice: (SUB_POOLS.PLANTS / WEIGHTS.PLANTS) * template.assetWeight,
                    };
                case 'fruits':
                    return {
                        ...template,
                        buybackPrice: (SUB_POOLS.FRUITS / WEIGHTS.FRUITS) * template.assetWeight,
                    };
            }
        })
        .value();
    
    const {
        beasts,
        springs,
        plants,
        fruits,
        shards,
    } = await fetchAccountAssetsWaxData({
        accountName,
        assetParams: [
            {
                key: 'beasts',
                params: {
                    collectionName: 'beastgardens',
                    schemaName: 'beasts',
                },
                customProcessor: ({asset}) => {
                    const templateId = asset.templateId.toString();
                    return {
                        template: _(templatesWithPrice)
                            .find(template => template.id === templateId)
                    };
                },
            },
            {
                key: 'plants',
                params: {
                    collectionName: 'beastgardens',
                    schemaName: 'plants',
                },
                customProcessor: ({asset}) => {
                    const templateId = asset.templateId.toString();
                    return {
                        template: _(templatesWithPrice)
                            .find(template => template.id === templateId)
                    };
                },
            },
            {
                key: 'springs',
                params: {
                    collectionName: 'beastgardens',
                    schemaName: 'springs',
                },
                customProcessor: ({asset}) => {
                    const templateId = asset.templateId.toString();
                    return {
                        template: _(templatesWithPrice)
                            .find(template => template.id === templateId)
                    };
                },
            },
            {
                key: 'fruits',
                params: {
                    collectionName: 'beastgardens',
                    schemaName: 'fruits',
                },
                customProcessor: ({asset}) => {
                    const templateId = asset.templateId.toString();
                    return {
                        template: _(templatesWithPrice)
                            .find(template => template.id === templateId)
                    };
                },
            },
            {
                key: 'shards',
                params: {
                    collectionName: 'beastgardens',
                    schemaName: 'shards',
                },
                customProcessor: ({asset}) => {
                    const templateId = asset.templateId.toString();
                    return {
                        template: _(templatesWithPrice)
                            .find(template => template.id === templateId)
                    };
                },
            },
        ],
    });

    const ACCOUNT_WEIGHTS = {
        BEASTS: (() => {
            const totalWeight = _(beasts)
                .map(asset => asset.template.assetWeight)
                .sum();

            return {
                totalWeight,
                assetsCount: beasts.length,
                share: _.round(totalWeight / WEIGHTS.BEASTS * 100, 2),
                buybackPrice: (SUB_POOLS.BEASTS / WEIGHTS.BEASTS) * totalWeight,
            };
        })(),
        SPRINGS: (() => {
            const totalWeight = _(springs)
                .map(asset => asset.template.assetWeight)
                .sum();

            return {
                totalWeight,
                assetsCount: springs.length,
                share: _.round(totalWeight / WEIGHTS.SPRINGS * 100, 2),
                buybackPrice: (SUB_POOLS.SPRINGS / WEIGHTS.SPRINGS) * totalWeight,
            };
        })(),
        PLANTS: (() => {
            const totalWeight = _(plants)
                .map(asset => asset.template.assetWeight)
                .sum();

            return {
                totalWeight,
                assetsCount: plants.length,
                share: _.round(totalWeight / WEIGHTS.PLANTS * 100, 2),
                buybackPrice: (SUB_POOLS.PLANTS / WEIGHTS.PLANTS) * totalWeight,
            };
        })(),
        FRUITS: (() => {
            const totalWeight = _(fruits)
                .map(asset => asset.template.assetWeight)
                .sum();

            return {
                totalWeight,
                assetsCount: fruits.length,
                share: _.round(totalWeight / WEIGHTS.FRUITS * 100, 2),
                buybackPrice: (SUB_POOLS.FRUITS / WEIGHTS.FRUITS) * totalWeight,
            };
        })(),
        SHARDS: (() => {
            const totalWeight = _(shards)
                .map(asset => asset.template.assetWeight)
                .sum();

            return {
                totalWeight,
                assetsCount: shards.length,
                share: _.round(totalWeight / WEIGHTS.SHARDS * 100, 2),
                buybackPrice: (SUB_POOLS.SHARDS / WEIGHTS.SHARDS) * totalWeight,
            };
        })(),
    };
    
    return {
        WEIGHTS,
        ACCOUNT_WEIGHTS,
        templatesWithPrice,
    };
};

export default loadTemplates;