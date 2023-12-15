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
exports.WaxEventSource = void 0;
class WaxEventSource {
    constructor(waxSigningURL) {
        this.waxSigningURL = waxSigningURL;
        this.timeout = () => __awaiter(this, void 0, void 0, function* () {
            return new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));
        });
        this.openEventSource = this.openEventSource.bind(this);
        this.onceEvent = this.onceEvent.bind(this);
    }
    openPopup(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const win = yield window.open(url, "WaxPopup", "height=800,width=600");
            if (win) {
                return win;
            }
            throw new Error("Unable to open popup window");
        });
    }
    openEventSource(url, message, win) {
        return __awaiter(this, void 0, void 0, function* () {
            const openedWindow = win ? win : yield this.openPopup(url);
            if (!openedWindow) {
                throw new Error("Unable to open a popup window");
            }
            if (typeof message === "undefined") {
                return openedWindow;
            }
            const postTransaction = (event) => __awaiter(this, void 0, void 0, function* () {
                if (event.data.type === "READY") {
                    openedWindow.postMessage(message, this.waxSigningURL);
                }
            });
            const eventPromise = this.onceEvent(openedWindow, this.waxSigningURL, postTransaction, "READY");
            yield Promise.race([eventPromise, this.timeout()]).catch(err => {
                if (err.message !== "Timeout") {
                    throw err;
                }
                openedWindow.postMessage(message, this.waxSigningURL);
            });
            return openedWindow;
        });
    }
    onceEvent(source, origin, action, type) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let resolved = false;
                window.addEventListener("message", function onEvent(event) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (event.origin !== origin) {
                            return;
                        }
                        if (event.source !== source) {
                            return;
                        }
                        if (typeof event.data !== "object") {
                            return;
                        }
                        if (type && (!event.data.type || event.data.type !== type)) {
                            return;
                        }
                        try {
                            resolved = true;
                            resolve(yield action(event));
                        }
                        catch (e) {
                            resolved = true;
                            reject(e);
                        }
                        window.removeEventListener("message", onEvent, false);
                    });
                }, false);
                const interval = setInterval(() => {
                    if (source.closed && !resolved) {
                        clearInterval(interval);
                        reject("user closed the window");
                    }
                }, 1000);
            });
        });
    }
}
exports.WaxEventSource = WaxEventSource;
