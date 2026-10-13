# 0.5.5 服务器更新安装流程

本次包为`Stronghold-Protocol-3-server-light-v0.5.5-doctor-projection-20261013.tar.gz`，同名`.sha256`与`.manifest.json`在项目外release-packages。包含当前公开源码、运行素材、当前预生成资源包及安卓／Windows轻量联机客户端；不包含账号、配置、数据库、签名、完整／单机客户端包。不自动上传或部署，旧0.5.4包保留。修复范围见[博士投影修复](DOCTOR-PROJECTION-0.5.5.md)。

上传压缩包和SHA文件到`/root/updates/`，Node.js至少22.16.0。同一SSH终端执行：

```bash
set -e
mkdir -p /root/updates
cd /root/updates
node --version
sha256sum -c Stronghold-Protocol-3-server-light-v0.5.5-doctor-projection-20261013.tar.gz.sha256
SP_UPDATE_STAGE="$(mktemp -d /root/w3-update-055-XXXXXX)"
tar -xzf Stronghold-Protocol-3-server-light-v0.5.5-doctor-projection-20261013.tar.gz -C "$SP_UPDATE_STAGE"
```

暂停新局，等待当前对局结束，在原前台服务终端Ctrl+C并确认停服。回到上面创建暂存目录的SSH终端执行：

```bash
node --env-file="/root/w3/config/server.env" "$SP_UPDATE_STAGE/w3-release/tools/update-project.mjs" --source "$SP_UPDATE_STAGE/w3-release" --target /root/w3 --stopped
cd /root/w3
npm ci
npm run resources:build
node tools/check-resource-pack.mjs
```

--stopped只表示确认已停服，不替代停止进程。工具先备份后复制，记录输出的/root/w3/.backups/时间戳。原config、storage、环境文件、内部／外部自定义状态目录及账号／成绩／测试开放设置、WAL／SHM、签名保留并备份，不删除或重建玩家数据。账号ID、密码哈希、权限、赛季、积分、段位、战绩及审计保持。

实际部署目录可能残留旧公开素材，因此复制后仍须构建并只读检查资源，确认status为ready后启动；若失败，保留输出并处理，不继续启动。本次固定资源不变，不抓取素材或运行全量游戏数据生成。旧公开素材仅按明确退役清单和旧哈希先备份再清理，自定义文件与私有状态保留。

沿用原启动命令和原环境配置：

```bash
node --env-file="/root/w3/config/server.env" "/root/w3/server/index.js"
```

另开终端验证版本与健康状态，3000换为实际配置端口：

```bash
cd /root/w3
node -p "require('./package.json').version"
curl -fsS http://127.0.0.1:3000/healthz
```

应为0.5.5。检查原账号可登录、权限／积分／记录／公开设置正常；已有安卓／Windows联机客户端完全退出后重开，加载新代码即可，无需重装或清缓存。匹配的固定资源继续复用，只有代码和清单按原更新机制校验。独立单机APK本次没有更新。

局内检查：普通干员已有两件装备时拖入普通博士投影，应显示替换弹窗；取消／Esc保持原装备和投影；选第二件确认，只销毁第二件，保留第一件并装备投影。下回合销毁投影并晋升，第一件按原规则返回整备区。进阶投影仍立即晋升、不要求占格替换。

回退需先停服，再把保留的旧服务器包暂存，使用保留数据更新工具替换公开源码，安装依赖、构建及检查资源后沿用原环境启动。自动备份不是完整旧源码回滚包，不用旧数据库覆盖更新后新增战绩；本次无数据库结构迁移。
