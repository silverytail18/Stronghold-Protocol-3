# 0.4.10卡兹戴尔5.7服务器更新流程

版本0.4.10，卡兹戴尔kazdel-test-9、客户端能力28；罗德岛ri-mujica-test-15、岁与企鹅expansion-test-9。已完成相关Node、Chrome及正式波次检查，不自动部署。

更新包：`Stronghold-Protocol-3-server-light-v0.4.10-kazdel-5.7-verified-20261011.tar.gz`及同名`.sha256`，在项目外`release-packages/`。另有`.manifest.json`公开文件逐项哈希清单。包含完整服务器源码、客户端代码、固定资源及原兼容轻量安装包；不含本机账号、数据库、配置、签名或离线完整安装包。

本流程沿用现有部署目录`/root/w3`和`/root/w3/config/server.env`。Node.js须22.16.0或更新。先上传压缩包和SHA文件到`/root/updates`，在同一SSH终端执行：

```bash
set -e
mkdir -p /root/updates
cd /root/updates
node --version
sha256sum -c Stronghold-Protocol-3-server-light-v0.4.10-kazdel-5.7-verified-20261011.tar.gz.sha256
SP_UPDATE_STAGE="$(mktemp -d /root/w3-update-0410-XXXXXX)"
tar -xzf Stronghold-Protocol-3-server-light-v0.4.10-kazdel-5.7-verified-20261011.tar.gz -C "$SP_UPDATE_STAGE"
```

暂停新局，等待已有对局结束，再按目前的进程管理方式停止服务。前台运行的服务在原终端Ctrl+C；systemd/PM2部署用原有服务名停止。确认服务器进程已停止后，在上述SSH终端继续：

```bash
node --env-file="/root/w3/config/server.env" "$SP_UPDATE_STAGE/w3-release/tools/update-project.mjs" --source "$SP_UPDATE_STAGE/w3-release" --target /root/w3 --stopped
cd /root/w3
npm ci
node --env-file="/root/w3/config/server.env" "/root/w3/server/index.js"
```

如果原来由systemd或PM2管理，最后一步使用其原有启动命令和环境，不额外启动第二个进程。更新工具先备份私有配置和持久化状态，再复制公开源码；它保留`config`、`storage`、`.env`、账号密码与ID、权限、赛季、积分、历史记录、审计、后台测试开放设置、自定义持久化路径与签名。记录输出的`.backups/时间戳`路径。该备份主要用于持久数据恢复，不能当作完整旧源码回滚包。

源码回退需要保留的旧版服务器压缩包：停服后解压旧包至另一个暂存目录，以其中`tools/update-project.mjs --source 旧源码目录 --target /root/w3 --stopped`复制回旧源码，再运行`npm ci`并按原方式启动。本轮未改数据库结构；不要直接拿旧数据库覆盖更新之后已有的新对局记录。

另开终端检查服务（端口改为原配置里的实际端口）：

```bash
curl -fsS http://127.0.0.1:3000/healthz
cd /root/w3
node -p "require('./package.json').version"
```

核对版本0.4.10、原账号/权限/赛季/积分/记录及测试开放设置。完全关闭再打开现有安卓/Windows联机轻量客户端，使其加载能力28代码；无需重装，固定资源版本保持。独立离线APK本次未更新。

新局启用卡兹戴尔，检查：特质栏的专属条件与固定效果、三人全体近战+1挡、开战魂火、持续供火、血卷2秒个人冷却、剑气1秒个人冷却且1秒飞5格、血咒实际伤害及标记、魂火卡与Cost避让。未启用本包时保持原内容。普通用户能否选择本包继续受原后台开放设置控制。

完整机制见[KAZDEL-0.4.10.md](KAZDEL-0.4.10.md)，测试与局限见[KAZDEL-0.4.10-QA.md](KAZDEL-0.4.10-QA.md)。
