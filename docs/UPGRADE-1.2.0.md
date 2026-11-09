# 1.2.0 更新：服务器与双端完整客户端

## 服务器修订 fix1（2026-11-08）

后续修订包 `Stronghold-Protocol-3-server-light-v1.2.0-mizuki-admin-20261108-fix1.tar.gz` 累计基础1.2.0，新增浏览器管理员「水月存档」管理与水月满员开局限制，详见 [MIZUKI-ADMIN.md](MIZUKI-ADMIN.md)。已更新1.2.0者只需停止服务器、用修订包按下文同样方式覆盖重启，客户端完全退出重开；不需要重装build49或再次分发素材。仍在fix8-r2者也可直接用此修订包升到1.2.0，并安装原1.2.0完整双端客户端。原基础包不包含本轮修复。

本次升级基线为 `Stronghold-Protocol-3-server-light-v1.1.1-cyclops-emblem-20261108-fix8-r2.tar.gz`，可直接覆盖到1.2.0，无须先安装fix9或早期水月候选包。服务器包名为 `Stronghold-Protocol-3-server-light-v1.2.0-20261108.tar.gz`。完整Android和Windows客户端均为1.2系列/build49，contract2/epoch1；原应用包名、签名与资源更新公钥保持。旧1.0系列客户端需要安装新完整客户端。

累计纳入fix8-r2、fix9舟铲铲平衡、水月与深蓝之树、炸惊模拟，以及当前已完成的地图、难度选择、原版共享房间和人数调整。水月房主在等待室左下角可调整1–4人，缩容保护已占用席位。手机仅横屏，保留“请将设备横屏”遮罩，横屏长内容可上下滚动。

## 服务器

先结束进行中的普通对局、待结算结果与旧水月探索，再停止原服务。将服务器更新包上传到 `/root/updates`，使用原代码目录 `/root/w3`：

```sh
tar -xzf /root/updates/Stronghold-Protocol-3-server-light-v1.2.0-20261108.tar.gz --strip-components=1 -C /root/w3
cd /root/w3
npm ci --omit=dev
node --env-file=config/server.env server/product/game-server.js
```

使用systemd或PM2时，更新文件、安装依赖后通过原管理器启动，沿用原工作目录、环境文件和产品入口，不要手动重复开第二个实例。本轮只生成本地包，未上传或部署。

不删除或重建私有数据目录，不清空账号、赛季积分、战绩、调配、记住设备、音乐、内容包或玩法开放配置。原账号库schema2保持，水月使用独立schema1的mizuki.sqlite，第一次启动按现有代码初始化缺失的水月库。不要复制开发机的私有数据库。保留原 `config/server.env` 和其他未知私有文件；整个目录迁移时应保持账号及水月存档配套。

服务器包内含新的 `client-updates/client.json` 和经原公钥验证的 `inventories/` 签名资源目录，不包含完整素材或安装器。必须一起覆盖，不能只上传源码或仅替换client.json。无需再安装早期水月资源差量包或地图补充包；本次完整素材直接内嵌双端客户端。旧差量文件可留在磁盘，新描述符不会引用它们，不需要删除。

## 客户端

- Android：覆盖安装 `stronghold-protocol-v1.2.0-full-android.apk`，不要卸载旧应用或清除应用数据。保持原包名和签名，以保留服务器地址与应用数据。
- Windows x64：解压 `stronghold-protocol-v1.2.0-full-windows-x64.zip` 的整个目录，再运行其中 `Stronghold.Protocol.exe`。需要Microsoft Edge WebView2运行时；用户数据位置保持，不要删除旧用户目录。

双端完整资源已内嵌，首次打开需校验/安装本地资源。请等待完成后登录原服务器，继续使用原账号。游戏服务器不提供散素材回源。版本切换后所有客户端完全退出再打开并新建对局。

## 开放策略和兼容边界

沿用已有 `product-mode-policy.json` 中显式设置与未知字段；水月默认关闭。管理员在浏览器 `/account` 的“玩法开放”中按现有策略决定何时开放，不因发布自动改写已有设置。水月接入不计排位，普通与舟铲铲保持各自规则。

水月探索按规则摘要与资源摘要冻结。本轮版本/协议及资源代际变化会改变摘要；旧探索必须在原版本完成，不能通过手改哈希、删除存档或放宽校验继续。未进行真实存档迁移，运行中的对局不能热迁移。

完整五六层通关、全部首领技能、原生实机、压力与全量CI的既有验收限制仍保留。本轮构建、归档核验、基线覆盖演练及精确SHA以外层 `reports/release-1.2.0-20261108/` 最终交付记录为准。房间与后续上游适配见 [MIZUKI-ROOM.md](MIZUKI-ROOM.md) 和 [MIZUKI-INTEGRATION.md](MIZUKI-INTEGRATION.md)。

## 完整客户端资源目录

`client-updates/client.json` 的可选 `inventory` 指向 `inventories/<SHA256>.json`。使用既有RSA-SHA256资源签名封装，from/to均为完整客户端的目标摘要，blobs为空；启动时验证封装摘要、原公钥签名、目标资源摘要、clientLine和epoch。它只用于验证完整客户端的目标目录，不作为差量下载清单，也不开放完整素材下载路由。旧描述符无此字段时保留原行为，原有差量更新仍独立验签。
