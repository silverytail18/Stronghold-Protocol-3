# 0.9.22 非官方对局等级与局内文字聊天

改变玩法的插件/测试包对局现在按50%卫戍认证计入等级，向下取整（425→212）；已保存历史记录也按此规则计算，不改原始奖励记录。每日防卫目标的进度同样按50%累计，达标奖励仍按原规则每天一次。测试模式和未结算退出不计入。此改动针对卫戍认证等级，不改变赛季排位积分或奖杯规则；统计页面的“含插件对局”筛选也不会关闭等级累计。

游戏内左下方新增“聊天”，保留原有表情按钮和表情气泡。文字最多200字，2秒发送间隔，最近50条仅保存在当前对局内存中；重连恢复本局历史。Enter发送，Shift+Enter换行，Escape关闭，中文输入法确认不会误发。消息按纯文本显示，服务器从当前座位确认发送者，其他房间和观众不能伪造发送。聊天历史不写入账号或数据库。

资源、签名、客户端准入不变，复用现有Windows build45及安卓横屏版build46，无需重新安装客户端。

在原开服终端Ctrl+C，等待退出。上传新包到 `/root/updates`，逐行成功后继续：

```bash
cd /root/updates
tar -xzf Stronghold-Protocol-3-server-light-v0.9.22-level-chat-20261103.tar.gz --strip-components=1 -C /root/w3
cd /root/w3
npm ci --omit=dev
node --env-file="/root/w3/config/server.env" tools/clear-unfinished-matches.mjs --stopped
node --env-file="/root/w3/config/server.env" server/product/game-server.js
```

最后一行保持运行。更新不含真实配置/账号/数据库/存档，覆盖保留原服数据；停服清理仅删除无最终结果的未完成对局。按用户要求不增加检查、备份或update-project。更新后所有客户端完全退出再打开。

验证限于轻量等级/聊天定向、单浏览器桌面与手机横屏、静态及归档核验，不运行模拟器、原生客户端、完整战斗、全量Golden或压力测试。最终产物和SHA见工作区 `reports/level-chat-20261103/`。未部署。
