# 0.5.2 莱茵生命服务器更新流程

源码0.5.2，rhine-lab-v1／rhine-test-3／能力31，禁用weight和banWeight均0，默认私有。保留卡兹戴尔9、罗德岛15、岁与企鹅9及其现有权重与数值。

最终更新包：Stronghold-Protocol-3-server-light-v0.5.2-rhine-revision-20261012.tar.gz，同名.sha256与.manifest.json在项目外release-packages。本包用于本轮已验证的数值及显示修订；此前0.5.1包保留为历史。未自动部署，受控战斗平衡评估与真人经济验证边界见[RHINE-BALANCE-0.5.2.md](RHINE-BALANCE-0.5.2.md)。

包包含公开源码、完整运行资源、预生成固定资源更新包与原兼容轻量客户端。排除config、storage、私有自定义状态路径、账号／数据库／WAL、签名、node_modules、编译缓存与完整／离线安装包。

沿用/root/w3、/root/w3/config/server.env及原启动环境；Node至少22.16.0。上传压缩包及SHA文件到/root/updates，同一SSH终端执行：

```bash
set -e
mkdir -p /root/updates
cd /root/updates
node --version
sha256sum -c Stronghold-Protocol-3-server-light-v0.5.2-rhine-revision-20261012.tar.gz.sha256
SP_UPDATE_STAGE="$(mktemp -d /root/w3-update-052-XXXXXX)"
tar -xzf Stronghold-Protocol-3-server-light-v0.5.2-rhine-revision-20261012.tar.gz -C "$SP_UPDATE_STAGE"
```

暂停新局，等待已有对局结束，按原方式停服。前台进程在原终端Ctrl+C；systemd／PM2用原服务名停止。确认进程已停，再执行：

```bash
node --env-file="/root/w3/config/server.env" "$SP_UPDATE_STAGE/w3-release/tools/update-project.mjs" --source "$SP_UPDATE_STAGE/w3-release" --target /root/w3 --stopped
cd /root/w3
npm ci
npm run resources:build
node tools/check-resource-pack.mjs
node --env-file="/root/w3/config/server.env" "/root/w3/server/index.js"
```

更新工具先备份私人配置和持久数据再复制公开源码，记录输出的.backups/时间戳。保留旧账号ID／密码哈希／权限／赛季／积分／记录／审计、后台测试公开设置、所有环境文件、外部数据路径和签名，不删WAL。本包已有固定资源，无需再次抓素材或运行全量数据生成；部署目录可能残留旧版本素材，因此复制后须在实际运行目录执行npm run resources:build及只读检查，确认status为ready再启动。若由进程管理器运行，沿用原启动命令和环境，不另启第二个服务。

备份不是完整旧源码回滚包。需要回退时先停服，以保留的旧服务器包暂存源码运行同一更新工具，再npm ci并按原环境启动；本轮无数据库结构迁移，不用旧数据库覆盖新增成绩。

另开终端核对实际配置端口：

```bash
curl -fsS http://127.0.0.1:3000/healthz
cd /root/w3
node -p "require('./package.json').version"
```

确认0.5.2、旧账号／权限／积分／记录及公开设置仍在。完全关闭后重开现有安卓／Windows联机客户端，加载能力31代码；无需重装，新增莱茵／专项研究固定资源须在局外完成增量准备，原匹配文件复用。离线APK本轮不更新。

管理员开新局启用莱茵生命；普通用户需在网页后台显式开放本包。检查三人入口、研究点、滚动树、二维互斥选格／六色标记、休整下三人暂停且保留、战斗减员不降档。与24回合同时启用检查前置与预算；未选包保持基线。旧内容包可继续选择，原公开设置不会由更新自动改变。

新增核对：标题右上角v0.5.2可点，选择模式页无版本入口，简介精确为莱茵生命科技调整与显示修复；高台可选T01/T02/T03，专项研究四形态2/4档共享两套独立CD，图鉴／招募／装配没有多萝西。当前固定资源7486文件／474.4MiB。

## App提示“服务器尚未生成资源包”

该提示也可能代表资源包存在但与运行目录不匹配。旧更新工具只复制新文件，不移除已退出的素材；例如0.5.0多萝西19文件残留，会导致App资源接口resourcePack为null。当前修复工具按tools/retired-resources.json限定公开素材路径和旧发布哈希，备份到.backups/时间戳/retired-resources后才清理；自定义修改、不在清单内或受私有状态保护的文件保留。该资源清理机制本身不调整战斗参数；本轮科技变化以0.5.2规则为准。

已有服务器可直接在/root/w3执行npm run resources:build，随后按原方式重启服务并完全关闭重开App，无需重装或清空客户端缓存。生成失败时保留错误输出，不运行全量素材抓取覆盖已有数据。修复包中的node tools/check-resource-pack.mjs为只读检查，区分missing、stale、missing-archive、ready，列出最多20个不匹配路径，不输出配置或密码。

本次仅按用户要求修改规则与显示。T13改九人临时战斗身份，移除一次聘任；每场开战重查科技门槛。百科与对局记录应显示测试角色名称、特质、策略、装备与头像；旧记录不迁移、不重算积分。0.5.1及更早的原包保留，本次请用rhine-revision包。
