# 0.4.5 卡兹戴尔5.4服务器更新

本轮版本0.4.5，内容kazdel-test-6、客户端能力23。只更新源码和现有联机轻量客户端所读取的代码；不自动部署。保留全部5.3机制、RI13、EXP9、固定素材、安装包、配置与玩家数据。先交候选包和流程，再进行游戏验证；有修复时verified替代candidate。

最终验证包：Stronghold-Protocol-3-server-light-v0.4.5-kazdel-5.4-verified-20261011.tar.gz，以及同名.sha256，位于项目外release-packages。Node.js22.16或更新。

上传两文件到/root/updates，在同一SSH终端执行：

```bash
mkdir -p /root/updates
cd /root/updates
sha256sum -c Stronghold-Protocol-3-server-light-v0.4.5-kazdel-5.4-verified-20261011.tar.gz.sha256
SP_UPDATE_STAGE="$(mktemp -d /root/w3-update-045-XXXXXX)"
tar -xzf Stronghold-Protocol-3-server-light-v0.4.5-kazdel-5.4-verified-20261011.tar.gz -C "$SP_UPDATE_STAGE"
```

暂停新局，等待全部已有对局结束，按原管理方式停服。确认进程停止后，用包内更新工具先备份再更新，不能直接覆盖整个目录：

```bash
node --env-file="/root/w3/config/server.env" "$SP_UPDATE_STAGE/w3-release/tools/update-project.mjs" --source "$SP_UPDATE_STAGE/w3-release" --target /root/w3 --stopped
cd /root/w3
npm ci
node --env-file="/root/w3/config/server.env" "/root/w3/server/index.js"
```

记录工具输出的备份路径。沿用config/server.env及SP_STATE_DIR、SP_AUTH_USERS_FILE、SP_RANKED_FILE，保留config、storage、自定义外部持久文件、账号密码哈希、不可变账号ID、权限、赛季、积分、段位、历史、审计、后台测试开放设置与签名。不要重建默认账号或数据库，不删除运行中的WAL。工具遇到未知格式/路径拒绝覆盖时应保留现场处理，不绕过检查。如原服务使用systemd/PM2，沿用其原环境配置与管理方式启动。

另开SSH终端（端口遵循原server.env）：

```bash
curl -fsS http://127.0.0.1:3000/healthz
```

核对app为0.4.5，原账号/权限/赛季/积分/记录/公开设置仍在。重开兼容安卓/Windows联机轻量客户端加载能力23，无需重装，固定资源版本未改变，无额外素材下载；独立离线APK本轮不更新。新局启用卡兹戴尔测试内容，确认开战魂火、供火恢复、非技能普攻血卷/剑气、实际伤害、血咒标记与Cost/策略/商店避让。

此前候选包先交付，本文件当前指向包含验证后修复的verified包；请使用最终包替代candidate。验证记录见docs/KAZDEL-0.4.5-QA.md。
