# 0.4.4 卡兹戴尔 5.3 更新流程

本轮版本0.4.4，内容批次kazdel-test-5、客户端能力22。候选包先交付，再进行战斗验证；验证后如有修复，最终verified包替代候选。此次更新不自动部署服务器。

候选文件：Stronghold-Protocol-3-server-light-v0.4.4-kazdel-5.3-candidate-r2-20261011.tar.gz及同名.sha256，位于项目外release-packages。上传这两个文件至/root/updates。Node.js需22.16或更新。

同一SSH终端执行校验、暂存解压：

```bash
mkdir -p /root/updates
cd /root/updates
sha256sum -c Stronghold-Protocol-3-server-light-v0.4.4-kazdel-5.3-candidate-r2-20261011.tar.gz.sha256
SP_UPDATE_STAGE="$(mktemp -d /root/w3-update-044-XXXXXX)"
tar -xzf Stronghold-Protocol-3-server-light-v0.4.4-kazdel-5.3-candidate-r2-20261011.tar.gz -C "$SP_UPDATE_STAGE"
```

暂停新对局，等待已有对局全部结束，按原服务管理方式停服。确认停服后运行新版保留数据更新工具。工具会先备份并输出备份路径，保留config、storage、.env、SP_STATE_DIR、外部账号/成绩文件、后台开放设置与签名：

```bash
node --env-file="/root/w3/config/server.env" "$SP_UPDATE_STAGE/w3-release/tools/update-project.mjs" --source "$SP_UPDATE_STAGE/w3-release" --target /root/w3 --stopped
cd /root/w3
npm ci
node --env-file="/root/w3/config/server.env" "/root/w3/server/index.js"
```

如使用systemd或PM2，沿用原服务及其环境配置启动。不要整目录覆盖/root/w3，不重建账号/数据库，不删除运行中的WAL文件。更新工具若拒绝未知格式或路径，保留现场处理，不绕过保留数据检查。

另开终端核对，端口以原server.env为准：

```bash
curl -fsS http://127.0.0.1:3000/healthz
```

核对版本0.4.4、原账号/权限/赛季/积分/历史和后台公开设置仍在。卡兹戴尔仍随开局可选测试内容加载，只在启用本包的局内副本生效；其他内容批次RI13与EXP9保持。

安卓与Windows兼容联机轻量客户端无需重装；关闭重开以加载新代码和能力22。固定素材资源版本未改变，无额外素材下载；独立离线APK不更新。新对局确认开战魂火、全图血咒、血卷/剑气、实时魂火卡和Cost/策略/商店的避让效果。

候选包交付时仅完成源码静态检查与保护文件核对；实际战斗和浏览器验收另行记录，不能将旧版本的测试数量作为本轮结果。
