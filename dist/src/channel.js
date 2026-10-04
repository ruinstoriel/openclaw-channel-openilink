import { resolveConfig, listAccountIds } from "./config.js";
import { startAccount, stopAccount } from "./gateway.js";
import { createOutboundAdapter } from "./outbound.js";
export const openiLinkChannel = {
    id: "openilink",
    meta: {
        id: "openilink",
        label: "OpeniLink Hub",
        selectionLabel: "OpeniLink Hub (WeChat Bridge)",
        docsPath: "channels/openilink",
        blurb: "Send and receive WeChat messages via OpeniLink Hub",
    },
    capabilities: {
        chatTypes: ["direct", "group"],
        media: true,
    },
    config: {
        listAccountIds: (cfg) => listAccountIds(cfg),
        resolveAccount: (cfg, accountId) => resolveConfig(cfg, accountId),
        isConfigured: (account) => !!(account.hubUrl && account.appToken),
        describeAccount: (account) => ({
            status: account.hubUrl ? "configured" : "unconfigured",
            label: account.hubUrl || "Not configured",
        }),
    },
    gateway: {
        startAccount,
        stopAccount,
    },
    outbound: createOutboundAdapter(resolveConfig),
};
