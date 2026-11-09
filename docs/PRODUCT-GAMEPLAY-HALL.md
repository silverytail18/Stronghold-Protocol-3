# 玩法大厅与开放管理

玩家从主界面的「玩法大厅」进入舟铲铲，查看规则和开放状态，再选择难度、创建房间。主界面保留独立模拟和同盟模拟，后续独立玩法统一加入玩法大厅。

管理员用普通浏览器打开服务器 `/account`，登录后选择「玩法开放」，勾选或取消舟铲铲，点击「保存玩法开放设置」。首次更新默认沿用已开放状态。保存后立即在服务器生效，重启后保留。此开关独立于游戏版本开放、测试包启用和排位设置。

## 关闭的边界

- 拒绝新建该玩法房间、以玩家身份加入等待中的该玩法房间，以及在旧等待房间开始新对局。管理员游戏账号也受限制。
- 保留正在进行的对局及原成员重连，不终止战斗、不修改规则快照。
- 关闭状态仍在大厅展示，入口禁用并说明未开放；普通模式继续开放。
- 已打开的创建窗口可能尚未显示新状态，但服务器始终重新检查，不允许绕过。大厅每次打开、窗口回到前台及打开期间每 15 秒读取状态，也可手动刷新。读取失败时禁用选择，恢复后重试。

## 模块与接入点

| 文件 | 职责 |
| --- | --- |
| `shared/product-modes.js` | 玩法注册表：稳定 ID、名称、图标、说明、规则、人数、默认开放状态；大厅和后台共用 |
| `server/product/mode-policy.js` | 独立持久化、修订冲突检查、管理员鉴权、原子保存与审计 |
| `public/js/ui/gameplayHall.js` | 大厅卡片、最新状态、失败重试和移动端滚动；不实现战斗规则 |
| `public/product/mode-admin.js` | 浏览器管理员的玩法开关与保存界面 |
| `server/product/lobby-bridge.js` | 创建、玩家加入、开局三处服务器准入，以及房间目录可加入状态 |
| `public/js/screens/lobby.js` | 主界面大厅入口与选择后的玩法创建流程 |

状态文件为当前私有持久化目录中的 `product-mode-policy.json`（目录沿用部署的 `SP_STATE_DIR` 或现有目录解析结果）。不写入生成规则的 `data/`、账号文件或排位数据库。配置缺失时按注册表默认值载入；已有配置和未知未来字段保留，损坏文件拒绝静默覆盖。首次管理员保存才创建新文件。备份和迁移持久化目录时应连同此文件保存；现有 retention 快照工具并未因此自动纳入此文件。

API：

- 已登录客户端 `GET/HEAD /product/modes`：只读目录及当前开放状态，`no-store`。
- 浏览器管理员 `GET/HEAD /auth/admin/gameplay-modes`：读取策略。
- 浏览器管理员 `PUT /auth/admin/gameplay-modes`：JSON `{revision, modes: [{id, enabled}]}`。保存检查同源、权限、请求大小、限流及当前修订；排队写入前再次鉴权。并发过期返回 409，刷新后再保存。

## 后续玩法与上游更新

2026-11-09 起，玩法大厅中的独立玩法（水月、炸惊、舟铲铲）不进入原版通用统计。共享 `shared/stats.js` 的 `isAlternateGameplay` 按房间／结算 `variant` 判断，并用 `mode_mizuki`、`mode_cyclops`、炸惊单／多人modeId及`ZHAJING`难度兼容旧记录。新玩法使用非空variant即遵循这一排除规则；普通模式启用测试包仍沿原插件统计规则，不因本条改变。

新结算、提前退出、账号归档写入、旧记录读取／导入／跨设备同步及直接汇总均排除这些独立玩法。即使开启“含插件对局”，也不会计入场次、胜率、隐藏核心、回合／时长、战斗总量、策略／盟约成就、通用奖杯、卫戍认证及每日目标。结算页面不预览这些玩法带来的通用等级增长；玩法实际结算及水月独立探索存档、历史、认知／投资等由其自身模块处理。

兼容处理在读取时过滤旧记录，无需更改统计格式版本或迁移排位数据库；不清空原版统计，不修改排位账本。历史记录若已经丢失所有玩法标记且被伪装成普通modeId，无法安全推断来源，不按回合数或数值猜测删除。本轮未操作真实账号数据、未部署。证据见工作区 `reports/alternate-gameplay-statistics-20261109/DELIVERY.txt`。

上游更新时需保留记录生成前的variant上下文、normalize／append／aggregate与认证／成就的排除规则，以及账号归档读写的服务端过滤。回归：`node --test --test-concurrency=1 test/product/alternate-gameplay-statistics.test.js test/ui/stats.test.js test/ui/settle.test.js test/ui/bond-achievement-stats.test.js test/ui/strategy-badges-stats.test.js test/ui/match-records-stats.test.js test/product/account-archive.test.js test/product/ui-account-fixes.test.js`。

新增玩法时，在注册表新增稳定 ID 和四语言文案，并实现对应的规则模块、房间变体校验和大厅选择后的创建流程。开关与卡片随注册表扩展；注册表并不自动生成尚未实现的玩法。不要复用现有 ID 表示不同玩法，以免继承错误的开放设置。当前舟铲铲不参与排位，其他新玩法须分别定义其结算和内容兼容边界。

更新上游时，优先保留独立产品模块；核对主界面挂载、后台 tab/静态文件白名单、产品服务生命周期、只读 API、lobby 准入三个钩子和 `MODE_CLOSED` 错误文本。战斗、馈赠与选秀继续由原舟铲铲模块负责，开放策略不进入引擎或回放规则。新增模式默认状态在注册表明确声明，不覆盖管理员已保存状态。

定向回归：`test/product/gameplay-modes.test.js` 验证持久化、权限与真实 HTTP/WS 准入；`SP_E2E=1 node --test test/ui/gameplay-hall.e2e.test.js` 验证正式游戏入口和浏览器后台的真实点击、四种尺寸、失败恢复、关闭与重连。原舟铲铲局内入口回归保留在 `test/ui/cyclops-live.e2e.test.js`。
