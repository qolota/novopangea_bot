"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProofWaxRequiredKeys = void 0;
const getProofWaxRequiredKeys = (rpcUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch(`${rpcUrl}/v1/chain/get_account`, {
        body: JSON.stringify({
            account_name: "proof.wax",
        }),
        method: "POST",
    });
    if (!response.ok) {
        // Handle non-successful HTTP responses (e.g., 404 Not Found, 500 Internal Server Error)
        console.error(`HTTP error! Status: ${response.status}`);
    }
    else {
        const responseData = yield response.json();
        if (responseData.permissions) {
            for (const perm of responseData.permissions) {
                if (perm.perm_name === "active") {
                    return perm.required_auth.keys[0].key;
                }
            }
        }
    }
    throw (new Error('Unable to retrieve the WAX proof key for account verification'));
});
exports.getProofWaxRequiredKeys = getProofWaxRequiredKeys;
