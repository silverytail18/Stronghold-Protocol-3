# 水月地图与难度页修正（本地候选）

尚未部署。旧 `mizuki-candidate-20261108` 源码包和旧水月资源包不包含本轮修复，旧截图中的空地图不能作为已完成地图验收的证据。

## 手机界面约束

按用户 2026-11-08 明确要求，手机端仅维护横屏布局，保留主仓库“请将设备横屏”遮罩和原生横屏策略。水月不豁免旋转遮罩，不制作手机竖屏玩法页面。横屏长内容仍须能上下滚动并触达底部按钮；航线和战斗沿用各自手势。后续上游更新必须复验遮罩及转回横屏后的页面、选择状态。详细约束见 [MIZUKI-INTEGRATION.md](MIZUKI-INTEGRATION.md)。

## 难度页来源与接入

用户参考图对应 Emi 提交 `ac00de2ead13a3fe6511a6e1eb3fb7c707dc2e16` 的 `public/js/ui/mizukiSetup.js`、`mizukiDifficultyData.js`。舰船、网格与人物背景由主仓库 `protocolScene.js` 的 SVG 绘制，不依赖整页截图图片。移植保持水月私有组件；当前主仓库没有导出的 StampRing 仅在水月组件内补齐，不修改普通大厅。

进入水月后直接选择 N0–N18、1–4 人并创建房间。房间实际席位与人数一致，新探索保存 roomCapacity；旧探索缺失该字段按原四人房间恢复。普通模式仍不接受 capacity 参数，原有资料、历史、恢复和放弃入口保留。

## 地图根因与维护

Unity 静态合批网格已烘焙物体变换。旧提取器漏记 sourceTransformPathId、MeshRenderer 的 m_StaticBatchInfo 和静态合批根等原生字段，导致适配器对整张合批网格再次施加单物体变换，出现资源加载成功却看不到地形的情况。

已从本机 `D:\yj\Arknights` 官方客户端为 60 张地图、10174 个 renderer 补齐元数据，并同步 native-maps/manifest.json 的大小与摘要。`tools/local-extract/fx.py` 保留这些字段；`mizukiMaps.js` 对缺少合批信息的 Combined_Mesh 明确报错，避免再静默显示空地图。60 图结构、子网格范围及棋盘覆盖检查不等于逐图视觉验收，也不代表完整原版光照、反射和摄影机还原。

后续重新提取资源、更新上游 renderer 或生成水月渲染器后，应运行 `node --test test/mizuki-map-metadata.test.js test/mizuki-stream.test.js test/mizuki-lobby-capacity.test.js`，再检查正式入口真实布阵与战斗画面，不能仅依据加载计数判定地图完成。

### 整备区位置与战场上沿

准备阶段的整备区必须位于地图下方。水月视图将手牌放在显示行 0、临时整备放在显示行 1，原生地图向上顺延两行，原地图第 18 行因此显示在行 20。水月的拖拽坐标、2D 绘制带、3D 场景范围和点击拾取都使用这套 21 行显示网格；不能只扩网格和相机，却仍用普通模式只绘制第 6–18 行的整备/敌区视带，否则最上、最下两行仍会被裁掉。准备阶段会将整张移位地图纳入绘制和聚焦范围；回归由 `test/mizuki-prep-layout.test.js` 覆盖，包括桌面与两种手机横屏比例的上、下边界。

修改上游 `render/app.js`、`render/drag.js`、`render/tiles.js`、`render/board3d/layout.js` 或 `mizukiBattle.js` 时，先运行 `node tools/build-mizuki-render.mjs` 更新派生模块，再运行 `node --test test/mizuki-prep-layout.test.js test/mizuki-map-metadata.test.js`，确认第 20 行可见且地图行上的放置拾取正常。手机只验横屏；保留旋转遮罩，长页面仍遵守上方手机约束的纵向滚动要求。

### 2026-11-09 按实际战场适配相机

21×21 是水月渲染网格的最大容量，不是每张地图的固定取景框。`mizukiPrepViewRect` 以服务端实际关卡 rect 加两行整备区，宽度取实际地图与十个整备位的并集。例如原地图 6 行×9 列，准备视图为行 0–7、列 0–9，不再取列 0–20。`mizukiProjection` 用该范围适配视口；准备阶段没有商店，底部边距使用当前收起状态的 HUD 测量值，顶部同时避让盟约栏。普通作战、联防与首领也按实际 rect 拟合，不因关卡边界碰巧符合普通卫戍棋盘预设而切换到其固定相机。

后续同步上游时保留上述最大网格与实际取景框的区别，运行 `test/mizuki-prep-layout.test.js` 检查小图/大图的缩放差异、十个整备位、地图四角及横屏 HUD 边界。修复截图和验证记录见外层 `reports/mizuki-camera-fit-20261109/`。外围建筑为装饰，其完整模型范围不决定可部署地图的取景大小。

### 水月顶部盟约栏收起按钮（2026-11-09）

水月 `screens/mizukiBattle.js` 复用普通 `screens/game.js` 的 `bonds-toggle`、`gm__bond-list`、左右箭头和已有四语言“收起盟约/展开盟约”文案。默认展开，点击收起时关闭当前盟约详情，仅保留44×44的展开入口；列表使用hidden，不留遮挡战场的点击区域。按钮支持键盘，空格事件不传给准备/暂停快捷键。只保存当前战场组件内的界面状态，不修改盟约数值。准备与战斗使用同一按钮；以后上游更新该控件时同步核对水月入口。保留手机横屏遮罩。双端操作与截图证据见外层 `reports/mizuki-bonds-toggle-20261109/`。

## 配套资源

修复 target：`27b94d5bb4f95f6aaf6e00ac5433076b9b33868e64d4948810a72fd5d8c9930b`。新增/修改 61 项资源（60 个地图 descriptor 与地图 manifest）。

资源补充包 `Stronghold-Protocol-3-mizuki-map-resource-fix1-20261108.tar.gz` 必须在原水月资源分发包上合并安装。它包含新的 blob、三份签名更新清单及 client.json，不能独立代替原完整素材包，不能只复制 client.json。沿用原公钥、客户端 line1.0/build48/contract2/epoch1。未生成新的 APK 或 Windows 完整客户端，未部署。

升级前按原规则完成旧探索，再更换源码和配套资源，完全退出客户端后重开。来源、资源包校验与最终截图以外层 `reports/mizuki-map-scroll-20261108/` 为准；早期竖屏布局图已撤销，不再作为设计或验收目标。
