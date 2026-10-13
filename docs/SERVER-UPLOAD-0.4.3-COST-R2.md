# 0.4.3 r2 Cost避让更新

最终验收包Stronghold-Protocol-3-server-light-v0.4.3-kazdel-cost-r2-verified-20261011.tar.gz及同名.sha256，位于项目外release-packages。已先交候选后完成4项检查及8组真实Cost布局验证，无失败或跳过。最终包替代r2候选及原版0.4.3包；只修复魂火卡布局，游戏数值与能力21保持。Node.js需22.16或更新。

上传这两个文件至/root/updates，同一SSH终端执行：

```bash
mkdir -p /root/updates
cd /root/updates
sha256sum -c Stronghold-Protocol-3-server-light-v0.4.3-kazdel-cost-r2-verified-20261011.tar.gz.sha256
SP_UPDATE_STAGE="$(mktemp -d /root/w3-update-043-cost-XXXXXX)"
tar -xzf Stronghold-Protocol-3-server-light-v0.4.3-kazdel-cost-r2-verified-20261011.tar.gz -C "$SP_UPDATE_STAGE"
```

暂停新对局，等待已有对局结束，按原方式停服。确认后执行，工具先备份并打印位置，保留config、storage、.env、自定义SP_STATE_DIR、外部账号/排位文件与后台设置/签名：

```bash
node --env-file="/root/w3/config/server.env" "$SP_UPDATE_STAGE/w3-release/tools/update-project.mjs" --source "$SP_UPDATE_STAGE/w3-release" --target /root/w3 --stopped
cd /root/w3
npm ci
node --env-file="/root/w3/config/server.env" "/root/w3/server/index.js"
```

systemd或PM2使用原服务和配置启动。不要整目录覆盖/root/w3或重建数据库，不删除运行中的WAL。

另一个终端核对（端口以server.env为准）：

```bash
curl -fsS http://127.0.0.1:3000/healthz
```

核对原账号、权限、赛季、成绩、历史、后台公开设置保持，版本仍0.4.3。客户端关闭重开，进入卡兹戴尔战斗检查魂火卡与Cost、策略栏和商店不重叠。兼容联机客户端不需重装，资源版本未变；离线APK不重建，不自动部署。
