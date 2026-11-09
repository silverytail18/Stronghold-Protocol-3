# 舟铲铲模块接入与后续更新

本说明对应 1.1.1 fix9。模式规则参考 Emiraen/Stronghold-Protocol_Emi 的提交 `ac00de2ead13a3fe6511a6e1eb3fb7c707dc2e16`，同时适配当前项目的独立工作进程、内容包和正式游戏页。21 回合随机表修复是当前接入层的补充；参考仓库自身仍沿用 15 回合生成上限。

## 模块职责与必要挂点

| 模块 | 职责与更新时必须保留的接口 |
| --- | --- |
| `shared/cyclops.js`、`data/cyclops*.json` | 模式身份、固定分组、馈赠卡面与 21 回合规则；不能被上游数据生成工具覆盖删除。 |
| `data/cyclops-balance.json`、`server/match/cyclopsBalance.js` | 完整独立四难度曲线、首领/部件倍率与频次保护，按局冻结revision/hash，不动态叠上游倍率；见 `CYCLOPS-BALANCE-STAGE1.md`。 |
| `server/match/cyclops.js` | 馈赠领取、经济、征召、主动赌徒、私有状态。规则保留在模式模块中，共用流程只调用入口。 |
| `server/match/cyclopsPools.js` | 开局每组至多四人固定共用干员池。淘汰仅筛选幸存成员，不改变玩家组与库存归属。 |
| `Match.js`、`PlayerState.js`、`match/setupVote.js` | 初始化及重摇建立分池；`PlayerState.pool` 为本人池，普通模式回退单池。重摇完成准备后再替换池，舟铲铲不恢复禁抽。 |
| `player/diy.js`、`player/acquire.js`、`player/economy.js`、`choices.js`、`effectsMeta.js`、`match/spDraft.js` | 购买、刷新、奖励、晋升、出售、馈赠与特质抽卡均通过本人池；新增抽卡入口也必须遵守。自选仍是个人池，装备仍用全局装备池。 |
| `player/round.js`、`match/settle.js` | 利息读基础收入前存款；运营仅真实战斗结束结算一次；重复与 synthetic 结果不再次发放。 |
| `waves.js` | 仅 `gd.isCyclops` 扩展随机表到 `gd.lastRound`。保留普通模式原随机调用顺序、15 回合算法及原作出怪参数。 |
| `match/phases.js`、`match/intents.js`、`player/views.js` | 接阶段/请求/本人私有推送。主动操作只在本人可编辑休整阶段执行；重连不能重置轮次或整局次数。 |
| `server/sim/content/cyclops.js`、`support/index.js` | 馈赠战斗模块依赖 `isolateContentCallback`。隔离回调通过 `_handlerError` 报错并继续后续内容，不能增加事件嵌套深度。 |
| `public/js/ui/cyclopsOverlays.js`、`cyclopsChoiceTimer.js`、`cyclopsRiskControl.js` | 共享窗口、校时倒计时与主动操作确认。赌徒窗口挂载到 body，避免缩放商店裁切和点击层问题；卸载时清理。 |
| `public/js/screens/game.js`、`screens/game/match.js`、`ui/shopBar.js` | 两个游戏页共用组件；正式产品入口实际走 `game.js` 内置 MatchScreen，不能只改拆分页面。 |

## 规则约束

分池以开局座位顺序固定：1–4 人一池，5–8 人分为 `[4, n-4]`。各组使用现有四人合作池容量；淘汰或重连不迁池。`m.pool` 保留第一组池供旧接口兼容，新增与玩家相关的取还操作应使用 `ps.pool`，不能依赖此兼容别名。库存审计和托管也按组检查。

利息上限取 `max(5 + 所有 capBonus 之和, 所有绝对 interestCap)`，银阶为 6、金阶为 8、彩阶为 10；银加金为 8。百分比存款收益以同批结算前存款计算，不被同批运营奖励抬高。商店升级开启新空槽，免费三选一仍由干员合成晋升触发。

主动赌徒由服务端验证并记录已用标记，再执行副作用。客户端仅展示本人状态及代价，选择后确认才发送。金阶移除自己的干员并返装备、返本组副本；彩阶严格要求剩余生命大于代价。新接口沿用既有请求和工作进程协议，无需改客户端 contract/epoch。

## 合并主仓库更新时的核对顺序

1. 先合并普通模式改动，检查上述少量共用挂点；不要用整份 Emi 共用文件覆盖当前项目。
2. 保留模式身份经内容包快照、独立 Match worker、IPC 与 WS 的传递。开放管理与玩法大厅继续沿用独立产品模块，详见 `PRODUCT-GAMEPLAY-HALL.md`。
3. 若新加商店、赠礼、跨玩家转交或晋升入口，检查抽取与返还均使用正确池。跨组赠送必须先返源池，再按接收者池的获取规则处理。
4. 跑 `test/match/cyclops-rules-waves.test.js`，检查完整 21 槽、分池、利息、升级与赌徒；跑 `test/content/cyclops-install.test.js` 检查 48 条馈赠安装与回调隔离。
5. 跑普通模式 pool/economy/waves/setup-reroll/diy-shop 相关定向测试。正式页验证必须从 index→boot→main→GameScreen 进入，并覆盖 WS 私有推送、手机窗口与重连；不能仅对独立组件截图。

本次未改数据库 schema、资源包或原生签名。修改后的随机表与分池应新开局使用。验证记录在工作区 `reports/cyclops-rules-waves-20261108/`；短帧安装验证不代表全部技能与内容包组合、原生端完整实战均已验收。


## 平衡与准备提示的更新挂点（fix9）

1. 数据装载器的默认必需表包含 `cyclops-balance`，历史官方版本必需表排除它；内容集合自动将新增JSON纳入哈希并传到worker。浏览器依赖BattleSpec内的最终mods，不自行再算曲线。
2. GameData创建时克隆冻结配置。首领正式开战、机器人与审计的finalAssault入口在舟铲铲统一调用GameData的共享血池方法；不要恢复两个入口各自运算。
3. 普通/联防/首领战斗flags和公开/结算保存同一revision/hash；静态部件在waves中取bossPartScale，动态刺胄之弹取partEnemyScale。其他模式没有新增这些字段。
4. 共用readyFundsPrompt接收modeId，舟铲铲直接准备。正式game.js与拆分game/match.js都传入公开modeId；普通模式资金提示沿原规则。
5. 合并上游数值时保留本模式已冻结完整表，不自动传播上游曲线改动。先对比变动，决定是否发布新revision；新增敌人/首领机制时核对频次与部件分类，改值后新开局使用。运行cyclops-balance、普通waves/boss-hp与正式页WS/六包worker定向检查。
