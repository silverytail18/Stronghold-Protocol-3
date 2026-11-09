# 炸惊模拟接入与后续上游更新

2026-11-08，本地源码接入；未构建服务器更新包、客户端或签名资源包，未部署。

## 固定来源

参考仓库：https://github.com/Emiraen/Stronghold-Protocol_Emi ，固定提交 `ac00de2ead13a3fe6511a6e1eb3fb7c707dc2e16`。本地只读参考为工作区 `reports/emi-reference-review-20261105/emi/`。来源路径及导入时SHA记录在 `reports/zhajing-integration-20261108/REFERENCE.json`，许可证与来源声明保留在独立engine目录。

本项目主仓库、Emi分支与官方游戏资源是三个不同来源。主仓库升级不等于炸惊规则升级，展示资产同步也不等于规则升级。

## 数据与引擎边界

- `server/modes/zhajing/engine/`：冻结的参考引擎，独立模块路径与data singleton。主项目 `server/sim/` 不被覆盖。
- `data/zhajing/`：独立棋子、盟约、装备、策略、配置、敌人和惊变数据。普通 `data/*.json` 不引入炸惊棋子或规则。
- `server/modes/zhajing/Match.js`：产品适配器。负责模式ID、固定难度、协议封装、皮肤键转换与本地适配。
- `public/js/battle/zhajingSim.js`：客户端加载独立模拟器及冻结模式数据；普通runner继续使用普通模拟器。两者各自订阅对应模式的消息。
- `shared/zhajing-bonds.js`、`shared/zhajing-forge.js`、`shared/zhajing-equipment.js`：纯数据／计算／展示辅助。盟约合并与锻造定义分别来自参考纯模块，更新时须与engine对应定义同步。

不要运行主项目build-data来覆盖`data/zhajing`；不要把当前项目的测试包、普通自选记录或普通战斗扩展混进炸惊规则。

## 产品入口与接口

模式ID为`entertainment_zhajing`，固定难度`ZHAJING`；房间选1–4人，单人按solo、多人按coop。禁排位、测试包、其他规则版本；可由已有玩法开放后台关闭。关闭后阻断创建、未开局玩家加入和开始新局，运行中对局与原成员重连沿既有政策保留。

`g.zhajing {intent}`仅为外围封装：适配器先检查允许的操作类型；聊天和表情用主产品协议及产品表情目录，其他操作用参考协议校验内部消息。普通房间拒绝这一封装。战斗`b.*`继续由现有客户端结算通道传递，不将模拟结果包装为g消息。

静态JS仅公开`/zhajing/server/sim/`、`/zhajing/shared/`和浏览器data shim；不公开服务器match、Node专用数据加载模块或私人状态。buildTag纳入独立模拟器／shared源码，修改后旧页面能检测到构建变化。

本轮没有接入跨服务器重启恢复存档。适配器的规则快照辅助方法不等于完整持久化功能，不得在界面或升级说明中承诺重启后续局。

## 外围合并点

|范围|主要文件与用途|
|---|---|
|注册／房间／权限|shared/product-modes.js、shared/protocol.js、server/lobby.js、server/product/content-policy.js|
|模块服务与更新标识|server/http/static.js、server/http/buildTag.js|
|数据选择|public/js/data.js：按room／spectator／match选择数据源；模式数据读取时合并盟约覆盖值|
|大厅与房间|ui/zhajingCreate.js、screens/room.js、已有玩法大厅注册表|
|正式局内入口|**public/js/screens/game.js内置MatchScreen**；不能只改拆分的screens/game/match.js|
|操作与选择|ui/gameActions.js、ui/zhajingGameplay.js、ui/zhajingDraft.js、ui/shopBar.js|
|模拟|battle/runner.js、battle/zhajingSim.js|
|20格与装备|render/app.js、render/drag.js、ui/fallbackField.js、ui/gameLogic/placement.js、ui/equipReplace.js|
|显示|public/css/screens/zhajing.css、public/index.html、ui/gameComponents.js|

更新时先查看真实入口及完整调用链，避免修改一个未被正式入口引用的同名拆分组件。UI测试必须包含实际点击命中，不能仅用DOM值修改或网络消息代替所有交互。

## 本地适配与参考缺口修正

1. 固定为产品支持的1–4真人；没有移植参考最多100座的全局房间改造。
2. 数据皮肤格式按当前账号的`char:<charId>`投影；不更改账号保存格式。
3. 独立引擎`simPool:null`，避免把专用spec交给主引擎的机器人预演池。
4. 参考隐秘核心白名单漏`ZHAJING`，在适配器构造冻结模式数据时补上，保留原层数与生命门槛。
5. 参考构造器临时区为4格、economy和不变量为5格，适配器统一成5格；UI第6坐标仅预留。
6. 参考配置`enemyResMul`已改为`add:20/cap:70`，引擎仍只读旧`mul/upTo`，导致新参数静默不生效。独立engine的`match/gamedata.js`透传resAdd/resCap，`sim/battle/spawns.js`应用加法与上限；客户端和服务器共用这两个模块。保留旧乘法路径，未设置新字段时行为不变。
7. 界面数据读取合并`zj`盟约覆盖，避免展示旧档位／说明；普通数据源不合并。
8. 惊变与工具弹窗独立挂到body，避免商店缩放坐标影响；点击区域显式启用指针事件，确认栏与倒计时适配手机。
9. 没有被任何入口引用的参考loadout导出不导入公共协议；forge纯模块补安全属性读取以通过项目类型检查。
10. 参考未提交完整专用图标，本地补SVG示意；四位P3角色从已有本机官方资源只读提取所需模型与图片。
11. 产品通信由适配器补齐`g.chat`、产品表情目录及`m.chatHistory`重连历史；仍经过参考handle的身份、旁观与阶段检查。聊天沿主产品200字、2秒冷却、50条历史。参考协议补已有路由的`g.spWant`，以及潜能检测所用的`hasPotentialData`导入；补路由不代表新增了“我想要”界面。
12. 当前仅一小队，全部漏怪且无人可联防时直接结算，不发布参考百人跨小队接力所需的空`UNITE`。有完美队友的实际联防保持。适配器结算记录`roundOutcome={round,losses}`实际生命差，正式MatchScreen优先用它显示扣血、播放结果音效；不能用本地漏怪峰值覆盖权威扣血。
13. 模式runner的统计设置须同步普通与炸惊实例，包含离开模式后关闭统计，不能只通知当时活动实例。顶部把战斗时钟标为“作战时限”，本阵地完成后显示0与“本阵地已结束”；有时限的SETTLE标为“结算倒计时”。清空敌人且没有待出怪等阻止结束的任务时可提前结束；单人非战斗阶段沿参考不显示倒计时。
14. 参考pieceView漏发skin，备战与battleInput展示不一致；统一从skinOfPiece读取。已部署、晚绑定与动态召唤物继承实际召唤者皮肤，snapshot带ownerCharId，避免只凭token名称误选主人；同时补ammoSkill，避免弹药技能被主渲染器误加持续技能光环。这些均是展示元数据，不改数值和账号保存格式。
15. 祥子音符由独立引擎`mujicaNote`的来源、noteId、位置、projectile、state驱动主渲染器ProductFx，每颗一个原始粒子根，物理／法术用各自原始资源；移动不重复spawn，hit播放原始命中，end／超时／切场清理。普攻标记`product-note`，禁止普通弹道重复绘制；预热全部音符形态。原始资源关闭／不可用时由MujicaNoteSystem画简化音符，原始层接管即移除同ID后备。`mujicaFever`仅为团队状态，不在默认(0,0)绘制粒子。

更新参考engine时，逐项检查这些适配能否删除、需重放或已被来源实现，不能直接整目录覆盖后宣称兼容。更新主仓库renderer时还需核对上述事件、投影坐标、特效开关、接管与生命周期；主仓库与独立引擎的同名fx事件不能默认互通。

本轮运行问题修复证据见工作区`reports/zhajing-runtime-fixes-20261108/DELIVERY.txt`与`AUDIT.md`。只修源码，未重构建任何发布包。

## 展示资源维护

运行`node tools/update-zhajing-presentation.mjs`将当前安装的assets、local-assets、local-fx、skins与`data/zhajing/presentation-extra.json`合并到模式展示索引。脚本只更新展示数据，不覆盖棋子、装备、盟约等规则表。

新增素材的完整路径、大小、SHA见外层报告；当前审计的40373条展示路径均有本地文件。四位P3角色共38个新增图片／前后Spine文件，模型前后共8份在真实Chrome/Pixi加载解码。部分新图标是示意，并非参考或官方原图。可选地图tiles.json在当前安装中不存在，现有渲染器按既有后备材质工作；其404不属于本轮新增素材缺失。

旧原生客户端尚未携带这批新增资源。用户明确要求本轮不构建包，因此没有签名资源差量、完整客户端或服务器更新包。后续获得构建授权时再沿现有资源签名与资源清单流程分发，不能只发服务器JS就宣称旧客户端拥有新增模型。

## 主仓库更新步骤

1. 更新前记录主仓库基线、Emi固定提交与本地适配清单；保留用户其他未提交工作。
2. 正常合并主仓库后，逐项检查上表外围hook：模式判定、协议新字段、房间权限、页面实际入口、数据订阅、renderer坐标与runner生命周期。
3. 独立engine保持当前固定快照。若主仓库修了通用模拟bug，评估是否需要单独移入炸惊，记录来源与测试；不要用主模拟器直接替换它。
4. 如需跟进Emi规则，先对旧／新参考快照逐文件与数据对照，再将明确属于炸惊的更新放入独立engine和独立data；复核本地15项适配。
5. 主仓库资源更新后运行展示脚本，重新检查所有索引路径；准备新签名分发时再更新资源产物，不在源码接入阶段生成包。
6. 串行执行下列定向验证，只有新失败或新改动需要时才扩大检查。

```powershell
node --test --test-concurrency=1 test/product/zhajing-integration.test.js test/product/gameplay-modes.test.js test/cyclops-core.test.js test/match/cyclops-rules-waves.test.js test/zhajing-jibian-effects.test.js test/zhajing-makoto.test.js test/zhajing-bond-members.test.js
node --test --test-concurrency=1 test/product/zhajing-runtime.test.js test/product-content/fx-signals.test.js test/match/runner.test.js test/match/runner-pending.test.js test/render/skin-presentation.test.js test/ui/fieldHost-skins.test.js test/ui/token-skin-gate.test.js
$env:SP_E2E='1'
$env:SP_ZHAJING_REPORT='../reports/zhajing-integration-20261108/browser'
node --test --test-concurrency=1 test/ui/zhajing-live.e2e.test.js
npm run typecheck
node tools/check-imports.mjs
```

浏览器夹具使用临时账号与资源桥，HTTP／WebSocket为真实产品服务；简报确认和策略选择目前通过真实WS操作，惊变刷新、选卡、确认及工具弹窗使用实际鼠标点击。短战斗结束用受控timeout事件驱动真实runner生成并提交结果，不能把它写成自然通关。包含1440×900、667×375和390×844三尺寸，不等同原生实机验收。

运行问题回归另含实际聊天输入／发送、表情点击、重连历史、备战皮肤与真实独立模拟皮肤、实际伤害统计面板；祥子S3由真实独立模拟器生成信号，在Chrome/Pixi中受控送入原始／后备显示层，核对四根物法音符、位置更新不重生、结束与clear。结果框与空联防另用隔离Match受控漏怪状态通过真实WS验证，不等于自然完整局或所有技能组合验收。

完整玩法与新增内容见[原版差异总览](ZHAJING-VS-VANILLA.md)。
