# 0.4.0服务器更新与保留数据

本次使用最终包：`Stronghold-Protocol-3-server-light-v0.4.0-kazdel-verified-20261010.tar.gz`，以及同名`.sha256`、`.manifest.json`，位于项目外`release-packages`。它包含已验证的简化盟约说明与右侧中部实时面板；前期战斗优化仍是文档提案，运行数值保持5.1。

0.4.0接入卡兹戴尔5.1／kazdel-test-3，客户端能力17，保留罗德岛ri-mujica-test-10与岁与企鹅expansion-test-8。新包默认不公开；普通用户需管理员在后台逐项开放后才可选择。固定资源包增加卡兹戴尔独立路径素材，版本发生变化；正式data JSON不修改。

需要Node.js22.16或更新。将最终包与`.sha256`上传`/root/updates`，在同一SSH终端执行：

```bash
mkdir -p /root/updates
cd /root/updates
sha256sum -c Stronghold-Protocol-3-server-light-v0.4.0-kazdel-verified-20261010.tar.gz.sha256
SP_UPDATE_STAGE="$(mktemp -d /root/w3-update-040-XXXXXX)"
tar -xzf Stronghold-Protocol-3-server-light-v0.4.0-kazdel-verified-20261010.tar.gz -C "$SP_UPDATE_STAGE"
```

暂停新对局，等已有对局结束，再按原前台／systemd／PM2方式停止服务器。确认已停服后：

```bash
node --env-file="/root/w3/config/server.env" "$SP_UPDATE_STAGE/w3-release/tools/update-project.mjs" --source "$SP_UPDATE_STAGE/w3-release" --target /root/w3 --stopped
cd /root/w3
npm ci
node --env-file="/root/w3/config/server.env" "/root/w3/server/index.js"
```

更新工具先备份并打印备份位置，保留`config/`、`storage/`、`.env*`、`SP_STATE_DIR`自定义目录、外部账号／排位文件、后台公开／领取开关与签名。不用发布目录替换整个`/root/w3`，不重建账号或数据库，不删除运行中的WAL；已有服务按原进程管理方式、原配置启动。上述最后一行是现有前台启动方式。

```bash
curl -fsS http://127.0.0.1:3000/healthz
```

端口沿用`server.env`，不是3000时替换为实际端口。核对app版本0.4.0、旧账号／权限／赛季／成绩／历史／后台开关，未选包保持原规则。管理员房主可选择卡兹戴尔，普通用户未开放时不可选；验证3／6／9核心、2／4血脉、新陨星、魂火与共享拒死面板，原罗德岛炮火和雪境向导继续正常。

兼容安卓／Windows轻量客户端不需重装壳，退出后重新打开，从服务器加载新代码并在新局前完成固定资源增量更新；已有正确素材按内容哈希复用。若资源更新失败先重试，不能局内补下载。独立安卓单机APK本轮不重建，不包含本次内容。未自动部署云端。
