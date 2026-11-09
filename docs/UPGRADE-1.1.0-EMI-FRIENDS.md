# 1.1.0 更新与首次新规则赛季切换

本地交付，不自动上传部署。服务器包是从1.0.0/fix6累计生成；Android与Windows完整客户端均build48，资源契约与原签名保持。现有账号、配置、调配、皮肤和成就沿原私有目录使用。

你已停服。将新服务器包上传到 `/root/updates` 后执行：

```sh
tar -xzf /root/updates/Stronghold-Protocol-3-server-light-v1.1.0-emi-friends-20261105.tar.gz --strip-components=1 -C /root/w3
cd /root/w3
npm ci --omit=dev
node tools/clear-unfinished-matches.mjs --stopped
node --env-file=config/server.env server/product/game-server.js
```

若原来使用其他环境文件或进程管理器，继续沿用原路径与启动方式，不新建账号或空存档。清理工具只按既有政策处理没有最终结果的未完成局；可靠pending保留。数据库结构升级为schema2，旧服务器程序不能直接打开升级后的库运行。

首次启动后，用浏览器管理员登录“赛季与战绩”，在旧规则迁移表单填写新季名称、原因和确认文字“保留对局并清理旧赛季”，执行一次。它只清旧排位规则的赛季/积分/榜单，旧对局转普通对局；新规则已经产生的当前或历史赛季全部保留。无可靠待结算和进行中局才可执行。若还没有新规则当前赛季，此操作直接开启新季；否则继续已有新季。新玩家可进行三场定级，管理员也可有理由为指定账号直接定级。

以后正常换季：先建新规则草稿，选择下一季，开始收尾，等所有局结清自动切换。新规则旧赛季正常归档并可查询，不再运行旧规则清理。日常软件更新不等于换季，不自动重置积分。

Android覆盖安装 `stronghold-protocol-v1.1.0-emi-friends-full-android.apk`，保持原包名与签名；Windows将 `stronghold-protocol-v1.1.0-emi-friends-full-windows-x64.zip` 解压到新目录并运行其中 `Stronghold.Protocol.exe`，保留同目录完整资源文件。原用户目录中的服务器地址和设置继续使用，旧短期登录需重新登录；主动勾选后可记住设备30天。

标题页、主大厅、主要入口与原版战斗保持上游风格；功能内部页面更新为排位/档案/熟人/模式详情等。浏览器继续用于管理，游玩使用客户端。

具体数值、数据保留清单、后台功能和未来上游适配点见 [实施设计](EMI-ADAPTATION-1.1.0.md)。测试、包大小和SHA以配套报告为准，不以文档示例代替真实部署结果。
