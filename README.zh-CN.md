# obsidian-vault-sync

[English](./README.md) | [简体中文](./README.zh-CN.md)

`obsidian-vault-sync` 是一个用于 Obsidian 的第三方同步插件，支持 S3 / OSS / MinIO、WebDAV、Dropbox 和 OneDrive（个人版）。

本仓库直接 fork 自 [sboesen/remotely-sync](https://github.com/sboesen/remotely-sync)。在此基础上，当前仓库已经把 `obsidian-vault-sync` 视为一个**全新的插件身份**。仓库名、插件目录名、`manifest.id`、Obsidian 内显示的插件名都统一为 `obsidian-vault-sync`。

## 相比 `sboesen/remotely-sync` 的主要差异

- **更关注 `.obsidian/` 多端同步的完整性。** 相比原项目，当前仓库重点增强了 `.obsidian/`、`bookmarks.json`、`.trash` 这些 Obsidian 配置与状态文件在多设备之间的同步完整性。
- **为已同步配置项增加了基于快照的删除跟踪。** `.obsidian`、`bookmarks.json`、`.trash` 下的删除操作会基于上一次成功同步的快照进行传播，而不只是同步新增和覆盖。
- **书签与 `.trash` 同步是一等能力。** Obsidian 书签默认参与同步；如果你的工作流依赖本地 `.trash`，也可以显式开启其同步。
- **配置目录同步时更安全地处理当前插件目录。** 当前插件自身的 `data.json` 会始终排除在配置同步之外，同时保留其它相关插件文件的同步能力。
- **插件身份已完全切换。** 仓库名、插件目录名、`manifest.id`、Obsidian 内显示名称都统一为 `obsidian-vault-sync`。
- **不再兼容旧安装。** 旧的 `remotely-save`、`remotely-secure`、`remotely-sync` 安装、设置、OAuth 授权和远端元数据都不会复用。
- **需要新的远端命名空间。** 回调 URI、远端元数据文件名、插件专用存储路径都跟随 `obsidian-vault-sync` 新身份变化，因此应使用新的远端目录、bucket 或应用空间。
- **Dropbox / OneDrive 构建要求不同。** 自建版本需要通过 `.env` 注入新的 OAuth 凭据，否则这两个提供商会明确提示当前构建未包含对应配置。
- **构建链已简化。** 项目现在统一使用 `npm run build` + `esbuild`，构建产物统一输出到 `dist/`。

## 重要说明

- **这不是 Obsidian 官方的 Sync 服务。**
- **请始终先备份 vault。**
- 旧的 `remotely-save`、`remotely-secure`、`remotely-sync` 安装、设置、OAuth 授权和远端元数据**都不兼容**。
- 请把它当成一次**全新安装**，并使用**新的远端命名空间**。

## 功能概览

- 支持 Amazon S3 及兼容 S3 的服务
- 支持 Dropbox
- 支持 OneDrive 个人版
- 支持 WebDAV
- 支持移动端与桌面端同步
- 支持端到端加密，使用 AES-256-GCM
- 支持手动同步、定时同步、保存后同步
- 支持状态栏显示同步状态
- 默认支持同步书签，并可选同步 `.obsidian` 配置、`.trash`
- 支持通过远端额外元数据传播删除记录

更多服务兼容性可参考：[docs/services_connectable_or_not.md](./docs/services_connectable_or_not.md)

## 限制与注意事项

- 为了支持删除同步和部分配置项同步，插件默认会向远端写入额外元数据文件，详见：[docs/minimal_intrusive_design.md](./docs/minimal_intrusive_design.md)
- 没有内容级冲突合并。文件冲突主要按本地/远端修改时间决策
- 如果你刚开启配置目录、书签或 `.trash` 同步，需要先成功同步一次，建立本地基线快照
- 云服务的请求、存储和流量可能产生费用
- `data.json` 包含敏感信息，不建议分享或提交到版本控制

## 作为全新插件安装 / 从旧插件迁移

如果你之前使用的是 `Remotely Save` 或其它旧分支，建议按下面步骤迁移：

1. 在所有设备上先完成一次本地备份
2. 停用并卸载旧插件
3. 把 `obsidian-vault-sync` 安装到 `.obsidian/plugins/obsidian-vault-sync`
4. 从头配置新插件
5. 使用新的远端命名空间：
   - S3 / OSS / MinIO：使用新的空 bucket
   - WebDAV：使用新的 `remoteBaseDir`
   - Dropbox / OneDrive：把它当成一个新的应用重新授权，并使用新的 `remoteBaseDir`
6. 执行第一次完整同步

## 安装方式

- 方式 1：使用 [Obsidian42 - BRAT](https://github.com/TfTHacker/obsidian42-brat)，添加 `windvalley/obsidian-vault-sync`
- 方式 2：从 [GitHub Releases](https://github.com/windvalley/obsidian-vault-sync/releases) 下载 `main.js`、`manifest.json`、`styles.css`
- 方式 3：从源码构建

## 从源码构建

```bash
git clone --recurse-submodules https://github.com/windvalley/obsidian-vault-sync
cd obsidian-vault-sync
npm install
cp .env.example.txt .env
```

开发模式：

```bash
npm run dev
```

生产构建：

```bash
npm run build
```

构建产物统一输出到 `dist/`：

- `dist/main.js`
- `dist/manifest.json`
- `dist/styles.css`

安装到本地 vault：

```bash
cp dist/main.js dist/styles.css dist/manifest.json /your/path/to/vault/.obsidian/plugins/obsidian-vault-sync
```

然后在 Obsidian 中重新加载插件或重启应用。

## 各同步服务说明

### S3 / OSS / MinIO

- 需要准备 endpoint、region、access key、secret key、bucket name
- 建议使用一个新的空 bucket 专门存放同步数据
- 老版本 Obsidian 或部分环境下可能需要配置 CORS
- 如果你使用 OSS / MinIO，仍然走 S3 配置

相关文档：

- [docs/s3_cors_configure.md](./docs/s3_cors_configure.md)
- [docs/services_connectable_or_not.md](./docs/services_connectable_or_not.md)

### Dropbox

- 插件会在 Dropbox 的 `/Apps/obsidian-vault-sync` 下读写文件
- 自建版本如果要支持 Dropbox OAuth，需要先在 `.env` 中设置：

```bash
DROPBOX_APP_KEY=
```

- 如果没有配置这个值，插件会明确提示当前构建不包含 Dropbox OAuth 应用密钥

### OneDrive（个人版）

- 只支持 OneDrive 个人版，不支持企业版
- 插件会在 OneDrive 的 `/Apps/obsidian-vault-sync` 下读写文件
- 自建版本如果要支持 OneDrive OAuth，需要先在 `.env` 中设置：

```bash
ONEDRIVE_CLIENT_ID=
ONEDRIVE_AUTHORITY=https://login.microsoftonline.com/common/
```

- 如果没有配置这些值，插件会明确提示当前构建不包含 OneDrive OAuth 凭据

### WebDAV

- 默认会把数据同步到服务器上的 `/${vaultName}` 或你设置的 `remoteBaseDir`
- 某些服务器和老版本 Obsidian 需要额外处理 CORS

相关文档：

- [docs/browser_env.md](./docs/browser_env.md)
- [docs/browser_env_cors.md](./docs/browser_env_cors.md)

## 调试与故障排查

调试文档：

- [docs/how_to_debug/README.md](./docs/how_to_debug/README.md)
- [docs/how_to_debug/check_console_output.md](./docs/how_to_debug/check_console_output.md)
- [docs/how_to_debug/export_sync_plans.md](./docs/how_to_debug/export_sync_plans.md)

常见问题：

- 如果出现 `password_not_matched`
  1. 先备份本地 vault
  2. 删除远端同步目录
  3. 重新同步

- 如果 Dropbox / OneDrive 点击鉴权后没有反应
  - 检查当前构建是否已经在 `.env` 中注入了新的 OAuth 凭据

- 如果你启用了配置目录同步，但修改后看不到结果
  - 某些配置需要 Obsidian 重启后才会重新加载

## 更多文档

- 加密说明：[docs/encryption.md](./docs/encryption.md)
- 同步算法：[docs/sync_algorithm_v2.md](./docs/sync_algorithm_v2.md)
- 浏览器环境限制：[docs/browser_env.md](./docs/browser_env.md)
- 导入导出非 OAuth 设置：[docs/import_export_some_settings.md](./docs/import_export_some_settings.md)

## 贡献与反馈

- 问题反馈：<https://github.com/windvalley/obsidian-vault-sync/issues>
- Pull Request：<https://github.com/windvalley/obsidian-vault-sync/pulls>

## 致谢

- 感谢 [@sboesen](https://github.com/sboesen) 和 [sboesen/remotely-sync](https://github.com/sboesen/remotely-sync) 提供直接的 fork 基础以及此前的维护工作
- 感谢 @fyears 提供最初的 Remotely Save 项目

如果后续需要，我可以继续把 `docs/` 目录里的高频文档逐步补成中文版本。
