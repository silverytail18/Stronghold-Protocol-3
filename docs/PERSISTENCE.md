# 账号与持久化数据目录

v0.2.5 起，新部署使用源码根目录的 `storage/`，与游戏规则目录 `data/` 分开。推荐云服务器使用固定的私有绝对目录，例如 `/var/lib/stronghold-protocol`，以后源码放在不同版本目录中也可继续使用同一套数据。

| 数据 | 文件 / 存储方式 | 更新或重启后的行为 |
|---|---|---|
| 账号名、不可变账号 ID、密码哈希、角色、禁用及初始密码状态 | `auth-users.json`，JSON；密码为随机盐 + scrypt 哈希 | 保留，密码不变 |
| 昵称、博士编号、赛季、段位积分、最高段位、比赛与结算流水、普通 / 排位对局记录、冷却及审计 | `ranked.sqlite`，SQLite | 保留，段位与战绩继续绑定原 accountId |
| SQLite 未合并的写入与共享内存索引 | `ranked.sqlite-wal`、`ranked.sqlite-shm` | 运行中不可删除 WAL；备份需包含已提交 WAL 数据 |
| 服务配置 | 源码目录 `config/server.env`、`.env*` | 更新工具保留并备份 |
| APK 签名 | `mobile/android/.signing/` | 更新工具保留并备份，同签名覆盖安装 |
| 登录会话、当前房间、正在进行的对局 | 服务端内存 | 重启后重新登录；未完成的排位按中断处理，不猜测结算分数 |
| 局内聊天与气泡 | 对局内存 | 对局结束自动删除，不进入账号数据库 |
| App 的连接地址、界面 / 音频设置及美术缓存 | 手机本机 | 同签名覆盖安装保留；不替代服务器账号数据 |

## 固定目录配置

全新部署，在 `config/server.env` 中设置：

```dotenv
SP_STATE_DIR=/var/lib/stronghold-protocol
```

账号和数据库默认分别为该目录的 `auth-users.json`、`ranked.sqlite`。`SP_AUTH_USERS_FILE`、`SP_RANKED_FILE` 仍可分别指定文件，优先级高于 `SP_STATE_DIR`。相对目录按项目根目录解析；更换源码目录时请使用绝对路径。

不设置 `SP_STATE_DIR` 时，新部署使用项目根目录 `storage/`；如果发现旧 `config/auth-users.json` 或 `config/ranked.sqlite`，继续使用旧 `config/`，不会自动创建空账号或重置赛季。两处都存在数据且没有明确配置时拒绝猜测。数据库存在而账号文件缺失时拒绝创建默认管理员，需恢复同一套账号文件。

私有目录不要放在 `public/`、`data/`、`shared/` 或 `server/sim/` 中，也不要将其配置为 Nginx / Caddy 的公开目录。运行服务的系统用户需要该目录的读写权限；新目录采用 0700、账号和数据库文件采用 0600。

## 已有服务器迁移

先暂停新排位，等待对局结束，再停止 Node 服务。使用新版本源码中的迁移工具：

```bash
node tools/migrate-state.mjs --project /opt/Stronghold-Protocol-Ranked --to /var/lib/stronghold-protocol --stopped
```

也可以把数据统一到现有部署目录下：

```bash
node tools/migrate-state.mjs --project /opt/Stronghold-Protocol-Ranked --to storage --stopped
```

迁移工具读取原部署的 `.env`、`.env.local`、`config/server.env` 和传入环境变量，找到当前数据文件。先校验账号和数据库，再在原部署的 `.backups/state-…/` 创建备份，使用 SQLite 备份接口合并已提交 WAL 数据，复制账号原始内容和数据库到新目录，最后原子更新 `config/server.env` 中的数据路径。不会更换密码、accountId、段位、赛季或战绩；原文件也保留。目标已有账号或数据库时拒绝覆盖，格式未知或校验失败时不切换配置。

如账号尚无 accountId，先用原版本启动一次完成既有账号兼容升级，再停服迁移。删除账号后遗留的历史记录继续保留。

随后按保留数据的更新流程复制新源码，再使用原配置启动：

```bash
node tools/update-project.mjs --target /opt/Stronghold-Protocol-Ranked --stopped
cd /opt/Stronghold-Protocol-Ranked
npm ci
node --env-file=config/server.env server/index.js
```

`--stopped` 是你已经停服的声明，工具不会替你停服。若 systemd 或启动命令另外设置了旧的数据路径，应同步调整，避免覆盖迁移工具写入的新路径。服务器版本更换后仍使用这个固定目录即可。

## 之后的每次更新

更新工具排除完整的 `storage/` 和项目内 `SP_STATE_DIR` 自定义目录，也排除明确配置的账号、数据库和 WAL / SHM；先备份再复制源码。项目外的固定数据文件不会被源码复制覆盖，并另存到更新备份的 `external/` 中。配置与安卓签名继续保留。

账号恢复必须配合同一套排位数据库。运行中数据库备份使用 `npm run ranked:backup`，该工具会读取当前配置中的真实路径并使用 SQLite 备份 API；完整的账号 / 数据库配套备份建议停服进行。不要直接删除部署目录后重新安装，不要用新发布包里的配置或测试账号覆盖现有数据。

## 管理员排位 AI 托管

已完成初始密码修改且启用的管理员账号，在单人和同盟的全部排位难度中，可以在局内「离开」弹窗点击「暂离（AI 托管）」；点击右上角倒计时左侧的「退出托管」取消托管（没有倒计时的单人休整期也显示在右上角）。服务器按当前账号角色确认权限，昵称、房主身份或客户端参数不能授予此权限。

v0.2.6 起，托管使用透明操作拦截层，取消中央提示窗口和暗色背景，AI 的购买、部署、选卡以及战斗画面继续显示。托管期间拦截点击、触摸、拖动、键盘快捷键和手动游戏请求，仅退出按钮可操作；退出失败时仍保持锁定。战斗进度和结果上报继续运行，服务器确认取消托管后恢复手动操作，对局结束自动解除锁定。

按钮、权限和托管状态仅本人可见，权限 / 状态只通过本人 `m.private` 发送；其他玩家公共状态、公告、结算和战绩不含托管字段。重连恢复本人托管界面。管理员被禁用或降为普通用户时，连接撤销，托管停止。普通账号仍不可在排位托管，也不能添加 AI 队友。

胜负结算与原积分规则相同。战斗继续客户端计算；AI 的商店、选择和部署操作使用原有服务器调度，并关闭排位托管的服务器战斗预演，不额外开启完整战斗复算。
