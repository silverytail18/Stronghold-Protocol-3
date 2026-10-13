# 0.4.2服务器更新与保留数据

本次使用最终包：`Stronghold-Protocol-3-server-light-v0.4.2-rhodes-balance-verified-20261010.tar.gz`，以及同名`.sha256`与`.manifest.json`，位于项目外`release-packages`。已先交candidate2再完成486项检查与六条固定成长路线验证；最终包替代早期候选。本次实施罗德岛整数休整成长、炮火攻击力系数削弱及协同屏障完整删除，保留此前技能修复及卡兹戴尔内容。

需要Node.js22.16或更新。将最终包及`.sha256`上传`/root/updates`，在同一SSH终端执行：

```bash
mkdir -p /root/updates
cd /root/updates
sha256sum -c Stronghold-Protocol-3-server-light-v0.4.2-rhodes-balance-verified-20261010.tar.gz.sha256
SP_UPDATE_STAGE="$(mktemp -d /root/w3-update-042-XXXXXX)"
tar -xzf Stronghold-Protocol-3-server-light-v0.4.2-rhodes-balance-verified-20261010.tar.gz -C "$SP_UPDATE_STAGE"
```

暂停新对局，等待已有对局结束，按原前台／systemd／PM2方式停服。确认停服后：

```bash
node --env-file="/root/w3/config/server.env" "$SP_UPDATE_STAGE/w3-release/tools/update-project.mjs" --source "$SP_UPDATE_STAGE/w3-release" --target /root/w3 --stopped
cd /root/w3
npm ci
node --env-file="/root/w3/config/server.env" "/root/w3/server/index.js"
```

工具先备份并打印位置，保留config/、storage/、.env*、SP_STATE_DIR及外部账号／排位文件、后台公开／领取设置和签名。不要替换整个/root/w3，不重建账号或数据库，不删除正在运行的WAL。systemd／PM2部署继续使用原服务、原配置；最后一行是用户提供的前台命令。

在另一个终端核对（端口以server.env为准）：

```bash
curl -fsS http://127.0.0.1:3000/healthz
```

检查版本0.4.2、原账号／权限／赛季／成绩／历史及后台开关。罗德岛要求能力20，岁与企鹅仍18，卡兹戴尔单包仍17；旧代码页不能创建或恢复已修订包对局，需关闭再打开客户端加载当前代码。兼容轻量App无需重装壳，相对0.4.0固定资源版本不变；如果此前还未更新到0.4.0，仍须先在局外完成已有卡兹戴尔资源更新。独立安卓单机APK不重建，不自动部署云端。

局内核对：启用罗德岛时凯尔希S2技力足够、操作冷却结束、无沉默且技能范围内有敌人，即使友方满血也能启动并攻击；启用岁与企鹅时克莱门莎停止漩涡可伤害范围内飞行目标，强化普通攻击和移动放逐仓仍限地面。未选包保持原规则；核对罗德岛休整基础0／2／7、职业额外1／2／4，炮火供给上限50%／100%，协同屏障及承压／接力成长已删除，角色与有效炮击成长保持。
