# 1.1.0 乌萨斯塔露拉特质更新

服务器更新包：`Stronghold-Protocol-3-server-light-v1.1.0-ursus-talulah-20261107.tar.gz`。

停服后将更新包上传至 `/root/updates`，在服务器上执行：

```sh
tar -xzf /root/updates/Stronghold-Protocol-3-server-light-v1.1.0-ursus-talulah-20261107.tar.gz --strip-components=1 -C /root/w3
cd /root/w3
npm ci --omit=dev
node --env-file=config/server.env server/product/game-server.js
```

如当前服务器使用其他环境文件、工作目录或进程管理器，沿用原启动方式。此更新不修改账号、对局、盟约层数或服务器配置；未包含 Android 或 Windows 原生客户端。重开服务器后刷新浏览器页面即可加载新的塔露拉信息面板。

乌萨斯盟约激活时，塔露拉的专属终端特质才显示并生效。首次触发二技能后进入持续至退场的架势；此后每次命中、持续伤害跳数及生命流失都会按二技能完整效果反击。无来源生命流失时以塔露拉自身为反击中心，反击可命中空中与隐匿敌人。

本次没有上传或部署。测试范围、包清单与最终 SHA-256 见工作区 `reports/ursus-talulah-counter-20261107/DELIVERY.txt` 及 `RELEASE.json`。
