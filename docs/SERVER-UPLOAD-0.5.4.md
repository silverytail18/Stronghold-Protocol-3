# 0.5.4 服务器更新安装流程

本包包含当前0.5.4公开源码、完整运行资源、当前预生成固定资源包和兼容的安卓／Windows轻量联机客户端。包含20／24阶梯回合修订及30回合扩展；16／18仅从新开局目录退役，不删除旧对局记录或旧公开设置。保留其他内容包当前实现。不自动上传或部署。

文件名：`Stronghold-Protocol-3-server-light-v0.5.4-round-extensions-20261012.tar.gz`，配套同名`.sha256`及`.manifest.json`，在工作区项目外`release-packages/`。压缩包根目录为`w3-release/`。

排除config、storage、环境文件、私有自定义状态路径、账号／数据库／WAL／SHM、测试开放设置、签名、node_modules、编译缓存及完整／单机安装包。已有安装包和固定素材不重建。本次更新保留账号ID、密码哈希、权限、禁用状态、赛季、段位、积分、战绩及审计。

## 1. 上传、校验及暂存

上传压缩包和SHA文件到`/root/updates/`，至少使用Node.js 22.16.0。沿用`/root/w3`部署目录和`/root/w3/config/server.env`，不要复制发布包替代原配置。

在同一个SSH终端执行：

```bash
set -e
mkdir -p /root/updates
cd /root/updates
node --version
sha256sum -c Stronghold-Protocol-3-server-light-v0.5.4-round-extensions-20261012.tar.gz.sha256
SP_UPDATE_STAGE="$(mktemp -d /root/w3-update-054-XXXXXX)"
tar -xzf Stronghold-Protocol-3-server-light-v0.5.4-round-extensions-20261012.tar.gz -C "$SP_UPDATE_STAGE"
```

## 2. 等待对局结束，停服更新

暂停新局，等待已有对局结束。在运行原前台服务器的终端按Ctrl+C，确认服务已停止。`--stopped`是更新工具的停服确认参数，不能替代实际停止进程。

回到前面创建暂存目录的SSH终端执行：

```bash
node --env-file="/root/w3/config/server.env" "$SP_UPDATE_STAGE/w3-release/tools/update-project.mjs" --source "$SP_UPDATE_STAGE/w3-release" --target /root/w3 --stopped
cd /root/w3
npm ci
npm run resources:build
node tools/check-resource-pack.mjs
```

更新工具先备份，再复制公开文件。记录其输出的`/root/w3/.backups/时间戳`位置；配置、持久数据和内部／外部自定义路径的账号、成绩及测试开放设置均保留并备份，WAL／SHM保留。测试已验证旧账号可在新服务重启后使用原密码登录，积分、赛季、记录、权限及审计保持。

包内已有固定资源，无需重新抓取素材或运行全量游戏数据生成。实际部署目录可能残留旧公开素材，因此必须在目标目录执行资源构建和只读检查；确认`status`为`ready`后启动。工具仅对退役素材清单中旧发布哈希一致的公开文件先备份再清理；未知文件、自定义素材及私有状态保留。若检查失败，保留输出并处理错误，不继续启动。

## 3. 沿用原配置启动

```bash
node --env-file="/root/w3/config/server.env" "/root/w3/server/index.js"
```

该命令以前台运行，保持原启动习惯。另开SSH终端核对：

```bash
cd /root/w3
node -p "require('./package.json').version"
curl -fsS http://127.0.0.1:3000/healthz
```

版本应为`0.5.4`。示例健康检查端口3000须换为原配置的实际端口，不改server.env。确认原账号登录、管理权限、积分／赛季／对局记录、后台测试开放设置均正常。

## 4. 客户端与测试项

现有兼容安卓／Windows联机客户端无需重装。完全退出后重开，加载新代码与测试目录；本次固定资源版本不变，已有完整且匹配的本地资源直接复用，代码与清单仍按原更新机制校验。如旧服务器没有当前固定素材，只在局外更新差异资源。离线安卓APK本次没有重建。

管理员可选20／24／30，三者互斥且标准模拟不生效。30默认不对普通用户开放，需在账号管理网页后台显式开放；原20／24公开设置保留。检查主线／隐藏顺序20／21、24／25、30／31，16／18不再提供新开局项。旧对局记录不迁移或重算积分。

## 回退

保留此前的服务器更新包及本次自动备份。自动备份不是完整旧源码回滚包；需要回退时先停服，再把保留的旧服务器包暂存，用同一保留数据更新工具替换公开源码，安装依赖、构建及检查资源后沿用原环境启动。不能用旧数据库覆盖更新后产生的新成绩。本次没有数据库结构迁移。
