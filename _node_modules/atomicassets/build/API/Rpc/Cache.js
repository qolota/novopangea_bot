"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const pure_cache_1 = __importDefault(require("pure-cache"));
class RpcCache {
    constructor() {
        this.cache = new pure_cache_1.default({ expiryCheckInterval: 60 * 1000 });
    }
    getAsset(assetID, data) {
        if (data) {
            data.mutable_serialized_data = new Uint8Array(data.mutable_serialized_data);
            data.immutable_serialized_data = new Uint8Array(data.immutable_serialized_data);
        }
        return this.access('assets', assetID, data);
    }
    deleteAsset(assetID) {
        this.delete('assets', assetID);
    }
    getTemplate(collectionName, templateID, data) {
        if (data) {
            data.immutable_serialized_data = new Uint8Array(data.immutable_serialized_data);
        }
        return this.access('templates', collectionName + ':' + templateID, data);
    }
    deleteTemplate(collectionName, templateID) {
        this.delete('templates', collectionName + ':' + templateID);
    }
    getSchema(collectionName, schemaName, data) {
        return this.access('schemas', collectionName + ':' + schemaName, data);
    }
    deleteSchema(collectionName, schemaName) {
        this.delete('schemas', collectionName + ':' + schemaName);
    }
    getCollection(collectionName, data) {
        return this.access('collections', collectionName, data);
    }
    deleteCollection(collectionName) {
        this.delete('collections', collectionName);
    }
    getOffer(offerID, data) {
        return this.access('offers', offerID, data);
    }
    deleteOffer(offerID) {
        this.delete('offers', offerID);
    }
    access(namespace, identifier, data) {
        if (typeof data === 'undefined') {
            const cache = this.cache.get(namespace + ':' + identifier);
            return cache === null ? null : cache.value;
        }
        this.cache.put(namespace + ':' + identifier, data, 15 * 60 * 1000);
        return data;
    }
    delete(namespace, identifier) {
        this.cache.remove(namespace + ':' + identifier);
    }
}
exports.default = RpcCache;
