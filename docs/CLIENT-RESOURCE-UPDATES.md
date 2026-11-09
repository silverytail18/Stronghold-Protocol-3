# 客户端资源与更新协议

本协议依据用户2026-11-03的新分发要求编写，覆盖此前“服务器任何情况下都不下发资源”的约束。浏览器继续只管理账号；完整客户端安装器由管理员在服务器以外分发。

双端完整构建与资源逐文件校验记录见工作区reports/upstream-batch1-playable-20261102/DELIVERY.md。基线33016文件，兼容系列0.9、contract2、epoch1、最低build43。上线步骤见[第一批升级说明](UPGRADE-0.9.14-BATCH1.md)。

## 三种版本

- 项目版本例如0.9.14；兼容客户端系列为0.9，0.10需要新完整客户端。系列边界由构建常量固定，不能由服务器任意宣称兼容。
- 资源代际epoch用于包格式或资源ABI不兼容变更；epoch变化必须安装新客户端，contract变化同样处理。
- 原游戏四个玩法版本由后台独立设置。它们改变新建房间的数据与规则，不是安装器或热更新的版本号。

客户端在User-Agent中声明`StrongholdProtocolApp/2 Resources/<SHA256> ClientLine/0.9 Build/43 Epoch/1`。该声明只用于能力协商，不能代替账号认证；HTTP和WebSocket仍验证会话、账号禁用、到期与初始密码状态。游玩必须资源摘要与服务器当前要求一致。

## 接口与分发边界

`GET /product/client.json`公开返回兼容系列、epoch、contract、minBuild、当前资源摘要和可用差量入口。它不包含安装器下载地址、真实用户数据或密钥。

`GET /client-updates/manifests/<SHA256>.json`仅向已登录且处于允许的旧资源基线的兼容客户端开放。外层清单固定RSA-SHA256算法，携带base64原始负载和签名。客户端内置SPKI公钥，签名覆盖完整负载，负载包含from/to、base64完整目标资源清单和本次允许下载的blob摘要。目标清单的原始字节SHA256必须等于to。

`GET /client-updates/blobs/<SHA256>`仅提供相应差量清单列出的变化文件。移除的文件通过目标完整清单消失；同内容文件共用blob。服务器不会根据客户端任意传来的URL或文件路径查找资源。每份服务器差量发布在启动前逐个验证大小、SHA256和清单签名，异常时拒绝启动。没有合适差量路径时提示新安装器，不临时开放完整资源包。

`/assets/`、`/fonts/`、`/icons/`、`/media/`、三个固定资源元数据入口由原生宿主本地拦截。服务器不提供这些散文件，客户端缺失或损坏时不能回源。客户端运行JS与规则JSON继续从已认证服务器载入。

## 安装与原子切换

每份完整客户端固定自身基础清单摘要与更新公钥，内嵌完整资源ZIP。启动校验资源清单和ZIP条目内容；活跃资源代际只能从基础包沿已验证签名的本地更新链取得，不能信任可任意编辑的清单。

本地更新目录按安装器内嵌的基础摘要隔离。安装新的完整客户端后从该安装器的完整基础资源启动，不能沿用另一基础包的active指针或签名链；账号Cookie、连接设置与其他用户数据不随资源目录隔离而清除。

资源下载与更新只在登录准备页面执行，运行对局期间不切换。下载先写临时文件，核对大小与SHA256，再保存为内容寻址blob。目标所有文件就绪后持久化签名清单，最后原子替换active指针并保留previous。进程中断前旧指针继续有效；已验证blob供重试复用。更新后刷新能力声明并重新载入游戏页面，不能让正在运行的旧JS混用新资源。

跨兼容系列、epoch/contract变化或低于minBuild时只返回安装新客户端要求。服务器不以此接口强行替换客户端代码、签名或本地私有账号数据。

## 构建入口

`node tools/client-resources.mjs key`只在新候选中创建独立资源更新签名身份；已存在任一半身份时禁止自动更换。私钥位于`mobile/.signing/`，不得进入服务器包、客户端包或Git；公钥固定进Android/Windows构建。它独立于原Android应用签名，应用仍使用原签名保持覆盖安装身份。

`node tools/client-resources.mjs manifest <输出>`按上游清单检查所有素材存在后生成完整清单。不得手改data中的生成映射来掩盖下载或提取缺失。

`node tools/client-resources.mjs patch <旧清单> <新清单> <输出目录> <私钥>`仅允许相同系列和epoch，输出签名差量清单和变化blob；正式发布需把返回的from/to/id纳入经过审核的client.json，再验证包内容。

`node tools/build-native.mjs resources|android|windows`重建完整客户端资源与平台包。pins子命令只供编译与受控夹具检查；零摘要占位不允许进入正式包。Android路径本地/中央ZIP头都要校验，最终包必须实际运行验证。

原生资源页面禁用旧素材Service Worker与整包下载/导入入口。Pixi检测适配允许WebGL2可用但WebGL1被宿主屏蔽的设备继续使用原渲染器，不修改画质、Shader或材质。仅原生产品页面的connect-src附加data/blob，用于图像解码Worker的内存数据探针；模拟Worker仍connect-src none，脚本仍禁止data/blob和eval。

Android WebView的专用Worker抓取不会经过WebViewClient本地资源拦截，因此Android原生宿主下使用Pixi公开偏好preferWorkers=false：纹理由页面fetch取本地字节，再交ImageBitmap解码。没有关闭ImageBitmap、降低贴图质量或开启服务器回源；Windows维持原有抓取方式。验收须检查实际Spine ready/failed与画面，不能只确认画布或简化视图能完成对局。
