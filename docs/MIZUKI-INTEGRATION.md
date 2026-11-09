# 水月模式维护与上游适配

状态：本地制作候选，未部署。来源锁：Emi ac00de2ead13a3fe6511a6e1eb3fb7c707dc2e16；主仓库参考 f07b8965061bbc311ad7aa815879b09264a1e47d。模式 entertainment_mizuki，1—4 真人 coop，默认关闭，无排位和任意插件/版本选择。

## 模块边界
1.2.0 fix1新增管理员房间/存档/玩家状态控制，满员且全员在线才允许新开或继续探索。控制适配器、进程fencing、事务删除和审计维护边界见 [MIZUKI-ADMIN.md](MIZUKI-ADMIN.md)。管理接口不提供给玩家客户端，满员规则仅作用水月。

server/modes/mizuki 保存 Emi 玩法与规则；server/product/mizuki 接当前账号、持久化、独立进程和操作回执。shared/mizuki-compat.js、rescueCompat.js 处理当前模拟器接口。普通战斗仅新增 equipmentPassiveStatMods 导出，普通/舟铲铲逻辑保留。

public/js/screens/mizuki*.js 与专用 CSS 提供玩法页面。手机复用 ui/device.js、devices.css 和现有 HUD。mizukiSnapshots.js 在 main.js 中合并可靠 m.field、周期 m.public 与 b.snap/b.ev；必须按 fieldId + battleId 隔离，不能让精简帧覆盖地图元数据。

等待房间复用主仓库 `public/js/screens/room.js` 的 `RoomScreen`、`SeatCard`、复制邀请、名片立绘和准备/开始流程；不再使用独立蓝色 `MizukiRoom`。Emi 的水月同样在共享 RoomScreen 上增加模式分支。水月只增加 `public/js/ui/mizukiRoom.js` 的人数、N0–N18 难度控件及继续探索说明。手机房间沿用原版横屏结构，短屏长内容允许上下滚动，竖屏仍显示旋转遮罩。

房主可在等待室随时把人数上限调为 1–4 人；`room.setCapacity` 由水月产品桥校验和广播。扩容保留原席位，缩容不能删除已有成员；实际改变人数后清除其他成员准备状态，选择相同人数不重置准备。非房主只读，已经启动的探索不能通过容量请求改写参与者。恢复房间允许调整，但不得少于仍需归队的原成员数；恢复成功后保存新的 roomCapacity，检查点玩家席位和分场身份仍沿用原记录。详见 [MIZUKI-ROOM.md](MIZUKI-ROOM.md)。

public/js/mizukiNativeApp.js、mizukiNativeDrag.js、mizukiFacingWheel.js 是由当前共享渲染器生成的模式副本。改动源渲染器后运行 node tools/build-mizuki-render.mjs，检查替换锚点与 diff，再跑布阵、视角、首帧和战斗推流回归；不要手工修改生成文件。生成器记录来源 SHA。新增模式动画与资源缓存不替换全局普通模式资源索引。

## 手机显示约束（2026-11-08 用户明确要求）

手机端仅制作和维护横屏界面。保留主仓库的“请将设备横屏”旋转遮罩及原生横屏策略；水月入口、难度选择、房间、探索页面和战斗均不得豁免遮罩，也不得增加手机竖屏玩法布局。

“显示不全时可以上下滚动”指手机横屏下的短高度适配：难度卡片、分队、策略、补给、招募、事件、商店、奖励、结算以及资料/编队弹窗的长内容必须能触屏上下滚动并到达底部操作。航线保留双向平移，战斗画布保留原拖拽和镜头手势，不能用整页滚动覆盖战斗操作。

截图交付以电脑端和手机横屏为准；竖屏截图仅可作为“请横屏”遮罩的验证证据，不作为功能界面示例。上游更新或重生成界面后，须复验手机横屏滚动、竖屏遮罩、转回横屏后原页面与选择状态保持，不能通过隐藏遮罩解决布局问题。

## 存档、经济与恢复
分队页的触屏紧凑布局与桌面原比例布局共用 `squadSelectionStatus`，以服务器公开的 `squadVotes` 显示提交回执、已确认人数及等待名单。卡片 focus 仅为本机预览，不当成已保存投票；确认当前已提交选项时禁止重复发送，改选其他卡片可重新提交。桌面原比例分队页也必须显示服务端拒绝提示，不能因提前 return 丢掉错误。手机紧凑布局的左上角退出入口必须保留并调用 `requestMizukiExit`，共用项目退出弹窗；短屏滚动时顶部保持可达。后续上游适配必须以独立账号实际触屏确认、改选、刷新恢复和全员进入策略为回归，不能只测试默认分队或直接调用网络接口。

独立 mizuki.sqlite schema1；以 accountId 绑定参与者，昵称和设备 token 不充当存档身份。检查点、银行、操作 opId 账本与结果原子提交。父进程 durable ACK 后向客户端发送新状态；epoch 隔离旧 worker。普通/版本/水月进程共用容量计数，复用现有 worker 不新增占用。

战斗恢复从原 PREP 状态重建并重放已记录干预，保留 seed、context、tick 和骰点。不是精确时间快照。干预日志上限 512。retention 使用 SQLite backup 处理 WAL，恢复校验账号、摘要和数据库关系。

compatibility.js 的 rulesHash 覆盖水月规则、server/sim、server/match、shared 和 data。更新前完成或停留原环境处理已有探索；不自动迁移未知规则存档，不绕过哈希强开。UI 改动本身不应修改规则；保守哈希可能因 shared 的展示变动拒绝旧档，需人工审计后再设计显式迁移。

## 更新上游
1. 记录主仓库和 Emi 的新 commit，独立比较玩法、消息协议、模拟器接口、renderer 与手机 CSS。房间先合并共享 RoomScreen/SeatCard，再核对水月模式分支，不复制一套独立等待室。
2. 更新源码来源清单，先处理 pairPlayers、support、技能/装备等接口差异；不要整包覆盖当前产品目录。
3. 重生成 renderer 副本并审计静态 import；重点检查 m.field / b.snap / b.ev、阶段私有作用域、召唤物和设施。
4. 执行规则、结局、事件经济、自动布阵、库存/结算幂等、恢复、retention 与普通/舟铲铲回归。
5. 单浏览器复验桌面、手机横屏和竖屏旋转遮罩；手机竖屏只检查遮罩生效，不设计或验收竖屏玩法页面。新资源另建签名目标，保留旧清单与已发包。
6. 先完成旧规则探索，再切新规则。默认关闭，完成原生和完整长局验收后管理员再开放。

## 资源与来源
191 个源文件导入记录位于外层 reports/mizuki-implementation-20261108/IMPORTED.json。素材来自 Emi 已提交资源和本机 D:\yj\Arknights 的官方客户端，提取脚本及证据留在同一报告目录。源代码按仓库 GPL-3.0-or-later 保留许可；游戏素材权益属于原权利人，不因源码许可获得额外授权。

运行素材原候选 5945 文件，旧签名 target 7640ab97420ad9294034f6c7216cf110ecf730e0bf15ba54b096aefddffc2b16。地图修复后 target 为 27b94d5bb4f95f6aaf6e00ac5433076b9b33868e64d4948810a72fd5d8c9930b，需合并原资源包与地图修复补充包，见 [MIZUKI-MAP-UI-FIX1.md](MIZUKI-MAP-UI-FIX1.md)。覆盖现有 ce9999… 与 3e3336… 两个资源基线。原公钥、包名、客户端 line1.0/build48/contract2/epoch1 保留，不含新 APK/Windows 完整包。

runtimeFeatures 中 board/themes/reflections/cameras 为 false：目前不具备这些可选的原生专用元数据。地图使用已提交的 scene/textures，允许普通战场降级；不能声称全分辨率无损、原版光照/反射或逐帧视觉等价。五种 EmptyAnimator 官方 prefab 不强配其他骨骼。8 条特皮四语音效缺失已列证据，未造假音频。所有 Boss、技能、结局长局与原生性能仍需后续实测。
