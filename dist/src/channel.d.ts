import type { OpeniLinkConfig } from "./types.js";
import { startAccount, stopAccount } from "./gateway.js";
export declare const openiLinkChannel: {
    id: any;
    meta: {
        id: any;
        label: string;
        selectionLabel: string;
        docsPath: string;
        blurb: string;
    };
    capabilities: {
        chatTypes: Array<"direct" | "group">;
        media: boolean;
    };
    config: {
        listAccountIds: (cfg: any) => string[];
        resolveAccount: (cfg: any, accountId?: string | null) => OpeniLinkConfig;
        isConfigured: (account: OpeniLinkConfig) => boolean;
        describeAccount: (account: OpeniLinkConfig) => {
            status: string;
            label: string;
        };
    };
    gateway: {
        startAccount: typeof startAccount;
        stopAccount: typeof stopAccount;
    };
    outbound: {
        deliveryMode: "direct";
        sendText(ctx: any): Promise<any>;
        sendMedia(ctx: any): Promise<any>;
    };
};
