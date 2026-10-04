import type { OpeniLinkConfig } from "./types.js";
export declare function createOutboundAdapter(resolveConfig: (cfg: any, accountId?: string | null) => OpeniLinkConfig): {
    deliveryMode: "direct";
    sendText(ctx: any): Promise<any>;
    sendMedia(ctx: any): Promise<any>;
};
