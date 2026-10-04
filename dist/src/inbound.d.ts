import type { HubWSEvent, HubMessageItem, OpeniLinkConfig } from "./types.js";
export declare function handleInboundEvent(event: HubWSEvent, config: OpeniLinkConfig, cfg: any, accountId: string): Promise<void>;
/**
 * Build a human-readable body from event data, incorporating media items.
 * For text messages, returns content as-is.
 * For media messages, appends file/media info so the AI can see what was sent.
 */
export declare function buildBodyFromItems(content: string, msgType: string | undefined, items: HubMessageItem[] | undefined): string;
export declare function formatFileSize(bytes: number): string;
