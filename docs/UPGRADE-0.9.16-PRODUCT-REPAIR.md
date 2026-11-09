# 从 0.9.13 / 0.9.14 / 0.9.15 升级到 0.9.16

本次更新位于隔离候选，尚未部署。必须使用新的服务器更新包和 Android/Windows 完整客户端；客户端最低构建45，系列0.9、contract2、epoch1，完整资源基线为 `41ebe63b7a079fc34814e9e9714b166dff45f1a681d96035497b6278b7f7314a`。旧 ABI2 资源包不能填入新客户端。

服务器包：`Stronghold-Protocol-3-server-light-v0.9.16-product-repair-20261103-r2.tar.gz`，同时提供同名 `.sha256` 和 `.manifest.json`。完整客户端使用 `v0.9.16-product-repair-full-r2.apk` 与 `v0.9.16-product-repair-full-windows-x64-r2.zip`；初始0.9.16服务器包、客户端构建和调试验收APK不是交付入口。

## 1. 核对并准备

沿用原来的账号、权限、赞助、积分、赛季、战绩、环境变量和存储位置。以下命令假设原部署为 `/root/w3`；如果实际启动目录不同，应替换目标路径。保持原来的 `SP_STATE_DIR`、`SP_AUTH_USERS_FILE`、`SP_RANKED_FILE`，包括通过服务管理器注入的值，不能为使新服务启动而改为空目录。

先暂停新开局，等待旧普通局、排位局、pending结算和账号锁完成，再按原来的服务管理方式停服。对局在内存中，运行中的局不能跨引擎保留。不要同时启动新旧两份服务写同一状态库。使用支持 `node:sqlite` 的 Node 版本；本工作区为 Node24.11.1。

将服务器包和校验文件上传到部署目录之外，例如 `/root/update-0916`。不要将完整资源客户端上传到游戏服务器的下载目录。

## 2. 校验并独立解压

```sh
mkdir -p /root/update-0916
cd /root/update-0916
sha256sum -c Stronghold-Protocol-3-server-light-v0.9.16-product-repair-20261103-r2.tar.gz.sha256
tar -xzf Stronghold-Protocol-3-server-light-v0.9.16-product-repair-20261103-r2.tar.gz
cd /root/update-0916/Stronghold-Protocol-3
node tools/state-transfer.mjs inspect --project /root/w3
```

解包源目录和实际部署目录必须相互独立，不能嵌套。核对inspect结果中的状态位置、账号及旧待结算记录；若工具拒绝，不要删除pending或改默认账号库绕过，应由旧版本先处理。未知格式不会自动重置。

## 3. 备份并更新

停服后先保留原部署与外置私有状态的一致快照。`state-transfer` 的 snapshot、verify、restore 操作用法见原 [第一批升级说明](UPGRADE-0.9.14-BATCH1.md) 和工具提示；restore默认仅演练，不能把演练当作已经恢复。

例如使用一个尚不存在、位于Web目录之外的备份路径：

```sh
cd /root/update-0916/Stronghold-Protocol-3
node tools/state-transfer.mjs snapshot --project /root/w3 --output /root/w3-state-before-0916 --stopped
node tools/state-transfer.mjs verify --snapshot /root/w3-state-before-0916
```

若该备份目录已经存在，换一个新的私有备份名称，不删除或覆盖原备份。

```sh
cd /root/update-0916/Stronghold-Protocol-3
node tools/update-project.mjs --source /root/update-0916/Stronghold-Protocol-3 --target /root/w3 --stopped
```

更新器逐文件校验发布清单，并先在原部署 `.backups/upstream-*` 创建私有状态一致快照和源码备份。它保留config、环境文件、账号、SQLite及WAL、签名和未知状态，再替换受管理源码；不会用发布包创建空账号覆盖现有数据。记录输出的备份目录。

```sh
cd /root/w3
npm ci --omit=dev
node -p "require('./package.json').version"
```

版本应为 `0.9.16`。按原来的服务管理方式启动原服务；手工运行的部署才使用 `npm start`。不要在服务管理器已经启动后额外执行第二个 `npm start`。健康页只报告服务是否ok，不能据此判断具体版本。

## 4. 安装完整客户端

Android使用同包名、同签名覆盖安装正式 `stronghold-protocol-v0.9.16-product-repair-full-r2.apk`，不要先卸载。SHA256为 `8aa09196b878ba1a821887da61848b07b6e2ff1c5dffcfe73c295e9bf523edb3`。

Windows将整个 `stronghold-protocol-v0.9.16-product-repair-full-windows-x64-r2.zip` 解压到新目录，再运行其中的EXE；不要只移动EXE。SHA256为 `67da99811e58c016966d85604aa6f9196a70d991aca96f19afe158fab44170b0`。需要 Microsoft Edge WebView2运行时；原用户配置目录保持。

两端填写服务器根地址。完整安装器和基础资源由管理员在游戏服务器以外的渠道提供。兼容小版本签名差量接口保留，本次完整资源不加入服务器下载列表；缺资源也不向服务器请求散素材。

## 5. 升级后核对

- 浏览器打开 `/account`，检查原账号、权限、赞助、赛季和历史；管理员检查版本开放、逐包适用版本及私有权限。
- 正式名单含同charId的测试包整包不可启用，管理员也不能绕过。后台显示冲突原因；不要为启用测试包从正式名单删除角色。
- 房主在开始前选择版本，单人同入口。换版清空全部测试包，切回不恢复；不使用房间版本投票。
- 检查局外皮肤、专三预览和装备报告，局内追踪最多两个盟约。交易员保持重构前的远行入口、界面和文字，无新投资也可准备。
- 成就和统计随账号保存在私有 `account-archive.json`。旧浏览器共享记录需要玩家明确点击导入，避免把公用电脑记录自动归给当前账号；清理本机缓存不是删除服务器档案。
- 玩家反馈发送给服务器管理员；浏览器管理员在后台收件，客户端保留复制诊断信息按钮。独立动感音乐音量在设置中保存。

若更新失败，保持停服，保留FAILED说明和全部备份，按 `update.json` 恢复对应源码。新版本已经产生战绩后，不要直接拿旧整库覆盖；应先保存新增数据并检查回退兼容性。

本次Windows完整客户端已验证17个受控真实战斗帧表现和清场。因用户要求减少电脑占用，最终Golden长回归及新Android完整对局验收已停止，不能将上一版双端14回合结果当成本版通过。完整产物、校验和精确范围见工作区 `reports/product-repair-20261103/DELIVERY.txt`。
