# 卫戍协议：盟约 · Stronghold Protocol: Alliance

![version](https://img.shields.io/badge/version-1.2.0-2ea44f)
![license](https://img.shields.io/badge/code%20license-GPL--3.0--or--later-blue)
![node](https://img.shields.io/badge/node-22%20%7C%2024-339933)

《明日方舟》卫戍协议玩法的非官方、非商业同人复刻。此候选基于固定上游dev提交`bfd2a9209b3a42545acb757e0f6e51052d8694ff`，接入既有账号、客户端与持久化服务。原游戏素材版权归鹰角网络所有，不得单独再分发或商用。代码与第三方组件分别遵循[LICENSE](LICENSE)、[NOTICE.md](NOTICE.md)及对应许可。

当前版本为1.2.0，累计1.1.1 fix8-r2、舟铲铲fix9平衡及当前已完成的水月与深蓝之树、炸惊模拟和界面修复。水月使用共享原版房间，等待室可调整1–4人；手机仅横屏，保留旋转遮罩和长内容滚动。Android与Windows必须安装1.2系列/build49完整客户端，资源已内嵌；服务器更新包不提供完整资源或散素材回源。原账号、成绩、调配、皮肤、音乐、开放策略和配置保留。更新见 [1.2.0升级说明](docs/UPGRADE-1.2.0.md)，精确产物与验证见工作区 `reports/release-1.2.0-20261108/`。本地交付未部署。

浏览器只提供账号和管理员界面，游戏必须使用Android或Windows客户端。单人及1–4人合作采用固定上游的原版规则、界面与特效。历史定制内容保留数据与配置，分第二批迁移；伊比利亚独立局内内容包不接入，伊比利亚盟约保留迁移计划。

This is a non-commercial fan remake of the Arknights mode *Stronghold Protocol: Alliance*. It uses the pinned upstream engine with retained account and ranking services. Browsers manage accounts; gameplay requires the Android or Windows client.

## 运行与更新

需要Node.js 22.12及以上，推荐Node.js 24。准备服务器源码、依赖和与客户端相符的`client-updates/client.json`后，通过`npm start`启动客户端专用游戏入口。直接运行`server/index.js`也会进入同一产品准入路径。原上游导出的`startServer()`保留给受控测试，不是部署入口。

服务读取`.env`、`.env.local`、`config/server.env`及进程环境变量。已有部署的`SP_STATE_DIR`、`SP_AUTH_USERS_FILE`、`SP_RANKED_FILE`继续有效。必须保留原配对账号库和排位数据库，缺失或格式未知时拒绝初始化，不创建默认账号。账号界面位于`/account`。

更新时先停止旧服务，按 [1.1.0升级说明](docs/UPGRADE-1.1.0-EMI-FRIENDS.md)覆盖服务器源码、安装依赖、清理旧未完成局，首次启动后在管理员“赛季与战绩”执行旧规则迁移，再按原环境配置启动。Android覆盖安装build48完整APK，Windows解压新完整客户端目录后运行；继续使用原账号和服务器地址。

四个原游戏玩法版本分别是第一期上半、第一期下半、第二期上半、第二期下半。管理员可设置开放版本与新房间默认版本，已有房间和进行中对局不强制改版。它们独立于项目版本号、客户端兼容系列与资源代际。

游戏开始前由房主在房间内直接选择版本，无需投票；单人同样在自己的房间内选择。切换后其他玩家需要重新准备并载入对应数据，已开始对局不能切换。大厅不提供本机版本选择。

## 客户端资源

Android沿用原包名与签名；Windows保留原用户数据目录。完整客户端内嵌按固定上游获取和原游戏只读提取流程生成的资源，缺失或损坏不以散文件回源。服务器不托管客户端安装器或基础完整资源包。

兼容小版本可从服务器下载经签名的资源差量。客户端验证清单签名、文件大小和SHA256，全部文件就绪后原子切换；运行对局期间不切换。跨兼容大版本、资源代际或低于最低构建要求时必须安装新完整客户端。协议、分发边界与构建入口见[客户端资源更新说明](docs/CLIENT-RESOURCE-UPDATES.md)。资源更新私钥和Android应用签名不得进入服务器包或客户端包。

## 开发与核验

原版玩法的详细操作见[玩法指南](docs/PLAYING.md)。同盟断线保留窗口为10 分钟，普通单人原座位保留24 小时；同账号恢复仍校验座位所有权，不因昵称相同而恢复，也不抢占在线座位。跨引擎更新前的旧内存局需要先结束。

上游原版中已配发的装备锁定在干员身上，替换按当前装备接口处理。独立模拟可使用“暂停（独立模拟）”，同盟模拟的作战不能暂停。部署选择按地上的方格，机变选卡先点选再确认；漏怪时顶栏用红字 + 「−N」标记待扣的目标生命值，结算时才正式扣除。

维护规则见[AGENTS.md](AGENTS.md)，上游架构与设计见[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)和[docs/DESIGN.md](docs/DESIGN.md)，版本记录见[CHANGELOG.md](CHANGELOG.md)。不要恢复旧实验runtime，不用旧资源包或ABI2映射替代当前上游资源流程。

产品回归使用`npm run test:product`；其他核验入口为`npm run lint`、`npm run typecheck`、`npm run check:imports`与`npm run golden`。Windows平台既有测试限制与本轮失败应按报告分别列出，不能把跳过、基线失败或编译通过写成完整双端验收。

上游仓库：[sganggs/Stronghold-Protocol](https://github.com/sganggs/Stronghold-Protocol)。本项目继续保留其作者、贡献者与第三方许可说明。
