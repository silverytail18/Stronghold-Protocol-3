# 0.9.14 第一批上游重构升级

这是固定上游dev bfd2a9209b3a42545acb757e0f6e51052d8694ff的产品适配构建，原有定制内容在第二批迁入。客户端为Android code43（沿用原包名/签名）与Windows x64完整包，兼容系列0.9、资源contract2/epoch1。现有0.9.13客户端必须改装本批完整客户端；不要用旧ABI2资源包填充。

浏览器访问`/account`管理账号与版本、赛季；游玩通过客户端。服务器不分发安装器和完整资源包，完整客户端由管理员通过游戏服务器以外的渠道交付。本批没有上传或部署。

## 更新前

1. 核对现网实际启动目录、Node版本和原环境变量。实测Node24.11.1；采用支持node:sqlite的Node版本。备份目录不要放公开Web目录。
2. 停止新开局，等待旧普通/排位对局完成，处理原pending和账号锁，然后停止旧服务。运行中内存对局不能跨引擎恢复，不能直接停服丢掉仍需保留的局。
3. 校验服务器压缩包SHA256，解压到部署目录以外。以下假设现网`/root/w3`，新包解压根为`/root/update-0914/Stronghold-Protocol-3`；按实际路径替换。解包目录与部署目录不能嵌套。

```sh
cd /root/update-0914/Stronghold-Protocol-3
node tools/state-transfer.mjs inspect --project /root/w3
node tools/update-project.mjs --source /root/update-0914/Stronghold-Protocol-3 --target /root/w3 --stopped
cd /root/w3
npm ci --omit=dev
npm start
```

`update-project`先逐项验证SERVER-RELEASE.json，再创建私有一致快照、备份替换/退出的源码，最后更新受管理源码。账号、SQLite/WAL、config、环境文件、签名、未知状态、旧安装器/资源和未管理文件均保留。原签名与资源更新私钥不在服务器包内。首次新底座启动写入独立代际标记，不重置既有表、积分或账号。未知数据格式与旧运行/待结算状态会拒绝更新；应回到原版本处理，不绕过检查。

请先用`state-transfer snapshot / verify / restore`在独立副本演练；restore默认dry-run，应用须`--apply --stopped`。本地没有线上账号库，本轮没有核验真实现网数据。自定义SP_STATE_DIR/SP_AUTH_USERS_FILE/SP_RANKED_FILE须与原启动环境一致，不能为了启动而指向新空目录。

## 启动后

- 浏览器访问服务器`/account`，确认原账号、权限、赞助状态、赛季与战绩；管理员设置四个原游戏版本的开放列表和新房间默认版本。
- 客户端填写服务器根地址并登录。Windows解压整个目录后启动EXE，需Microsoft Edge WebView2运行时；Android为Android8/API26及以上，同签名覆盖安装。不要卸载旧App后再安装，以免删除本地偏好。
- 开始游戏前由房主在房间底部版本按钮直接选择，单人也在房间内选；其他成员重新准备，等版本数据校验后开始。已开局不能改版，没有版本投票。
- 排位首领和隐藏关由服务器计算，普通战和联防使用上游客户端模拟。非管理员排位不能主动AI托管，普通局不改变排位积分。
- 客户端登录准备页处理兼容资源热更新；跨兼容系列、epoch/contract或最低构建号要求则必须安装新完整客户端。没有适配差量时也要求新安装器，不开启完整资源回源。
- 第一批16项定制ID标记迁移中，原开放配置和偏好保留。伊比利亚独立内容包不进入新运行链，伊比利亚盟约留待第二批；定制音乐业务触发同样随第二批恢复。

升级失败会留下已验证私有备份和FAILED说明。请保持停服，按update.json恢复对应源码；不要在新库已有战绩后直接用旧整库覆盖。回退需保全所有新写入，再选兼容的处理方式。

服务器健康页只承诺`{ok:true}`，版本请读取部署目录package.json。完整交付清单、校验值、实跑范围及已知限制见工作区reports/upstream-batch1-playable-20261102/DELIVERY.md。
