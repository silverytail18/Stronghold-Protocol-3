# 第一批数据与账号基础

历史说明（2026-11-02）：本文记录第一批重构候选当时的状态，不能作为当前项目状态或部署指引。当前活动源码是 `Stronghold-Protocol-3-next/`（1.1.0）；旧 0.9.13 项目已归档至 `../archive/retired-projects/Stronghold-Protocol-3-0.9.13/`，只供历史查阅。当前状态以本目录 `README.md`、`AGENTS.md` 及最新交付记录为准。

`npm start`当前只启动账号评审服务，浏览器可登录、改密和访问相应管理页面；不提供游戏、WebSocket、安装包或资源二进制。启动前必须指定已有数据的独立副本；不会生成默认账号。真实游戏的原生客户端资源通路、身份/恢复/观战/排位结果适配仍在后续工作内。

数据工具：`node tools/state-transfer.mjs inspect|snapshot|verify|restore ...`。快照须停服，包含SQLite已提交WAL并做逻辑检查。restore默认dry-run，实际还原只能使用独立新目录，不能覆盖原数据/配置。旧running/pending/账号锁会阻止切换。未知设置、退休内容、数据库扩展表及账号扩展字段保留，不因新目录缺项而清空。

账号与历史服务位于`server/product/`，保持现有账号ID、密码哈希、角色/禁用/赞助及schema 1。版本后台位于浏览器“游戏版本”页，API为`/auth/admin/game-versions`；四个原游戏版本来自`shared/versions.js`。当前已完成策略保存与权限检查，**尚未接到实际游戏房间**。保存不重算历史，既有房间/对局未来也不强制改版。

UI使用上游theme/components的设计，账号页面独立滚动，桌面与手机横竖屏验收见工作区报告。资源/特效/FX映射只采用固定上游及其获取提取流程，定制角色也沿其方法补齐；旧本地素材、FX包和ABI2映射不接入。

复验：`npm run test:product`（33项），`node tools/i18n.mjs check --all --strict`。完整上游基线不是全绿，Windows符号链接、Forge权限和信号退出码等限制不能静默略过。详细结果、原始日志、状态保护与待办见工作区`reports/upstream-rebase-batch1-20261102/DELIVERY.md`。
