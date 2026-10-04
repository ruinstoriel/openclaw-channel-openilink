import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(
  readFileSync(new URL("../openclaw.plugin.json", import.meta.url), "utf8"),
);

describe("openclaw.plugin.json", () => {
  it("declares channelConfigs for every declared channel (cold-path metadata)", () => {
    const channels: string[] = manifest.channels ?? [];
    const channelConfigs = manifest.channelConfigs ?? {};

    expect(channels.length).toBeGreaterThan(0);
    for (const channelId of channels) {
      expect(
        channelConfigs[channelId],
        `missing channelConfigs.${channelId}`,
      ).toBeDefined();
      expect(channelConfigs[channelId].schema).toBeTypeOf("object");
    }
  });

  it("describes the openilink account options for channels.openilink", () => {
    const schema = manifest.channelConfigs.openilink.schema;
    expect(Object.keys(schema.properties)).toEqual(
      expect.arrayContaining(["hub_url", "app_token", "accounts"]),
    );
  });

  it("keeps plugin-level configSchema separate from channel options", () => {
    expect(manifest.configSchema.properties).toEqual({});
  });
});
