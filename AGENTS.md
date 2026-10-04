# AGENTS.md — 开发规约

本文件是本仓库的**强制开发规约**。修改代码前必须阅读并遵守；与既有代码冲突时，以本规约为准（除非明确说明理由）。

## 0. 运行环境（强制）

- 本仓库的所有 `node` / `npm` / `tsc` / `vitest` 命令**必须使用 fnm 的默认版本**（当前为 Node 26）。
- 动手前先确认环境：`fnm use`（或切到 fnm default）后执行 `node -v`，应显示 26.x，再运行任何仓库命令。
- **禁止使用系统自带 Node**（可能是 18）运行本仓库命令：会导致 openclaw 原生依赖（`koffi` 等）安装失败、`vitest` 无法启动。
- `openclaw` 要求 Node `>=24.16 <25 || >=26.1`，不要降级。

## 1. 通用原则

- 只做被要求的最小改动，禁止顺手重构、格式化无关文件、批量改行尾。
- 改动前先阅读相关文件；涉及设计变更先看 `docs/plans/`。
- 保持现有架构与风格；能复用现有函数就不要新写。
- 不新增运行时依赖，除非确有必要，并在提交说明中写明理由。
- 不删除或弱化已有测试与校验来「让结果变绿」。

## 2. TypeScript / 模块

- 严格模式（`strict: true`），保持 `tsc` 零错误。
- ESM：**所有相对导入必须带 `.js` 后缀**（如 `./config.js`），即使源文件是 `.ts`。
- 仅用于类型的导入必须用 `import type { ... }`。
- 对外导出与公共函数要有明确类型；禁止新增 `any`（`gateway.ts` / `outbound.ts` 中与 SDK 契约对接处的既有 `any` 可保留，但修改时优先补类型）。
- 不修改 `tsconfig.json` 的编译目标/模块解析，除非任务明确要求。

## 3. 命名与文件

- 源文件放在 `src/`，使用小写、语义化命名（现有 `inbound.ts` / `outbound.ts` / `gateway.ts` 风格）。
- 单测与被测文件同目录，命名 `*.test.ts`。
- 常量用 `UPPER_SNAKE_CASE`；函数/变量用 `camelCase`。
- Hub 协议字段保持 `snake_case`（`hub_url`、`app_token`、`file_name`…），与协议一致，不改为 camelCase。

## 4. OpenClaw Plugin SDK 规约

- 插件入口 `index.ts` 必须显式标注类型后再导出：
  ```ts
  const plugin: OpenClawPluginDefinition = defineChannelPluginEntry({ ... });
  export default plugin;
  ```
  否则开启 `declaration` 会报 `TS2742`。
- `formatInboundEnvelope` 必须从 `openclaw/plugin-sdk/channel-inbound` 导入；**不存在** `rt.channel.reply.formatInboundEnvelope`。
- 运行时一律通过 `getPluginRuntime()` 获取；取不到 `rt.channel` 时直接 `return`，不得假定存在。
- 插件标识固定：`openclaw.plugin.json` 的 `id` = `openclaw-channel-openilink`，channel id / plugin id = `openilink`，不得随意更改。
- 升级 `openclaw` 版本时，必须：
  1. 同步 `devDependencies` 与 `peerDependencies` 下限；
  2. 重新生成 `package-lock.json`；
  3. 人工核对弱类型契约 `ChannelGatewayContext`（`cfg/accountId/account/abortSignal/setStatus`）与 `ChannelOutboundAdapter`（`deliveryMode/sendText/sendMedia`）；
  4. 同步 `test/docker-compose.yml` 的 Node 镜像（openclaw 要求 Node `>=24.16 <25 || >=26.1`）与 `test/entrypoint.sh` 的 openclaw 版本。

## 5. 配置与 manifest

- 配置入口只读 `cfg.channels.openilink`；支持 `accounts.<id>` 覆盖顶层。
- 新增配置项用 `snake_case`，并在 `README.md` 参数表中同步登记。
- `openclaw.plugin.json` 是冷启动契约：
  - `channels[]` 中声明的**每个** channel 都必须在 `channelConfigs.<id>.schema` 中提供 JSON Schema，否则 openclaw 会告警且 setup UI 失效（`src/manifest.test.ts` 会守护此约定）。
  - channel 选项（`hub_url` / `app_token` / `accounts`）属于 `channelConfigs.<id>.schema`，**不要**放进顶层 `configSchema`；后者只校验 `plugins.entries.<id>.config`，保持为空对象。
  - 用 `uiHints` 标注 `label` / `placeholder`，敏感项（如 `app_token`）标记 `sensitive: true`。
- `hub_url` 统一去掉结尾 `/`；缺 `hub_url` / `app_token` 时按未配置处理，不得抛异常。

## 6. 构建与产物

- 修改 `src/` 或 `index.ts` 后必须执行 `npm run build`，使 `dist/` 与源码一致。
- `dist/` 为编译产物，**禁止手改**；只改源码再构建。
- `.gitignore` 末尾的 `!dist/`、`!dist/**` 用于放行 `dist/`；新增忽略规则时必须保证否定规则在忽略规则**之后**，否则 `dist` 会重新被 `*.js` / `*.d.ts` 吞掉。
- `package.json` 的 `main` / `types` / `openclaw.extensions` 都指向 `dist/`，不得改指向源码。

## 7. 测试

- 任何 bug 修复或新功能都必须附带/更新 Vitest 单测；纯函数优先单测（见 `src/inbound.test.ts`）。
- 提交前 `npm test` 必须全绿（当前基线 17 passed）。
- 改动 Hub 协议收发逻辑时，同步更新 `test/mock-hub.mjs` / `test/mock-llm.mjs` 的断言。
- Docker 集成测试改动后需保持 `bash test/run.sh` 可用。

## 8. 提交规约

- 使用 Conventional Commits：`feat:` / `fix:` / `docs:` / `refactor:` / `test:` / `chore:`。
- 标题用英文、祈使句、首字母小写；一个提交只做一件事。
- 不提交 `node_modules/`、构建日志、密钥或 token；配置文件中的 token 一律用占位符。
- 不修改 `LICENSE`。

## 9. 验证清单（提交前）

0. `node -v` 为 fnm 默认的 26.x（见第 0 节）；
1. `npm run build` 通过；
2. `npm test` 通过；
3. 无新增 `any`、无遗漏的 `.js` 后缀、无未跟踪的临时文件；
4. 依赖/版本变更已同步 `package.json`、`package-lock.json`、`peerDependencies`（如涉及）。
