import { defineChannelPluginEntry } from "openclaw/plugin-sdk/core";
import { openiLinkChannel } from "./src/channel.js";
import { setPluginRuntime } from "./src/runtime.js";
const plugin = defineChannelPluginEntry({
    id: "openclaw-channel-openilink",
    name: "OpeniLink Hub",
    description: "Bridge WeChat bots via OpeniLink Hub",
    plugin: openiLinkChannel,
    setRuntime: setPluginRuntime,
});
export default plugin;
