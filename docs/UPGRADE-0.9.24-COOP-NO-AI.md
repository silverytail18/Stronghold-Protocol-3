# 0.9.24 多人房间禁止添加AI队友

房间空位只保留邀请真人入口，删除添加AI队友按钮和请求回调。服务器拒绝所有room.addBot请求，旧客户端或直接请求同样无效；房主、普通账号、管理员均适用，普通/排位、原版/插件一致。多人开局再次检查AI席位，有旧席位时提示先移除，不会创建对局或计分记录；移除旧AI和真人加入功能保留。

本次限制针对房间AI队友席位，不修改敌方AI、单人玩法或真人账号已有的托管/接管规则。资源、签名和最低构建要求保持，复用Windows build45及安卓横屏版build46（兼容45），不需要重新安装客户端。

## 更新

在原开服终端Ctrl+C，等待退出；上传新包到 `/root/updates`，逐行成功后继续：

```bash
cd /root/updates
tar -xzf Stronghold-Protocol-3-server-light-v0.9.24-coop-no-ai-20261104.tar.gz --strip-components=1 -C /root/w3
cd /root/w3
npm ci --omit=dev
node --env-file="/root/w3/config/server.env" tools/clear-unfinished-matches.mjs --stopped
node --env-file="/root/w3/config/server.env" server/product/game-server.js
```

最后一行保持运行。包不含真实配置、账号、数据库或存档，覆盖保留原服数据；停服清理仅删除无最终结果的未完成对局。按用户要求不增加检查、备份或update-project命令。更新后所有客户端完全退出再打开，旧客户端未刷新时按钮可能仍显示，但请求也会被服务器拒绝。

验证仅用低优先级实际HTTP/WebSocket临时双账号，检查四种房间组合拒绝、管理员限制、真人加入、旧AI席位开局拒绝及移除；不运行战斗、模拟器、原生客户端、全量Golden或压力测试。最终归档以工作区 `reports/no-ai-teammates-20261104/` 为准。未上传部署。
