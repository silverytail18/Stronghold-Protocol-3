> 最新更新：0.4.10卡兹戴尔5.7，包含已完成的罗德岛0.4.8/0.4.9改动。服务器更新包和准确保留数据流程见[SERVER-UPLOAD-0.4.10.md](SERVER-UPLOAD-0.4.10.md)。下文保留历史版本流程。

# 当前0.4.3服务器源码更新

2026-10-11 0.4.3 r2修复魂火卡与真实Cost(.dpbox)重叠；按实际宽度向左避让并观察尺寸变化，保留8像素间距。已先交候选后完成Chrome四尺寸/两种数字宽度检查，4项测试全部通过。游戏参数、批次、能力21、数据与资源保持。最新包及流程见[SERVER-UPLOAD-0.4.3-COST-R2.md](SERVER-UPLOAD-0.4.3-COST-R2.md)。

本轮卡兹戴尔5.2、批次4、能力21，完整流程见[SERVER-UPLOAD-0.4.3.md](SERVER-UPLOAD-0.4.3.md)。罗德岛13、岁与企鹅9、玩家持久数据及固定资源保持。下文保留此前版本记录。

本轮实施罗德岛整数休整成长与炮火供给削弱，保留0.4.1技能修复及卡兹戴尔；准确包名及完整步骤见[SERVER-UPLOAD-0.4.2.md](SERVER-UPLOAD-0.4.2.md)。下文旧包保留为历史记录。

# 0.3.10 服务器源码更新（历史）

最终验证包：Stronghold-Protocol-3-server-light-v0.3.10-verified-20261010.tar.gz；同时交付同名.sha256和.manifest.json，位于项目外release-packages。包含已完成0.3.9雪境向导及本次罗德岛炮火／当前数值修改。已按要求先交候选包再进行游戏验证，295项通过，无失败或跳过；最终包包含准备期面板接入修正，替代此前候选。验证与342场波次结果见RHODES-ARTILLERY-0.3.10.md。

需Node.js22.16或更新版本。将包及.sha256上传/root/updates。在同一SSH终端执行：

```bash
mkdir -p /root/updates
cd /root/updates
sha256sum -c Stronghold-Protocol-3-server-light-v0.3.10-verified-20261010.tar.gz.sha256
SP_UPDATE_STAGE="$(mktemp -d /root/w3-update-0310-XXXXXX)"
tar -xzf Stronghold-Protocol-3-server-light-v0.3.10-verified-20261010.tar.gz -C "$SP_UPDATE_STAGE"
```

先暂停新对局，等待已有对局结束，按原systemd／PM2／前台进程管理方式停止服务器。确认停止后：

```bash
node --env-file="/root/w3/config/server.env" "$SP_UPDATE_STAGE/w3-release/tools/update-project.mjs" --source "$SP_UPDATE_STAGE/w3-release" --target /root/w3 --stopped
cd /root/w3
npm ci
node --env-file="/root/w3/config/server.env" "/root/w3/server/index.js"
```

更新工具先备份并打印备份路径，保留config、storage、SP_STATE_DIR自定义目录、有效外部账号与成绩文件、后台公开／领取开关、.env和签名。不要以整目录替换部署目录，不重建账号／数据库，不删除运行中WAL。已有服务使用原管理方式、原环境恢复启动，上述命令对应用户提供的原前台启动方式。

```bash
curl -fsS http://127.0.0.1:3000/healthz
```

端口沿用server.env；非3000时使用实际端口。核对app版本0.3.10、旧账号和成绩、后台设置；未选测试包保持正式局，启用罗德岛后6人4秒／0.8格、9人2.5秒／1.2格，预告0.5／0.4秒，当前效果直接显示数值；岁与企鹅的雪境向导及互斥禁用测试保持。

兼容安卓／Windows轻量客户端退出重开加载新代码即可，罗德岛要求客户端兼容标记16，岁与企鹅15。无需重装壳或重复下载固定素材，固定资源版本保持；独立安卓单机APK本轮不重建。未自动云端部署。

