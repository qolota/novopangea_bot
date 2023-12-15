export declare class WaxEventSource {
    private waxSigningURL;
    constructor(waxSigningURL: string);
    openPopup(url: string): Promise<Window>;
    openEventSource(url: string, message?: any, win?: Window): Promise<Window>;
    onceEvent<T>(source: Window, origin: string, action: (e: MessageEvent) => T, type?: string): Promise<T>;
    private timeout;
}
