"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiOfferState = void 0;
var ApiOfferState;
(function (ApiOfferState) {
    ApiOfferState[ApiOfferState["Pending"] = 0] = "Pending";
    ApiOfferState[ApiOfferState["Invalid"] = 1] = "Invalid";
    ApiOfferState[ApiOfferState["Unknown"] = 2] = "Unknown";
    ApiOfferState[ApiOfferState["Accepted"] = 3] = "Accepted";
    ApiOfferState[ApiOfferState["Declined"] = 4] = "Declined";
    ApiOfferState[ApiOfferState["Canceled"] = 5] = "Canceled";
})(ApiOfferState = exports.ApiOfferState || (exports.ApiOfferState = {}));
