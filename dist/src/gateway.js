import { handleInboundEvent } from "./inbound.js";
const connections = new Map();
export async function startAccount(ctx) {
    const { accountId, account, cfg, abortSignal, setStatus } = ctx;
    const config = account;
    if (!config.hubUrl || !config.appToken) {
        setStatus({ status: "error", error: "Missing hub_url or app_token" });
        return;
    }
    const { default: WS } = await import("ws");
    const wsUrl = `${config.hubUrl.replace(/^http/, "ws")}/bot/v1/ws?token=${config.appToken}`;
    let reconnectDelay = 1000;
    const MAX_DELAY = 60_000;
    function connect() {
        if (abortSignal.aborted)
            return;
        const existing = connections.get(accountId);
        if (existing && (existing.readyState === WS.OPEN || existing.readyState === WS.CONNECTING)) {
            return;
        }
        const ws = new WS(wsUrl);
        connections.set(accountId, ws);
        ws.on("open", () => {
            reconnectDelay = 1000;
            setStatus({ status: "running" });
            console.log(`[openilink] Connected to Hub: ${config.hubUrl}`);
        });
        ws.on("message", (data) => {
            try {
                const msg = JSON.parse(data.toString());
                if (msg.type === "init") {
                    console.log(`[openilink] Init: bot=${msg.data.bot_id}, app=${msg.data.app_slug}`);
                    return;
                }
                if (msg.type === "event") {
                    handleInboundEvent(msg, config, cfg, accountId);
                    return;
                }
                if (msg.type === "pong")
                    return;
            }
            catch (err) {
                console.error("[openilink] Parse error:", err);
            }
        });
        ws.on("close", () => {
            connections.delete(accountId);
            setStatus({ status: "disconnected" });
            if (!abortSignal.aborted) {
                const jitter = Math.random() * 1000;
                setTimeout(connect, reconnectDelay + jitter);
                reconnectDelay = Math.min(reconnectDelay * 2, MAX_DELAY);
            }
        });
        ws.on("error", (err) => {
            console.error("[openilink] WS error:", err.message);
            setStatus({ status: "error", error: err.message });
        });
        // Ping every 30s
        const pingInterval = setInterval(() => {
            if (ws.readyState === WS.OPEN) {
                ws.send(JSON.stringify({ type: "ping" }));
            }
        }, 30000);
        ws.on("close", () => clearInterval(pingInterval));
        abortSignal.addEventListener("abort", () => {
            clearInterval(pingInterval);
            ws.close();
        });
    }
    connect();
    // Keep the promise alive until the account is stopped
    await new Promise((resolve) => {
        abortSignal.addEventListener("abort", () => resolve());
    });
}
export async function stopAccount(ctx) {
    const ws = connections.get(ctx.accountId);
    if (ws) {
        ws.close();
        connections.delete(ctx.accountId);
    }
}
