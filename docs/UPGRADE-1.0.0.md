# 1.0.0 服务器与完整客户端更新

本次提供服务器轻量累计更新包、Android完整APK和Windows x64完整客户端ZIP。客户端系列为1.0，构建号47；资源格式contract2、epoch1，原Android包名/签名及资源更新公钥保留。新模型、皮肤语音和原生入口UI需要新完整客户端。旧0.9系列会收到安装新版提示。

账号、密码、成绩、调配/皮肤、后台版本权限、音乐规则及原环境配置继续使用现有数据。不删除数据库或账号文件，不重新创建账号。服务器不分发完整客户端或散素材，客户端完整资源已内嵌。

在旧服务器终端按Ctrl+C并等待服务退出。将 `Stronghold-Protocol-3-server-light-v1.0.0-20261104.tar.gz` 上传至 `/root/updates`，然后依次执行：

```sh
tar -xzf /root/updates/Stronghold-Protocol-3-server-light-v1.0.0-20261104.tar.gz --strip-components=1 -C /root/w3
cd /root/w3
npm ci --omit=dev
node tools/clear-unfinished-matches.mjs --stopped
node --env-file=config/server.env server/product/game-server.js
```

最后一条沿用你原先的环境文件和启动方式；若原来使用其他环境文件或进程管理器，继续使用原配置。本包不包含生产账号、排位数据库、部署专用配置或签名私钥。已完成及待结算记录保留，清理工具只清理旧未完成局。

Android安装 `stronghold-protocol-v1.0.0-full-android.apk`，使用原包名和签名覆盖安装，不卸载原应用。Windows将 `stronghold-protocol-v1.0.0-full-windows-x64.zip` 解压为新目录，完整保留同目录资源文件并运行 `Stronghold.Protocol.exe`；继续使用原用户目录中的服务器地址及登录状态。首次校验会逐项读取完整资源，进度条显示真实进度。

本版包括此前排位、聊天、账号同步、禁止AI队友等服务器功能，以及349套服装模型补齐、20套服装的924条皮肤录音、同账号身份接管、自选专三、卡兹戴尔维什戴尔和双端连接/校验UI。中文/日语各18组，英/韩各15组；缺少的独立皮肤语言按既有规则回退原声。不能据此推断全部时装特效逐帧等价或所有设备性能已验证。

本版同时包含第15首事件曲《难忘今宵》及其完整音频：多人进入实际隐秘核心回合、原始真人成员全员存活且未退出时，沿既有逐曲概率和同批单曲规则参与点播，每局一次。既有音乐开关和概率保留；旧配置缺少新曲时仅为该曲提供默认启用100%的内存值，不重写原音乐配置。

产物大小、SHA256、资源清单及本轮验证边界以配套交付记录为准。此次为本地生成，不自动上传部署。
