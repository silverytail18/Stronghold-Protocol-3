# 固定资源数据包与客户端更新

安卓和 Windows 原生客户端使用持久文件库，不依赖 WebView 的临时 HTTP 缓存。电脑和手机浏览器仅提供登录、账号 / 赛季管理及主动下载客户端，禁止访问游戏资源和游戏 WebSocket。账户页面只加载专用脚本与样式，不预加载游戏素材。

## 内容与版本

包内包含 `public/assets/`、`public/fonts/`、`public/icons/` 下允许的美术、Spine、音频、字体、CSS、OBJ 和棋盘 JSON，以及明确列出的公开 `data/*.json` 游戏内容。`data/config.json` 是公开玩法数据；它与私有的 `config/server.env`、`config/auth-users.json` 是不同文件。

不收录 `config/`、`storage/`、外部数据目录、`.env*`、账号、密码、排位数据库、WAL、审计、安卓签名、HTML 或 JavaScript。打包工具不启动游戏服务器，不初始化账号，不迁移数据库。

`resource-packs/current.json` 是小型版本描述；版本目录清单列出每个文件的路径、SHA-256、大小和类型。ZIP 内使用 `files/<SHA-256>` 保存文件，内容相同的文件只存一次。服务器的资源接口继续要求登录，App 标记不提供权限。

## 首次使用与更新

1. 登录后、加载游戏页面前，原生客户端读取小型服务器版本描述。
2. 完整版客户端先校验并解包安装包内资源；版本一致时无需下载资源文件或完整清单。轻量版首次下载并校验完整 ZIP。
3. 文件存放在应用私有目录，以内容哈希命名。再次进入只获取版本描述；清单与全部资源在本地复用。
4. 版本变化时读取新清单，只下载本地缺少、变化或损坏的文件；新版本全部校验成功后，原子切换清单。已有正确文件不会重复下载。更新失败可以重试，旧清单保持原样；完整 ZIP 下载支持断点续传。
5. 标题页 / 大厅继续提供「从服务器更新数据」。开局请求之前检查最新版本；资源、规则或代码更新时刷新整个页面再准备新资源。对局中不执行切换。

游戏页面仍由服务器提供 HTML、JavaScript、认证、账号成绩和对局通信。固定规则数据只在版本一致后由本地读取；本地包不能绕过登录，也不用于离线联机。资源包失效或未生成时，新客户端阻止进入游戏并提示服主生成包；浏览器仅开放账号页面；旧 App 可以沿用原有 HTTP 缓存，但要实现完整的本地资源包读取，必须安装新版客户端。

服务端在固定资源发生变化后必须重新生成包。新规则与旧包不匹配时不会被当成最新包提供给客户端。

## 构建与分发

准备完整素材后，在项目目录执行：

```bash
npm run resources:build
npm run mobile:build
npm run mobile:build -- --embed-resources
npm run windows:build
npm run windows:build -- --embed-resources
```

Windows 构建需要 .NET 8 SDK；发布产物自带 .NET 运行时。运行客户端需要 Microsoft Edge WebView2 Runtime。安卓沿用项目原签名、包名和 API 26 最低版本。构建需保留 `mobile/android/.signing/`，不可向玩家分发签名目录。

分发以下文件即可；不要打包整个工作区交给玩家：

| 文件 | 用途 |
| --- | --- |
| `mobile/dist/stronghold-protocol.apk` | 安卓轻量版，首次从服务器下载资源 |
| `mobile/full-dist/stronghold-protocol-full.apk` | 安卓完整资源版，单独保存，安装包预置 ZIP |
| `mobile/dist/stronghold-windows.zip` | Windows x64 轻量版，解压运行 `Stronghold.Protocol.exe` |
| `mobile/full-dist/stronghold-windows-full.zip` | Windows x64 完整资源版，单独保存，解压后保留同目录资源文件 |
| 对应 `.sha256` | 分发文件的校验摘要 |

服务器项目的 `mobile/dist/` 仅保留安卓和 Windows 两种轻量版及校验文件，玩家可访问 `http://服务器地址:端口/downloads` 下载，无需先登录。页面和下载白名单只允许这两种轻量版，即使部署目录残留旧完整包，完整包及其校验文件的 GET / HEAD 请求也返回 404。不开放目录浏览或签名、配置文件下载。`mobile/full-dist/` 单独保存两端完整包和 Windows 完整版解压目录，不上传游戏服务器，不被源码更新工具复制。后续 `--embed-resources` 构建也输出到该目录。资源包 API 仍要求登录。新版轻量客户端文件替换后，下载页自动显示其大小。

完整包可预先通过其他静态下载服务分发；内置资源版不需在游戏服务器重复下载相同素材。客户端未预置的资源更新通过已登录的游戏服务器接口获取。初次解包时需要为安装包、解包后的文件和临时文件预留空间，当前建议至少 1.2 GiB 可用空间。

已有持久资源包的玩家升级客户端时使用轻量版，保留原应用数据；无需再次下载包含相同素材的完整安装包。v0.2.8 与 v0.2.7 使用同一固定资源内容版本，这次客户端升级只更新客户端代码。安卓必须沿用原签名覆盖安装，Windows 继续使用同一用户的本地资源目录。清空缓存或卸载安卓 App 后则需要重新准备资源。

安卓资源目录为应用私有 `files/resources/`，Windows 为 `%LOCALAPPDATA%/StrongholdProtocol/resources/`。更换服务器使用独立清单，相同内容可复用。卸载安卓 App 或主动删除资源目录后需要重新准备；更新客户端版本继续保留本地文件。旧哈希文件保留，以便失败恢复和不同服务器复用。

## 更新现有 Linux 部署并保留玩家数据

本地修改不会自动更新云服务器。先将新版源码目录上传到独立位置，例如 `/root/w3-release`，避免覆盖正在运行的 `/root/w3`。等待已有对局结束后，停止当前前台 Node 进程。

```bash
node /root/w3-release/tools/update-project.mjs --target /root/w3 --stopped
cd /root/w3
npm ci
npm run resources:build
node --env-file="/root/w3/config/server.env" "/root/w3/server/index.js"
```

更新工具在复制前备份并保留现有配置、默认或自定义持久化目录、账号、数据库和签名；不删除 WAL，不更换已有账号，不改变数据路径。新版素材和 `resource-packs/` 属于可替换静态内容；`mobile/dist/` 仅复制两种轻量客户端及校验文件，排除完整包、其他文件和编译目录。不要将发布目录中的 `config/` 或 `storage/` 手动覆盖到现有部署。包生成后再让新客户端连接。

## 打包 Linux 上传项目

`npm run server:release -- --output ../release-packages/Stronghold-Protocol-3-server-light-v0.2.8-20261006.tar.gz` 会生成可上传的源码包、SHA-256 和逐文件清单。运行需要系统 `tar`；解压后顶层目录固定为 `w3-release/`。包含源码、公开游戏数据、完整运行素材、资源更新包、前端库，以及两种轻量客户端。不包含 `config/`、`storage/`、环境文件、账号 / 数据库、自定义持久化路径、签名、node_modules、完整客户端或编译缓存。完整客户端安装包与服务端资源更新 ZIP 是不同文件，更新 ZIP 必须保留，供轻量版首次局外下载及后续更新。

上传包已有生成好的素材和资源版本清单，无需重新抓取素材。安装与更新步骤见 [SERVER-UPLOAD.md](SERVER-UPLOAD.md)。

后续新增角色、美术、盟约、道具或调整公开规则后，在源码和固定文件准备完成时重新运行 `npm run resources:build`，随后按上述保留数据流程发布。游戏代码变化且固定内容未变化时，客户端只刷新代码，无需重下资源。

## 验证范围

```bash
node --test test/browser-account-only.test.js test/resource-pack.test.js test/app-cache.test.js test/mobile-app.test.js test/auth.test.js test/auth-admin.test.js test/app-update.test.js test/update-preservation.test.js test/state-storage.test.js
```

覆盖包内白名单、内容去重、确定性构建、缺失资源拒绝、认证和路径检查、过期包拒绝、Android ZIP/文件校验与失败保留，以及 Windows 实际 HTTP 首次下载、重复启动、代码更新、单文件更新、损坏修复和预置包零资源下载；检查真实项目全部资源的普通 / 编码 / 查询参数 / 版本化路径和 HEAD 本地读取，缺失或版本不一致不会回退下载。新增 Windows Chromium 实际登录与账户导航测试，验证零游戏资源请求及零游戏 WebSocket。原生检查需要 JDK 与 .NET 8 SDK。

v0.2.8 的实际结果及验证边界见 [VERIFICATION-0.2.8.md](VERIFICATION-0.2.8.md)。已有部分正确资源、但保留未完成 ZIP 下载时，客户端只补齐缺少的文件，避免续传 ZIP 中重复包含已完整保存的资源；完全没有完整文件时才续传整包。

观战与 Boss 渲染专项检查：`node --test test/resource-scenes.test.js`。需要 .NET 8 SDK、Chrome / Edge（可用 `CHROME_PATH` 指定）和已构建的 Windows 完整版。测试编译客户端实际使用的 `ResourceCache.cs`，通过测试传输层将本地读取结果交给真实 WebGL 游戏渲染器；关闭浏览器 HTTP 缓存，记录真实服务器收到的请求。对局状态由测试场景提供，包含准备阶段查看队友、普通战斗观战、最终攻势、隐藏 Boss 和淘汰后切换 Boss 战场；此检查不替代云端多人实战或原生设备测试。详细请求记录写入 `.cache/resource-scene-results.json`。

参考：[Android WebView 请求拦截](https://developer.android.com/reference/android/webkit/WebViewClient)、[WebView2 请求拦截](https://learn.microsoft.com/microsoft-edge/webview2/how-to/webresourcerequested)。真机安装、WebView 音频 / WebGL 和 Windows 界面仍需设备实测。


0.4.0卡兹戴尔：本局覆盖、成长与战斗接口、固定素材及验证范围见[KAZDEL-0.4.0.md](KAZDEL-0.4.0.md)。正式data JSON不改，公开规则和新素材随局外资源包更新，未选包不激活。

## 0.5.1 部署目录残留修复

App显示“尚未生成资源包”也可能是资源清单与现有目录不匹配。旧工具只复制文件，已退出角色素材可能残留。修复版更新工具对tools/retired-resources.json中的明确退出文件核对旧哈希并先备份再清理，不清理自定义修改或私有路径；部署后在实际项目根运行npm run resources:build，再用node tools/check-resource-pack.mjs只读确认ready。该操作不抓取远程素材、不改账号或数据库；现有客户端重开即可，无需清空缓存。当前修复包与流程见[SERVER-UPLOAD-0.5.1.md](SERVER-UPLOAD-0.5.1.md)。
