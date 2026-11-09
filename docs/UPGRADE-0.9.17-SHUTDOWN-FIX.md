# 0.9.17 停服收尾修复与简化更新

本次只更新服务器，继续使用0.9.16完整-r2 Android/Windows客户端。资源39311条、固定hash、最低build45和原签名均不变。包含0.9.16-r2此前的全部修复，交易员仍为重构前原界面及原文字。

按用户最新要求：正常停服时删除没有最终结果的未完成对局，不再保留一条进行中的履历。排位关联成员、锁和该局退出冷却随未完成对局一并清除；已经完成的历史、积分、账号、皮肤和统计不会因此清空。已有可靠结果和待结算结果优先写入，写入失败的条目不当作未完成删除，并报告停服错误。

SIGINT/Ctrl+C和SIGTERM都使用此收尾。重复信号不会在处理中再次走默认退出；停服开始后拒绝新HTTP写入、新WebSocket与游戏操作，防止收尾期间新开局。正常收尾完成才打印“服务器已停止，未完成对局记录已清除”。强制kill -9、断电和进程崩溃不能执行正常退出回调。

## 简化更新：不运行检查或备份命令

先在旧开服终端按Ctrl+C，等退出并回到命令提示符。把本次服务器包上传到 `/root/updates/`，然后执行：

```bash
cd /root/updates
tar -xzf Stronghold-Protocol-3-server-light-v0.9.17-shutdown-fix-20261103.tar.gz --strip-components=1 -C /root/w3
cd /root/w3
npm ci --omit=dev
node --env-file="/root/w3/config/server.env" tools/clear-unfinished-matches.mjs --stopped
node --env-file="/root/w3/config/server.env" server/product/game-server.js
```

本包是完整服务器源码更新包，归档顶层为Stronghold-Protocol-3。此处解压覆盖部署目录，不调用会自动备份的update-project，不增加inspect/snapshot/verify/sha256sum步骤。包内不含原配置、私有账号数据库、签名、客户端或完整资源，覆盖更新保留这些原文件。

一次性的 `clear-unfinished-matches --stopped` 用于清理旧版退出后遗留的running记录；只在服务器已经停止时执行。它删除没有最终结果的活动记录，保留已完成历史和待结算结果，不创建新账号或新数据库，也不清空历史interrupted记录。若命令报错，先处理报错，不在失败状态继续执行后续命令。

之后日常停服在开服窗口按Ctrl+C，开服继续执行：

```bash
cd /root/w3
node --env-file="/root/w3/config/server.env" server/product/game-server.js
```

只有之前异常强制退出留下活动记录时，才需要在停服状态下再次执行一次清理工具。未完成对局的战斗现场不会恢复，也不生成虚构胜负或成就。

本轮只进行4项轻量停服测试和静态检查，不启动模拟器或长场。测试的退出信号使用子进程内相同SIGTERM/SIGINT处理器触发，不宣称Windows操作系统强杀可优雅退出。未上传或部署，未读取线上实际数据；最终文件和SHA见工作区reports/shutdown-fix-20261103/DELIVERY.txt。
