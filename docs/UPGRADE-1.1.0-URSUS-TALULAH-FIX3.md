# 1.1.0 乌萨斯塔露拉与提丰特效修复

服务器更新包：`Stronghold-Protocol-3-server-light-v1.1.0-ursus-talulah-fix3-20261107.tar.gz`。

停服后将更新包上传至 `/root/updates`，在服务器上执行：

```sh
tar -xzf /root/updates/Stronghold-Protocol-3-server-light-v1.1.0-ursus-talulah-fix3-20261107.tar.gz --strip-components=1 -C /root/w3
cd /root/w3
npm ci --omit=dev
node --env-file=config/server.env server/product/game-server.js
```

沿用服务器现有的环境文件、工作目录与进程管理器设置。本更新不修改账号、对局、盟约层数或服务器配置，也不包含 Android 或 Windows 原生客户端。

乌萨斯激活时，塔露拉二技能的隐藏反击特质仍按原条件生效；无攻击来源的生命流失会以最近的存活、可被反击敌人为中心，距离相同时采用战斗敌人列表的先后顺序。提丰 S3 箭雨提示改为绘制在棋盘上方，并会在短时显示后清理。

本次没有上传或部署。包清单、测试范围与 SHA-256 以本地构建产物为准。
