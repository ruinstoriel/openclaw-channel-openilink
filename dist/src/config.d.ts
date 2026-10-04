import type { OpeniLinkConfig } from "./types.js";
export declare function resolveConfig(cfg: any, accountId?: string | null): OpeniLinkConfig;
export declare function listAccountIds(cfg: any): string[];
export declare function isConfigured(cfg: any, accountId?: string | null): boolean;
