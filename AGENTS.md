2026-11-08 舟铲铲第一阶段平衡fix9构建快照（未部署）：fix9 接入舟铲铲第一阶段独立四难度敌人曲线，奖励关、出怪数量、路线、时间和移速保持。高难最终攻势共享血池为原版本难度的130%，标准100%；护卫HP为原版R14的1.35倍、攻击1.10倍，部件HP独立保留原版R14，频次有效命中次数保持旧舟铲铲值。配置按局克隆冻结，以revision/hash写入公开、结算和战斗规格，六包worker沿内容哈希接收。统一首领血池入口：此前方案依据GameData的75%系数，但正式入口旧值实际100%，本次三高难实际增加30%。舟铲铲准备按钮和空格不再弹剩余资金窗口，普通模式保持。基于fix8-r2隔离构建，仅纳入本轮文件/补丁，排除并行开发内容。build48/schema2/contract2/epoch1/资源保持；无原生重建、真实数据、部署、压力、模拟器或全CI。最终检查/包SHA见外层reports/cyclops-balance-stage1-20261108/DELIVERY.txt及RELEASE.json；本快照归档后不追写SHA。以下为历史。

2026-11-08 舟铲铲盟约徽记fix8构建快照，未部署：通用盟约三档原流程需点卡→上方原生下拉选目标→再点卡，漏选时无反馈；原测试page.select绕过真实点击不足以验收。现点击卡直接进入盟约按钮页，固定确认栏/倒计时，未选置灰、返回换卡、列表滚动与服务端确认；刷新槽清理本地选择。正式index入口/真实WS用实际点击覆盖银667×375、金390×844、彩1440×900，返回/未选不发送/重连/滚动/一次提交与服务器记录通过，页面资源0错。其余14浏览器场景首轮通过；新分支截图助手误要求图标及独立跑截图目录未建的两次夹具失败留档，修助手后针对三档通过。lint0错0警告/类型/导入通过。累计含fix7，目标Stronghold-Protocol-3-server-light-v1.1.1-cyclops-emblem-20261108-fix8，build48/schema2/contract2/epoch1与资源保持，无规则数值变更、真实数据、部署、原生重建、压力或模拟器。最终归档信息见外层reports/cyclops-emblem-20261108/DELIVERY.txt和RELEASE.json。归档后本快照不追写SHA。以下为历史。

2026-11-08 1.1.1舟铲铲波次/规则fix7构建快照（未部署）：根因21回合仍按maxLevelCnt15生成，R17–20共用act1autochess_07且pick为空，现模式专属补到21并在有候选时避相邻特殊敌人；普通模式48组seed/mode与fix6逐对象一致。新增cyclopsPools按开局座位至多四人固定分池，商店/奖励/晋升/取还/特质/征召/托管/审计均本人池，淘汰不跨组，装备全局/自选个人保持；重摇仍不禁抽。正式页与路由接金彩赌徒，独立body弹窗选择再确认，返装备/返本组副本、次数/低血量/阶段校验及重连保持。修复利息上限max(5+bonus,绝对cap)与运营重复收入，百分比用同批结算前存款；经验升级即时开空槽。上一轮“升级缺少免费奖励”为误判，免费奖励来自干员合成晋升，已更正攻略。按Emi补support.isolateContentCallback，真实48馈赠短帧安装无错、维多利亚攻击buff实测、异常隔离与事件深度通过，普通回归57全过。规则组合51/51、战斗2/2、正式index入口Chrome/真实WS15/15及六包合成IPC通过；最终lint0错8既有warning、类型/导入/14条四语言通过。新增docs/CYCLOPS-INTEGRATION.md，攻略12节48卡同步。目标Stronghold-Protocol-3-server-light-v1.1.1-cyclops-rules-waves-20261108-fix7，累计含fix6，build48/schema2/contract2/epoch1及资源保持；无原生重建、真实数据或部署，无压力/模拟器/全CI/全部技能组合完整战斗。最终归档大小/SHA/路径与源码核对见外层reports/cyclops-rules-waves-20261108/DELIVERY.txt和RELEASE.json。本条为构建前快照，归档后不追写SHA。以下为历史。

2026-11-08 1.1.1馈赠/征召窗口倒计时与攻略fix6构建快照（未部署）：独立cyclopsChoiceTimer复用服务器校时Countdown，以pub.deadline为准，位于选项滚动区外，手机/桌面滚动仍可见，末10秒警示、归零不发操作、等待/重连/征召换人不重置。未改服务器时限/领取规则。馈赠超时说明改为当前第一槽；大厅四人共享干员池改为征召每组至多四人。新增docs/CYCLOPS-GUIDE.md，12节玩法攻略和16族48条卡面全文，网页/Markdown在外层reports/cyclops-guide-timer-20261108。13正式入口Chrome/真实WS回归、7产品素材商店、lint0错0警告/类型/导入、定向四语言检查通过；网页桌面/手机目录、48卡全文、无横向溢出核验通过。轻量真实规则审计确认既有缺口：普通商店仍全局池；g.cyclopsRisk无分发/正式页面无主动入口；银利息上限参数未读、其他馈赠可抵消金彩上限；经济运营roundIncome在回合开始与结算各发一次；经验升级分支无原版晋升奖励。攻略均标出，本轮未改这些经济/战斗/主动规则。目标新包Stronghold-Protocol-3-server-light-v1.1.1-cyclops-guide-timer-20261108-fix6，累计含fix5，build48/schema2/资源保持；无原生重建、部署、真实数据、压力/模拟器或全CI。最终事实见外层报告DELIVERY.txt/RELEASE.json，本条构建前快照归档后不追写SHA。以下为历史。

2026-11-08 1.1.1玩法大厅/开放管理构建快照（未部署）：主界面舟铲铲入口移至玩法大厅；浏览器后台新增玩法开放，独立私有product-mode-policy.json，默认开放、修订/原子保存/审计/重启保持；关闭后服务器创建/玩家加入等待房间/开局三处拦截，管理员游戏连接同样受限，运行中对局与原成员重连保留。注册表、策略、大厅和后台分模块，接入说明docs/PRODUCT-GAMEPLAY-HALL.md。3策略产品测试、4正式入口/后台Chrome联动和11舟铲铲局内回归通过；组合36项34过2既有旧断言失败，与fix4对应源码切片完全一致（统计与版本创建）；定向lint/类型/导入通过，相关280消息四语言全覆盖，扩大检查仍有200既有消息缺译。目标新包Stronghold-Protocol-3-server-light-v1.1.1-gameplay-hall-20261108-fix5，累计含fix4，build48/schema2/contract2/epoch1与资源保持，无原生重建、真实数据操作或部署，不跑压力/模拟器。最终归档与边界见工作区reports/gameplay-hall-20261108/DELIVERY.txt和RELEASE.json；本条为构建前快照，归档后不追写SHA。以下为历史。

2026-11-07 项目边界：本目录 `Stronghold-Protocol-3-next/` 是当前活动项目（1.1.0）。旧的 0.9.13 本体已原样归档到 `../archive/retired-projects/Stronghold-Protocol-3-0.9.13/`，包含独立 Git 历史和归档时的工作区修改；只作历史参考，不作当前代码或部署来源。历史记录中“正式本体仍为 `../Stronghold-Protocol-3/`”等说法已过期，按本说明和当前 README 执行。工作区总览见 `../PROJECT-ARCHIVE-INDEX.md`。

2026-11-05 1.1.0 Emi排位/账号/界面本地交付，未部署：新增Emi规则排位（三场定级、六项个人表现、人数补偿、统治级连胜、五天无净加分失活）、管理员指定账号定级与旧规则赛季一次性迁移、schema2、30天记住设备与逐设备撤销、玩家档案/熟人/房间目录/模式详情/局内聊天重做和浏览器赛季后台。客户端1.0/build48，contract2/epoch1，原包名/签名/资源公钥和完整资源保持；Android与Windows完整客户端已构建，APK验签、ZIP清单及两端资源hash已核。定向产品测试18+28项、核心规则复跑10项、i18n 2686四语言、类型/导入通过，lint 0错误（既有warning）；单浏览器8个功能页×4尺寸、房间10项通过。未跑全量CI，未做原生实机/完整战斗，也未用真实旧库做schema1→2迁移演练。排行榜参与场次/本人标记/未定级分区、房间迷你金字塔、旧赛季图查看、昵称12字限制等仍未收口，不能当作全量验收。目标服务器包Stronghold-Protocol-3-server-light-v1.1.0-emi-friends-20261105，最终大小/SHA/归档校验见工作区reports/emi-implementation-20261105/DELIVERY.txt和RELEASE.json；本条为构建前快照，不追写SHA。以下为历史。

2026-11-04 1.0.0完整发布构建快照：从0.9.24累计升级，纳入此前皮肤/924条多语言录音/身份/专三/维什戴尔特质、双端入口和真实资源进度UI，以及第15首《难忘今宵》完整音频与隐秘核心全员存活触发。line1.0/build47、contract2/epoch1，沿原签名与包名；需要新完整客户端。仅本地构建，不上传部署或写真实数据，低负载串行验证，无模拟器/长局/全量Golden。账号/成绩/调配/配置保留。产物与最终SHA/归档验证/升级演练见工作区reports/release-1.0.0-20261104/DELIVERY.txt和RELEASE.json；本候选AGENTS仅构建前快照，归档后不追写。以下为历史。

2026-11-04 难忘今宵音乐候选（未发布）：仅Stronghold-Protocol-3-next新增第15首事件曲，素材取music/难忘今宵.mp4并规范化-12.99LUFS（原曲参考-13.05），MP3 5321443B，原14曲SHA和其余资产索引保持。coop进入实际隐秘核心回合时，原始真人成员全员alive/LP>0/未退出才触发，全体事件每局一次；沿原概率/同批单曲/ticker/BGM与本机开关，非强制优先。旧音乐配置只为缺失的新曲内存补默认启用100%，显式关闭/概率与旧设置/未知字段保留、不读写真实数据。6轻量定向（含真实Match入口及临时HTTP后台）/定向lint/严格导入通过，无浏览器试听/模拟器/长局。此前皮肤/身份/专三/维什戴尔候选全部保留；无新包/客户端/签名差量或部署，旧0.9.24和旧资源不含此曲，后续须新命名发布并分发含新MP3的签名差量或完整客户端，不启用资源回源。精确边界见reports/music-nan-wang-20261104/DELIVERY.txt和RESULT.json。以下为历史。

2026-11-04 维什戴尔附加盟约/特质候选（未发布）：仅卡兹戴尔预置普通/精锐维什戴尔新增【精准】与【余震压制】；本人原生余震物伤加成+10%，每累计3次有效余震命中按既有个人成长结算普通+1/精锐+2层，普通6/精锐10封顶；护盾与生命伤害同包只计一次。主攻击、残影爆炸、魂灵之影、装备与自选维什戴尔均不受新特质影响；未改原生op-wisdel、backups或自选归属。包kazdel-test-15/特质规则3，原12天然成员/5和10库存/技能潜能保持。5项定向（含同场自选对照、护盾去重、成长封顶、原接入回归）通过，lint0错4既有警告，严格导入检查通过；无浏览器/模拟器/完整对局/真实数据/打包或部署。上一轮皮肤/专三/账号等候选保留，仍须后续新命名发布及资源分发。本轮证据../reports/kazdel-wisdel-trait-20261104/DELIVERY.txt与RESULT.json。以下为历史。

2026-11-04 皮肤/身份/专三/卡兹戴尔新增候选（未发布）：23套缺失皮肤全部从本机官方包重新提取，大小写匹配与阿米娅形态包定位已修，349/349有模型，新增138文件29528429B、46前后模型，官方挂点补齐；不能据此宣称所有皮肤特效逐帧等价。账号游戏身份按accountId唯一复用，新设备接管旧游戏连接，普通多人也恢复；显式noReplace和跨账号令牌拒绝保持，临时HTTP/WS通过。维什戴尔加入卡兹戴尔（kazdel-test-14），普通/精锐6阶、12天然成员；上游三技能/魂灵之影复用，单人5/多人10，自选去重与正式身份冲突保护。补204条原作M3，保留原塔露拉3条；72持有自选、214唯一技能、432技能/等阶组合与装置/输入/模拟通过；修getDiy丢专精及缓存隔离，召唤形态键保留原七级。七内容包现60新增条目库存同等阶原版，组合172公共条目取还库存和150%选项通过，保留莱茵缪尔赛思+2旧定制。排位开关/普通不计分/插件同赛季规则、冻结/胜负/重复幂等通过，无真实数据、部署、模拟器或全量CI。仅候选源码与资源，未重建客户端、热更新包或服务器包；0.9.24历史包不含本轮改动，资源政策仍旧基线，后续发布必须生成并分发包含新模型的签名差量或完整客户端。详见../reports/skins-pool-identity-20261104/DELIVERY.txt与各JSON。以下为历史。

2026-11-04 0.9.24候选：按用户要求隐藏多人房间添加AI队友入口，产品服务器无条件拒绝room.addBot，普通/排位和原版/测试包均有效，房主/管理员无例外。多人开局前拒绝任何残留AI席位，保留移除旧AI与真人邀请。实际HTTP/WS临时双账号四种房间组合及旧席位开局拒绝/真人加入已通过，无战斗。仅候选、无真实数据或部署/客户端重打；资源/签名/旧包保持。目标Stronghold-Protocol-3-server-light-v0.9.24-coop-no-ai-20261104，最终以../reports/no-ai-teammates-20261104/为准；本条构建前快照不追写SHA，简化更新不加检查备份，重开客户端。以下为历史。

2026-11-04 0.9.23候选：用户明确保留排位开关，插件/原版排位均按冻结赛季规则全额结算；结算原本无插件折扣，本轮去掉额外modded/ranked:false准入限制，内容权限/依赖和原排位准入保持。手机榜单新增常驻关闭按钮/独立滚动。山路招募已确认缺少产品meta注册，补齐后真实levelUp 3/4级免费招募与领取通过。聊天按钮归入左下工具组与表情并列，面板跟随按钮/视口夹紧，增加未读和清楚消息样式；不恢复旧FX。仅候选、真实数据/正式本体/资源/签名/旧包保持，复用现有客户端，不部署，不跑模拟器/原生完整局/全量Golden/压力测试。目标Stronghold-Protocol-3-server-light-v0.9.23-ranked-ui-20261104，最终产物及SHA见../reports/ranked-modal-20261104/；本条构建前快照不追写SHA。简化升级不检查备份，客户端完全退出重开。以下为历史。

2026-11-03 0.9.22候选新增：非官方对局卫戍认证及每日目标进度按50%向下取整参与等级，历史记录按同规则计算，测试/未结算退出仍排除，日常达标奖励及排位积分不改。局内文字聊天恢复且保留表情，200字/2秒限频/50条内存历史/重连恢复，发送者服务端确认、按纯文本渲染。桌面/844x390手机单浏览器已验，无原生/模拟器/长局。资源/原生客户端/签名不变，目标Stronghold-Protocol-3-server-light-v0.9.22-level-chat-20261103，最终SHA和验证以../reports/level-chat-20261103/为准；本条归档前快照，不追写SHA。不部署，简化更新不检查备份。以下为历史。

2026-11-03 新增0.9.21账号调配/皮肤同步修复候选：用户0.9.20日志定位accountLoadout云保存PUT被拒，含诊断七包组合；901合法选择原校验通过，合成旧缓存module:null/空行/混入字段可复现整份拒绝，不能据日志断言用户具体坏条目。新shared/account-loadout统一账号格式，恢复合法字段并保留原脏缓存一份；皮肤/技能/模组/潜能练度统一revision与写队列，按干员和字段合并，登录/重连/前台恢复，旧entries皮肤格式兼容。合成存档/重启/身份与管理员保护5项及单浏览器双隔离上下文10项检查通过，未读真实数据。客户端与资源不重构建，复用0.9.20安卓build46或兼容45/Windows完整-r2，最低45与资源41ebe63b…保持。低优先级串行静态/归档验证，无模拟器、原生或普通完整对局、全量CI/Golden/压力测试。目标Stronghold-Protocol-3-server-light-v0.9.21-loadout-skins-20261103，不覆盖旧包；最终事实与SHA见../reports/account-loadout-sync-20261103/，本条为构建前快照，之后不追写包SHA。升级按docs/UPGRADE-0.9.21-LOADOUT-SKINS.md简化命令，不检查/备份；客户端须完全退出重开加载同一版JS。以下为历史。

2026-11-03 本次0.9.20归档前合并共享候选的4文件测试包自选优先修复：已审阅content-data/content-operators最小差分，实际SHA须与reports/testpack-diy-priority-20261103/CHANGED-FILES.json逐项一致，复用其6定向+9回归证据，不回退源文件、不重复跑模拟战斗。此修复在原0.9.19包中不存在，归档最终纳入状态以本轮RELEASE.json为准。以下为历史。

2026-11-03 新增管理员账号维护与安卓横屏候选0.9.20：当前账号列表漏接已有PATCH密码/DELETE账号接口，已补其他账号的双输临时密码表单与输入目标账号名的删除确认；禁止自删及自助重置入口，旧登录撤销/需改临时密码规则保持。合成账号重启/身份/赞助/调配/历史保留及单浏览器真实操作、390px布局通过，无真实数据写入。安卓原生sensorLandscape+配置回调提示层已接；强制竖屏遮住操作，恢复横屏显示原WebView，不主动重载或断连。新Android完整包build46，资源41ebe63b…/签名/包名保持；服务器最低build45不升，Windows复用完整-r2。构建串行低优先级，不启模拟器/实机/长局/全量CI。目标新服务器包Stronghold-Protocol-3-server-light-v0.9.20-account-android-20261103，不覆盖0.9.19或旧APK；最终产物与SHA/实际校验以../reports/account-maintenance-20261103/为准。当前是构建前快照，不宣称已完成安卓实机方向验证或部署。简化升级见docs/UPGRADE-0.9.20-ACCOUNT-ANDROID.md，不加检查/备份。以下为历史。

2026-11-03 用户已授权继续还原并生成服务器更新包，解除上一轮等待审图的暂停。当前候选冻结为0.9.19，目标Stronghold-Protocol-3-server-light-v0.9.19-covenant-fx-20261103（不得覆盖旧包）。东国专用刀带/见切/白夜切线碎屏已接回；伊比利亚1～5瓣蓝花瓣和持续斩杀符文按当前显示快照重建，目标跟随、取消/死亡/切场、重连和查看玩家切换已验，专用显示取代旧通用占位。旧HG源码与只读来源一致，IB保留原形状并增加隐藏目标/所属玩家筛选。此前导弹/血效、盟约详情、删除主动献血和商店直接招募保持。新增持久化路径/账号调配保护与客户端账号列表等前序改动已补验合成重启、账号隔离及入口；不能称找回已丢失的线上数据。build45/完整-r2双端/资源41ebe63b…及签名保持，本轮无新素材或客户端包；梅尔默认召唤模型仍未新增。当前仅本地准备归档，不上传部署；不跑模拟器、原生长局、全量Golden或压力测试。精确测试、最终包SHA和实际归档校验以reports/covenant-fx-restoration-20261103/DELIVERY.txt与RELEASE.json为准；源码有新改动须新命名构建，不得覆盖本冻结包。候选AGENTS保留构建快照，之后不追写归档SHA。更新按本候选docs/UPGRADE-0.9.19-COVENANT-FX.md简化命令，不检查/备份。以下为历史。

2026-11-03 用户追问核验补充：东国专用刀光/白夜切线碎屏、伊比利亚1～5瓣花瓣与原蓝色持续斩杀符文均未恢复；当前仅通用strike/wave/telegraph或短时金色准星，花瓣无绘制入口。上条70处FX信号显式处理不等于专用视觉还原，此为上一轮遗漏，必须保留为未完成。见reports/testpack-fx-review-20261103/KNOWN-GAPS.json与DELIVERY.txt追加纠正。此追问只读核验与记账，未移植两套专用显示或重新打包。以下为历史。

2026-11-03 测试包特效/装备与盟约详情审核候选已完成本轮（未打包部署，仅 Stronghold-Protocol-3-next）。用户新要求覆盖旧限制：卡兹戴尔血卷/血剑与罗德岛导弹采用重构前项目生成素材，两个血效文件对只读来源SHA一致，导弹纹理函数一致、缓存改为渲染器所有并释放；现战斗时钟驱动、切场清空。除莱茵科技外，魂火/契伤、刀势/奥义、灯火/长明、国度/处决并入对应BondPopup实时刷新，按查看玩家ID取快照，取消额外独立面板。主动献血选择及旧选择/携带计时导致的扣血移除，原生技能耗血保持。特蕾西娅3/5回合招募直接进商店奖励选择，首次休整锁定当时等阶，延期/重连保留、排队、库存再验，不能再要求从盟约面板手动打开。16新增盟约/24装备条目/70处FX信号静态登记，18轻量定向通过；14当前渲染器图、15组详情/科技/商店截图及24实际图标加载通过，4语言2572/导入/类型切片通过，局部lint0错3警告。不是全技能、普通完整局、原生双端或性能验收。低负载、正式本体/真实状态/签名/资源/旧包保持；无新服务器或客户端包，等待用户审图。最终只看 reports/testpack-fx-review-20261103/index.html、approved-legacy/与bond-details/；根部早期PNG和panels/已被后续要求替代。详细范围、失败纠正、边界见DELIVERY.txt及本候选docs/TESTPACK-FX-AND-BOND-DETAILS-20261103.md。其他账号维护/统计/梅尔等前序工作仍未全验收，不把本轮图审当全部完成。以下为历史。

2026-11-03 用户已明确恢复打包授权，解除此前等待另一AI完成的暂停。本次仅将当前Stronghold-Protocol-3-next整体冻结为0.9.18-merged服务器更新包，正式本体只读、未部署。另一AI测试包结构交付10文件构建前SHA与其CHANGED-FILES清单一致，参考目录修订3/正式身份复用/多包来源/既有冲突拒绝已纳入，连同此前UI账号与停服修复。目标Stronghold-Protocol-3-server-light-v0.9.18-merged-20261103，不覆盖上次ui-account-fix临时包或旧版本包；后者仍非最终部署来源。复用完整-r2双端build45和资源41ebe63b…，不重打客户端、不读取真实账号、不上传。用户低负载偏好继续有效，仅定向验证和静态/归档校验，无模拟器或长回归。最终事实/包SHA/边界见reports/server-release-0.9.18-merged-20261103/DELIVERY.txt与RELEASE.json；归档后本候选AGENTS保持构建快照，不追改包内文件。以下为历史。

2026-11-03 测试包身份接入保守整理（源码，未打包部署）：用户明确未来塔露拉等重合是兼容性假设，不增加假想内容、不改上游本体结构或调配实现。content-data分开可玩组合和参考目录；参考目录复用正式干员记录、重映射精确引用、保留原生技能模组并推导包来源，目录修订3。运行组合复核既有冲突保护，不因目录复用自动启用未经适配的八个已有单包/版本组合。正式charId/byChar/ops、默认值省略、自选、协议及引擎保持；不宣称未来版本已兼容。仅轻量组合/夹具/定向回归，未启动模拟器或长回归。详情docs/PRODUCT-CONTENT-IDENTITIES.md与../reports/test-package-structure-20261103；旧发布包不含本轮源码，后续须新命名构建。以下为历史。

2026-11-03 新增0.9.18百科/账号修复（仅Stronghold-Protocol-3-next候选，正式本体只读、未部署）。皮肤同步内容去重，并将调配偏好从密码账号10次/15分钟限流分离为120次/分钟/账号；429有限重试与账号代际隔离。取消玩家反馈填写/提交入口，仅管理员提示和复制诊断，历史收件箱保留。百科全包目录与本局目录边界不变；图标统一使用本地完整索引，服务器目录不重复发送约3.26MB素材索引，自定义图标为代码内独立图形/既有头像，不宣称新提取原作图标。盟约头像56～76px、两行滚动；少女乐队5人房间名片与日语试听；塔露拉3项原作Lv10编译记录及专三选中态已补。管理员领取上下文跨实际工作进程传递，局内左下入口，默认关/后台可撤回/第一回合本人一次/排位禁用。客户端统计无清空入口且后端拒绝；浏览器可点玩家查看公开统计，管理员查看安全管理数据并清空指定玩家成就统计，积分、账号、服务器战绩不清；clear时间水位阻止旧缓存恢复。默认含插件对局，测试房间仍不计入。低负载定向与单浏览器/短实际工作进程验证，未启动模拟器或长回归。目标新包Stronghold-Protocol-3-server-light-v0.9.18-ui-account-fix-20261103，不覆盖旧包；build45/资源41ebe63b…/完整-r2双端保持，无重新构建客户端。简化更新不检查不备份，见docs/UPGRADE-0.9.18-UI-ACCOUNT-FIX.md；最终校验与限制以reports/ui-account-fixes-20261103/DELIVERY.txt为准。以下为历史。

2026-11-03 新增0.9.17停服修复，用户最新要求未完成对局直接删除记录，已完成/待结算结果保留；“不检查、不备份”明确仅指服务器更新指令。仅候选Stronghold-Protocol-3-next修改，未改正式本体、真实数据或部署。SIGINT/Ctrl+C与SIGTERM先阻止新请求/开局，关宿主、等待账号写队列、重试可靠结算，再事务删除无最终结果的running履历/成员及排位running/参与者/锁/退出冷却；已完成历史/积分不删。写入失败的结果保留且退出码1，不报成功；重复信号与close幂等。旧版残留可用tools/clear-unfinished-matches.mjs --stopped一次清理，不需要重启旧服。用户未授权清空历史interrupted/finished记录，不清。

本轮仅4项轻量停服回归（约5秒，含实际入口受控信号子进程）及静态检查，无模拟器/实际对局/长回归；首轮夹具误设单人席位为coop已纠正，失败日志保留。服务器新包目标Stronghold-Protocol-3-server-light-v0.9.17-shutdown-fix-20261103.tar.gz，不覆盖0.9.16-r2旧包。复用0.9.16完整-r2双端客户端、39311资源/最低build45/原签名，未重打客户端。简化升级按新docs/UPGRADE-0.9.17-SHUTDOWN-FIX.md：停服→tar --strip-components=1覆盖/root/w3→npm ci --omit=dev→新清理工具--stopped→原env文件启动产品入口，不用会自动备份的update-project，不要求inspect/snapshot/verify命令。最终包大小/SHA与构建核验以reports/shutdown-fix-20261103/DELIVERY.txt为准。用户低负载偏好持续有效。以下为历史。

2026-11-03 最终服务器修订必须使用0.9.16-product-repair-20261103-r2：末尾修正动感音乐被BGM音量0错误阻断，仍遵守总静音。界面保持旧版原文件/原文案；完整客户端与39311资源、build45不变，复用-r2客户端。初始0.9.16服务器包为中间构建，勿误部署。用户低负载约束持续有效。以下冻结说明与报告保留精确验收边界。

2026-11-03 0.9.16/code45产品修复候选冻结说明：仍仅本隔离候选，不覆盖正式本体或部署。交易员按用户追加要求恢复重构前InvestmentPanel/InvestmentChart原文件、原CSS、独立远行入口及全部显示文字；覆盖本轮此前新TraderPanel设计，旧组件两文件SHA与正式只读来源一致。恢复界面不撤回无投资可准备的修复。

本轮实现追踪/局外目录与报告/专精实际等级链/皮肤账号恢复与349服装新提取/图标/音乐独立音量/账号成就/管理员反馈/快捷领取/正式干员身份冲突整包禁用。新增FX继续用上游执行器和本机原客户端新只读提取，塔露拉S3从Buff模板动作引用补原火浪，不复制旧ABI2。资源41ebe63b7a079fc34814e9e9714b166dff45f1a681d96035497b6278b7f7314a，39311逻辑文件；双端完整客户端-r2，最低build45；签名/contract2/epoch1/line0.9保持。

408产品与内容测试、61乌萨斯/专精/FX联合、62统计皮肤回归、塔露拉2边界通过；四语言2546全覆盖。Windows实际完整客户端17受控战斗帧/清场场景通过，不等于普通完整局或Unity逐像素。Android新r2构建验签完成；用户要求电脑负载低、少跑测试，已停止最终Golden、测试客户端和独立5560，勿自动重启压力/长局；最终Golden重跑未完成，已有golden.log为前阶段288通过。当前完整Android实跑不认证，勿引用0.9.15双端14回合当本次通过。原生资源/包完整性与最终发布以../reports/product-repair-20261103/DELIVERY.txt及机器清单为准，未完成审计不可宣称交付。

正式本体/真实账号/原签名与旧包不写入；皮肤23仅图片、5乐队日语回退、20皮肤特殊录音未取得、个别自定义效果程序化等限制须保留说明。详见../reports/product-repair-20261103/WORKLOG.txt、UPSTREAM-PR-EVIDENCE.json、LOAD-REDUCTION.txt。后续更改JS需另命名新包，不覆盖既有0.9.15 r4及历史包。以下为历史。

2026-11-03 第二批最终冻结补充：425联合回归、补长回合后288上游Golden一致；64单包版本组合、28四版本真实战斗/复算、32长回合机制和72跨版本长波次检查通过。真实Windows+Android发布APK（API35/WebView124）两真人两AI、五包组合14回合胜利，JS错误0且最终服务无结果拒绝/异常接管；两次旧可选tiles.json本地404使用上游3D默认材质，非素材回源。最初实跑丢productContent/CS已修，初观察器15分钟上限后同局继续完成，不把旧失败当通过。服务器最终只认0.9.15-upstream-batch2-20261103-r4，初包/r2仅中间快照缺后补长回合分支。新完整客户端与c2b7资源hash/code44不变，最终包校验/状态保留演练/清理以报告为准；未部署。

2026-11-03 第二批0.9.15/code44候选：16个测试包与七组保留盟约已接，予愿安洁莉娜a/b归原版pro。逐包管理员适用版本默认仅act2autochess，私有管理员也不能绕过；房主开局前选包，跨版本全部清空且切回不恢复，同版本保持。product-content-policy.json首次继承旧公开配置且保留未知项；music-rules.json及14首已确认自定义音乐保留。资源/FX仍按固定上游获取和新只读提取，未复制旧映射/ABI2 runtime。完整资源c2b7ad45、36210逻辑/35479blob，Android最低44、contract2/epoch1/line0.9；完整双端新包及服务器包只有最终报告校验通过才算交付。实际原生复验中发现默认版本省略、手机控件隐藏、CSS错路径、浏览器丢弃productContent/内容版本入口等均已针对修正，失败实跑保留，不用服务器接管冒充客户端通过。产物与最终验证见../reports/upstream-batch2-content-20261103/DELIVERY.md；未部署，正式本体只读保持。旧“16项迁移中”仅第一批历史。规范docs/PRODUCT-CONTENT-BATCH2.md。

2026-11-03 第二批已获用户明确授权：接入既定七组定制/通用测试选项/交易员及关联资源音乐，予愿安洁莉娜移回原版pro。管理员可逐包设置适用原游戏版本，默认仅act2autochess；房间换版一律清空所有测试包并须重新选择。旧配置/未知项/账号/历史/签名保留，仅候选写入，不部署；完成全部第二批验证后生成新的服务器更新与双端完整客户端。来源规则冻结、迁移与证据reports/upstream-batch2-content-20261103；旧资源映射/旧FX内核不复制，仍沿上游获取提取。

# 本项目第一批重构候选约束（2026-11-02）

2026-11-03 用户追加：原游戏版本改为房主在开始游戏前于房间内直接选择，取消投票；单人也在房间内选择。产品入口使用room.setVersion，非房主、观众和已开局均不能修改；后台开放列表与默认版本保留，换版清除其他玩家就绪并等待版本数据就绪。大厅版本选择移除。此条覆盖下文与上游历史文档中要求房间投票的描述。

2026-11-03 继续实施：用户已授权完成第一批并生成可游玩的服务器更新包与双端完整客户端，未授权部署。新增授权允许同一兼容系列内经签名与SHA256校验的资源差量热更新；跨客户端大版本、资源代际或最低客户端构建要求必须安装新客户端。服务器仍不托管安装器或基础完整资源包，不提供散素材缺失回源。此条覆盖下文绝对禁止资源下载的旧描述。当前新接口、原生存储和真实游戏准入在开发与验收中，不能把账号评审阶段或编译通过写作最终交付。仅候选目录接受本轮修改，正式本体与真实数据继续保持。

用中文交流。此目录是隔离候选，正式本体仍是 ../Stronghold-Protocol-3；不自动覆盖、部署或恢复退役实验runtime。

当前为0.9.14第一批可玩候选。npm start、dev和直接server/index.js均进入经过账号及原生资源准入的产品游戏服务；账号评审服务仅为独立测试入口。已接上游原版引擎、客户端本地全量资源、账号/赛季/战绩/观战/恢复、四版本后台与房主直接选择，以及签名资源差量更新。正式产物、原生验证范围和限制以../reports/upstream-batch1-playable-20261102/DELIVERY.md为准；未上传部署、未读取线上真实数据。不会创建默认账号，未知格式、账号库不配对或旧局未结束时拒绝接入。

所有UI/效果可重构，功能UI应适配上游风格、位置、手机横竖屏与安全区。浏览器只管理账号，游玩必须Android/Windows客户端。资源、特效和FX映射采用固定上游版本及其获取/提取方式；定制角色也沿此方法补齐，不接入旧本地资源/FX包/ABI2映射。不得为缺资源回源到游戏服务器。

保留账号ID、密码哈希、权限、禁用/赞助、赛季/积分/历史/审计、配置与签名；不重置存储。后台原游戏版本为第一期上半/下半、第二期上半/下半；策略已接到新建房间和开局前房主直接选择。运行中对局不跨引擎热迁，待结算须先由原版本处理。

定制内容第二批；16项稳定内容ID在产品目录显示迁移中、有效能力关闭，开局冻结目录修订与空定制选择，管理员只读核对原配置摘要；不覆盖原开放配置、未知项或偏好。伊比利亚独立局内内容包不接入，伊比利亚盟约仍保留。定制音乐原配置保留，相关业务触发随第二批接入，不能宣称本批可触发。

事实、验收/失败与待办见 ../reports/upstream-rebase-batch1-20261102/DELIVERY.md，方案见 ../reports/upstream-review-20261102/INTEGRATION-PLAN.md。下面为固定上游维护规范；与用户明确范围冲突时以上述范围为准。

# AGENTS.md

Entry point for AI coding assistants (Codex, Claude Code, Cursor, Copilot …) working on this repository. It only
indexes the existing documents and their hard rules; when this file and a linked document disagree, the document wins.
Human contributors: [CONTRIBUTING.md](CONTRIBUTING.md) is the same material in full.

## What this is

A non-commercial fan remake of Arknights「卫戍协议：盟约」 that runs in the browser: a Node.js server (economy, rounds,
rooms) and a deterministic battle sim shared by the server and the browser. It aims to be faithful to the official mode.

## Read first

1. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — the code map: where things live, data flow, golden results,
   import boundaries, where common changes start.
2. [docs/DESIGN.md](docs/DESIGN.md) — the index of the rules: current rules in `docs/design/`, each release's
   revisions and their evidence in `docs/history/`.
3. The reference for the part you touch: [docs/SIM.md](docs/SIM.md) (battle engine API, hooks, test harness),
   [docs/META.md](docs/META.md) (match flow, shop, protocol), [docs/DATA.md](docs/DATA.md) (generated data),
   [docs/I18N.md](docs/I18N.md) (interface strings), `server/sim/content/kits/README.md` (operator kits).
4. Before editing battle simulation code, read [server/sim/AGENTS.md](server/sim/AGENTS.md) for a short settlement API usage guide.
5. [docs/CI.md](docs/CI.md) — the CI jobs, the test-sharding contract (`ci-shards.json`), how to re-weigh it, the
   timeout policy, and the ways a CI measurement lies.

## Hard rules

- **Formatting.** Use two spaces for JavaScript indentation; do not introduce Tab indentation.
- **Official first.** Rules come from the official data tables (`.cache/gamedata/excel/` after setup) and
  [PRTS](https://prts.wiki/). A detail no source settles is implemented the simplest way and marked `[ASSUMED]` in the
  code and the PR. Deliberate deviations from the official mode are the maintainer's decision only.
- **Determinism.** `server/sim/` is plain ESM that runs in Node and in browsers: no Node APIs, no `Math.random`, no
  clocks, and no engine-approximated Math functions (use `server/sim/detmath.js`; ESLint and
  `test/sim/detmath.test.js` enforce it).
- **Golden results.** A refactor must not change `test/golden/*.json`. An intended gameplay change runs
  `npm run golden:update` in the same commit, and the commit / PR names every moved scenario and why
  ([test/golden/README.md](test/golden/README.md)).
- **Generated data.** Never hand-edit `data/*.json`: change `tools/build-data.mjs` and regenerate.
- **No game art in git.** `public/assets/` is ignored; never commit extracted or downloaded game files.
- **Interface strings** go through `t('…')`, with entries in every pack under `public/i18n/`
  (`node tools/i18n.mjs check --all --strict`).
- **Docs follow the code.** A rule change updates `docs/design/`, the current `docs/history/` file and the reference
  docs; run `node --test test/docs-consistency.test.js test/docs-paths.test.js`.
- **Commits and PRs**: one topic per PR; a one-line message of what changed (Chinese or English) with the issue number;
  no attribution trailers (`Co-Authored-By:`, `Generated with …`). The PR description states what, why, the sources,
  the `[ASSUMED]` points, the tests you ran (paste the summary lines) and the golden moves. No ads, payments or other
  monetisation — the project stays non-commercial.

## Verify

Run the tests of what you touched first, then everything before opening the PR:

```bash
node --test test/<area>/<file>.test.js      # targeted
npm run ci                                  # the CI checks locally (tools/ci.mjs): npm test, smoke, lint, imports, types
npm run golden                              # golden results
```

Browser suites are off by default and need Chrome: `SP_E2E=1` (UI), `SP_REAL_E2E=1` (real match, needs assets),
`RENDER_E2E=1`, `SIM_E2E=1` — see CONTRIBUTING.md §2. Battle tests are easiest with the helpers described in
docs/SIM.md (the test harness section) and the patterns in `test/content/op_siege.test.js`.
2026-11-07 项目边界：本目录 `Stronghold-Protocol-3-next/` 是当前活动项目（1.1.0）。旧的 0.9.13 本体已原样归档到 `../archive/retired-projects/Stronghold-Protocol-3-0.9.13/`，包含独立 Git 历史和归档时的工作区修改；只作历史参考，不作当前代码或部署来源。历史记录中“正式本体仍为 `../Stronghold-Protocol-3/`”等说法已过期，按本说明和当前 README 执行。工作区总览见 `../PROJECT-ARCHIVE-INDEX.md`。

