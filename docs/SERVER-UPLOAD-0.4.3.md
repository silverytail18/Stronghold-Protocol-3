# 0.4.3 服务器更新流程

最终验收包：Stronghold-Protocol-3-server-light-v0.4.3-kazdel-verified-20261011.tar.gz。配套同名.sha256和.manifest.json，项目外release-packages提供。已按用户要求先交candidate包和流程，再完成1887项功能与兼容检查、108场前期和549场正式波次、48个压力样本、9局真实经济前五回合及105份保留文件核对。最终verified包替代候选。需要Node.js 22.16或更新，不自动部署。

上传包和.sha256至/root/updates，在同一个SSH终端执行：

```bash
mkdir -p /root/updates
cd /root/updates
sha256sum -c Stronghold-Protocol-3-server-light-v0.4.3-kazdel-verified-20261011.tar.gz.sha256
SP_UPDATE_STAGE="$(mktemp -d /root/w3-update-043-XXXXXX)"
tar -xzf Stronghold-Protocol-3-server-light-v0.4.3-kazdel-verified-20261011.tar.gz -C "$SP_UPDATE_STAGE"
```

暂停新对局，等待现有对局结束，按现有前台、systemd或PM2方式停服。确认停服后执行：

```bash
node --env-file="/root/w3/config/server.env" "$SP_UPDATE_STAGE/w3-release/tools/update-project.mjs" --source "$SP_UPDATE_STAGE/w3-release" --target /root/w3 --stopped
cd /root/w3
npm ci
node --env-file="/root/w3/config/server.env" "/root/w3/server/index.js"
```

更新工具先备份并打印备份位置，再更新公开源码；保留config、storage、.env配置、SP_STATE_DIR与外部账号/排位文件、后台公开设置及签名。不要整目录覆盖/root/w3，不重建数据库，不删除正在运行的WAL。若用systemd或PM2则依赖安装后通过原服务、原配置启动，最后一行为当前前台启动命令。

另一个终端执行（实际端口以server.env为准）：

```bash
curl -fsS http://127.0.0.1:3000/healthz
```

核对0.4.3、账号/权限/赛季/积分/历史与后台原开关。卡兹戴尔要求能力21，罗德岛单包仍20，岁与企鹅单包仍18；普通用户仍通过后台公开设置启用测试包。检查特蕾西娅不再首轮送芙蓉，第3/5回合招募及锁定等级；检查血咒每5秒、魂火预留和面板避让。

兼容联机轻量App无需重装，关闭重开加载新代码。相对0.4.0固定资源版本未变，不强制重新下载完整资源；尚未装过0.4.0资源者先在局外完成既有卡兹戴尔资源更新。独立安卓单机APK保持旧版。
