# 1.2.0 水月整备视角与盟约栏修复更新

包名：Stronghold-Protocol-3-server-light-v1.2.0-mizuki-prep-camera-bonds-20261109-fix1.tar.gz。

这是累计服务器源码更新：保留此前1.2.0的水月/深蓝之树、管理员水月管理、房间人数约束、分队确认及requestId兼容修复，新增地图下方整备区、完整地图绘制、按实际战场自适应取景和原版盟约栏收起按钮。版本仍为1.2.0。

## 更新步骤

将新包上传至服务器 `/root/updates/`。先用原来的服务管理方式停止游戏服务，避免解包时继续写入或启动第二个实例。以下按现有安装目录 `/root/w3` 编写；如实际目录不同，请替换该路径。

```sh
tar -xzf /root/updates/Stronghold-Protocol-3-server-light-v1.2.0-mizuki-prep-camera-bonds-20261109-fix1.tar.gz --strip-components=1 -C /root/w3
cd /root/w3
npm ci --omit=dev
```

然后用原服务管理器重新启动。只有原来手动运行Node时才执行：

```sh
cd /root/w3
node --env-file=config/server.env server/product/game-server.js
```

使用systemd/PM2时沿用已有服务名和配置重启，不要同时运行上面的手动启动命令。此包不包含私有账号库、玩家存档或config/server.env，不需清库。

## 客户端与素材

- 已安装1.2.0/build49完整Android/Windows客户端：无需重装。所有玩家完全退出客户端，再重新打开，加载服务器的新JS。
- 若仍是1.1.x的line1.0/build48客户端：必须使用此前已交付的1.2.0/build49完整客户端。服务器轻量包不包含完整素材，也不能代替客户端升级。
- 客户端资源标识维持1.2/build49、contract2/epoch1；本次不新增素材，不需要另装资源补丁。浏览器管理员后台刷新。

## 更新后核验

进入水月的新整备场景，确认干员出现在地图下方整备区，小地图视角按实际尺寸放大，大地图完整框入战场与整备区；顶部盟约栏最左侧有左右箭头，可收起和重新展开。收起会关闭当前盟约详情。

本次仅本地构建与核验，未上传或部署。最终包大小、SHA256和解包校验见工作区外层reports/mizuki-prep-release-20261109/。
