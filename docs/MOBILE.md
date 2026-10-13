# 安卓 App：登录与游玩

v0.2.8 禁止电脑和手机浏览器游玩，只提供账号管理；原生持久资源包：登录后在局外准备完整资源，再由本机直接读取；支持内置资源 APK 和按文件增量更新。构建、分发和保留线上数据的更新流程见 [RESOURCE-PACKS.md](RESOURCE-PACKS.md)。

安卓客户端通过系统 WebView 加载自己部署的服务器，复用原有游戏、登录 Cookie 和 WebSocket。轻量版首次使用从服务器下载完整资源包，完整版预置美术 / 音频和公开规则；之后按内容版本复用本机持久文件。代码与规则版本继续实时校验，服务器更新后在新对局前刷新。它不是离线游戏。APK 不包含服务器密码、账号文件或排位数据库。服务器继续从源码运行，不需要 Docker、域名或 HTTPS。缓存和保留数据的更新流程详见 [RESOURCE-PACKS.md](RESOURCE-PACKS.md) 和 [RANKED.md](RANKED.md)。

## 管理员界面在哪里

用手机或电脑的**浏览器**打开以下地址，把 IP 和端口替换为自己的配置：

| 功能 | 地址 |
|---|---|
| 管理员后台：创建 / 管理用户、修改管理员密码 | `http://公网IP:3000/admin` |
| 普通用户修改自己的密码 | `http://公网IP:3000/account` |
| 登录（浏览器进入账号页；安卓 App / Windows 客户端可游玩） | `http://公网IP:3000/` |

首次启动且没有账号文件时，管理员为 `admin` / `Stronghold@123456`。先通过浏览器登录并修改初始密码，再创建玩家账号。玩家的新账号或被重置密码的账号，也需要先在浏览器 `/account` 修改初始密码，然后才能在 App 登录。

**App 内提供连接设置、登录、游玩、服务器数据更新和退出登录。** 管理员在 App 登录后也进入游戏；App 不显示管理员后台、用户修改密码页面或它们的入口。尝试加载这些页面或调用账号管理接口会被拒绝。电脑和手机浏览器仅用于登录、修改密码和管理账号 / 赛季，不提供游戏页面、游戏资源或游戏 WebSocket。客户端下载见 `/downloads`，页面只在用户主动点击下载时传输安装包。

App 使用 `StrongholdProtocolApp/1` 的 User-Agent 标记。服务器返回 App 状态以选择登录后的页面、隐藏账号管理入口，并拦截账号页面 / 接口；原生客户端另外限制导航地址和账号资源。该标记只用于客户端功能区分，不能代替身份认证或管理员权限检查。普通用户即使换用浏览器，也不能操作管理员接口。

## 安装和使用 APK

1. 先将本次修改后的服务器源码部署到云服务器并重启。沿用 [AUTH.md](AUTH.md) 中的 HTTP 配置，例如：
   ```bash
   SP_AUTH=on SP_AUTH_COOKIE_SECURE=0 HOST=0.0.0.0 PORT=3000 npm start
   ```
   云安全组和服务器防火墙放行 TCP 3000，素材通过原项目的 `npm run setup` 准备。
2. 将构建产物 `mobile/dist/stronghold-protocol.apk` 传到安卓手机，点击安装。系统要求允许对应浏览器或文件管理器安装此 APK 时，按提示操作。
3. 首次打开填写 `http://公网IP:3000`，点击「连接并登录」。不要附加 `/admin`、`/account` 等路径。
4. 输入已经在网页完成初始密码修改的账号，登录后进入游戏。游戏页面自动使用横屏；横屏自动隐藏顶部状态栏，竖屏恢复显示，登录页面允许正常旋转。游戏的全屏按钮还可隐藏底部导航栏。切回 App 或退出网页全屏时，会按当前方向重新应用状态栏设置。
5. 标题页 / 大厅底部账号栏有「从服务器更新数据」和「退出登录」。点击更新会重新读取服务器版本并刷新游戏页面；代码、规则、账号积分等重新读取，美术资源未改变时复用本机缓存，改变后从新版本地址下载。网络失败会提示重试，不会清除登录、账号、战绩或设置。更新只在标题页 / 大厅提供，对局中不会刷新。
6. 按系统返回键可选择继续游戏、退出 App 或连接设置；切换服务器时会断开原有游戏连接，清除 App 中原服务器的 Cookie 和网页存储。

结算页左侧的对局详情和段位信息支持独立上下滑动，「返回同盟 / 返回大厅」固定在左侧底部。右侧同盟成员报告保持独立滚动；手机横屏或较矮窗口中也能操作返回。

支持 Android 8.0（API 26）及以上、具备 OpenGL ES 2.0 的设备。使用系统 Android WebView，建议保持其更新。只申请网络权限，不申请文件、相机、麦克风或通讯录权限。App 的登录状态与外部浏览器独立，因此在浏览器访问后台时需要另行登录。

HTTP 模式与网页相同，不加密密码和会话 Cookie。以后使用 HTTPS 时，可以直接把 App 连接地址改成 HTTPS，同时按认证指南启用服务器 Secure Cookie；App 不绕过证书校验。

## 从源码构建

本仓库提供不依赖第三方 Android 库的 Java 源码和打包脚本。需要 Node.js、JDK 17 或 21、Android SDK Platform 35 和 Build-Tools 35.0.0。

可在 Android Studio 的 SDK Manager 中安装对应 Platform 和 Build-Tools；也可使用官方 `sdkmanager "platforms;android-35" "build-tools;35.0.0"` 安装。SDK 和 JDK 都只用于打包，云服务器运行游戏仍只需要原项目的 Node.js 环境。

Linux / macOS：

```bash
export JAVA_HOME=/实际路径/jdk-21
export ANDROID_HOME=/实际路径/Android/Sdk
npm run mobile:build
```

PowerShell：

```powershell
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
npm run mobile:build
```

或者明确指定 SDK：`npm run mobile:build -- --sdk /实际路径/Android/Sdk`。当前工作区为此次打包准备的 SDK 在 `.cache/android-sdk`；脚本没有显式 SDK 配置时会使用该目录。

输出为 `mobile/dist/stronghold-protocol.apk` 和相邻的 `.sha256` 文件。脚本会编译资源与 Java、生成 DEX、对齐 APK、签名并验证签名。APK 可以直接安装，不需要 Android Studio；当前工程也可在 `mobile/android` 继续开发。

首次构建会在 `mobile/android/.signing/` 生成随机密码保护的分发签名密钥，后续构建沿用它。**备份整个 `.signing/` 目录，更新已安装 App 必须使用同一签名**；不要将该目录上传到仓库或发给玩家。输出 APK、SDK 缓存、签名密钥和本地 SDK 路径都已忽略。换服务器 IP 只需要修改 App 的连接设置，不需要重新打包。

## 验证

```bash
node --test test/auth.test.js test/auth-admin.test.js test/mobile-app.test.js
```

覆盖 App / 网页分流、App 禁止账号页面和接口、普通用户权限、初始密码流程、管理员 App 登录进入游戏、页面没有管理入口，以及原生服务器 URL / 导航规则。原生 URL 用例需要 JDK，否则会跳过；Node.js 服务器测试不需要 Android SDK。

当前构建完成了 APK 编译、签名校验和客户端规则测试。没有连接真实安卓手机或模拟器，尚未做设备上的安装、音频和 WebGL 游戏实测。

实现依据：[Android WebView](https://developer.android.com/develop/ui/views/layout/webapps/webview)、[Android 构建与签名](https://developer.android.com/build/building-cmdline)、[Android SDK Manager](https://developer.android.com/tools/sdkmanager)。
