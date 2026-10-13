# 私有服务器账号认证

认证默认开启。玩家必须先用管理员提供的**账号和密码**登录，才能加载游戏或连接 `/ws`；游戏中的昵称仍可自行填写。管理员有独立的网页后台 `/admin`，可以创建和管理账号，也可以修改自己的密码。普通用户通过 `/account` 修改自己的密码；没有开放注册、邮箱验证或邮件找回密码。

安卓 App 仅提供登录和游玩，管理员后台和用户修改密码只通过手机 / 电脑浏览器访问。首次或重置密码后，需要先在网页修改初始密码，再返回 App 登录。安装和源码打包见 [MOBILE.md](MOBILE.md)。

## 默认管理员与首次登录

首次启动且账号文件不存在时，服务器自动创建以下管理员：

| 项目 | 初始值 |
|---|---|
| 账号 | `admin` |
| 密码 | `Stronghold@123456` |
| 后台 | `http://服务器公网IP:3000/admin`（HTTP 配置见下一节） |

首次登录会要求修改初始密码，完成前无法进入游戏或操作用户管理。新密码至少 6 个字符，不能与当前密码相同；修改后用新密码重新登录，即可进入管理员后台。之后可以随时在后台左侧「修改我的密码」中修改。

**已有账号文件不会被默认账号覆盖。** 老版本没有角色字段的账号文件会自动补齐：第一个账号成为管理员，其他账号为普通用户，原来的密码保持不变。文件损坏、格式无效或无法读取时启动失败，不会重新生成默认账号来覆盖数据。初始化或升级账号文件也需要目录写入权限。

## 公网 IP + HTTP 源码部署（没有域名 / HTTPS）

此方式直接运行 Node.js 源码，不需要 Docker、域名或反向代理。浏览器访问 `http://服务器公网IP:3000`。账号认证保持开启；`SP_AUTH_COOKIE_SECURE=0` 让登录 Cookie 可以通过 HTTP 发送。**HTTP 不会加密密码和 Cookie，认证提供访问控制，但不能保护传输中的凭据。**

Linux 服务器，在项目目录运行：

```bash
npm ci
npm run setup                         # 原项目素材下载；已准备好素材时可跳过
cp config/server.env.example config/server.env
node --env-file=config/server.env server/index.js
```

仓库提供的 `config/server.env.example` 包含以下配置，复制后的 `config/server.env` 已加入 `.gitignore`：

```dotenv
HOST=0.0.0.0
PORT=3000
SP_AUTH=on
SP_AUTH_COOKIE_SECURE=0
SP_AUTH_SESSION_HOURS=12
```

也可以不使用配置文件，直接用原项目的启动命令：

```bash
SP_AUTH=on SP_AUTH_COOKIE_SECURE=0 HOST=0.0.0.0 PORT=3000 npm start
```

在云平台安全组 / 防火墙中允许入站 **TCP 3000**；如果服务器启用了 UFW，还需运行 `sudo ufw allow 3000/tcp`。更换 `PORT` 时同步修改安全组规则和访问地址。无需开放其他游戏端口，HTTP 和 WebSocket 共用 3000。登录后继续使用原来的昵称、创建房间与邀请链接。

如需开机自启，Linux systemd 示例（按实际修改项目路径和服务用户）：

```ini
[Unit]
Description=Stronghold Protocol private game server
After=network-online.target
Wants=network-online.target

[Service]
WorkingDirectory=/opt/Stronghold-Protocol
ExecStart=/usr/bin/node --env-file=/opt/Stronghold-Protocol/config/server.env /opt/Stronghold-Protocol/server/index.js
User=stronghold
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

保存为 `/etc/systemd/system/stronghold.service` 后，运行 `sudo systemctl daemon-reload` 和 `sudo systemctl enable --now stronghold`；日志使用 `journalctl -u stronghold -f`。服务用户 `stronghold` 必须已存在，并且能读取项目、`config/server.env`，且对私有 `config/` 目录及账号文件有写入权限，才能首次创建账号和保存后台修改。例如项目位于 `/opt/Stronghold-Protocol` 时，可用 `sudo chown -R stronghold:stronghold /opt/Stronghold-Protocol/config` 交给该服务用户管理。网页中的账号修改立即生效，无需重启服务。

## 从源码部署

在项目目录执行（Node.js 22 / 24）：

```bash
npm ci
# 按前一节配置 HTTP，或按下面配置 HTTPS，再启动服务
```

新部署账号文件默认写入 `storage/auth-users.json`，`SP_STATE_DIR` 可指定固定数据目录；旧部署仍读取原 `config/auth-users.json`，迁移见 [PERSISTENCE.md](PERSISTENCE.md)。账号文件保存角色、账号状态、随机盐和 scrypt 哈希，不保存明文密码。文件已加入 `.gitignore`。管理员应备份该文件；不要放在 `public/`、`data/`、`shared/` 或其他网页目录。Linux 新建私有目录时使用 0700、文件 0600；运行服务的用户需要能读取账号文件并在其所在目录写入。后台通过临时文件加原子替换保存修改，目录只读会导致保存失败。

**如果具备域名和 HTTPS**，保留默认登录 Cookie 的 `Secure` 标记，由 Caddy / Nginx 终止 TLS，Node.js 只监听本机：

```bash
HOST=127.0.0.1 npm start
```

Caddy（按实际修改域名）：

```caddy
game.example.com {
    reverse_proxy 127.0.0.1:3000
}
```

打开 `https://game.example.com`，会显示登录页面。Nginx 的完整 WebSocket 代理配置见 [DEPLOY.md](DEPLOY.md#24-反向代理与-https有域名时)，务必保留 `proxy_set_header Host $host`；认证会校验请求的 Origin 和 Host，代理必须保留客户端域名。账号文件和 TLS 证书都由你在服务器上配置。

本机 HTTP 调试时关闭 Cookie 的 Secure 标记；公网 IP + HTTP 直连使用上面的专用配置：

```bash
SP_AUTH_COOKIE_SECURE=0 HOST=127.0.0.1 npm start
```

PowerShell 对应命令：

```powershell
$env:SP_AUTH_COOKIE_SECURE = '0'
$env:HOST = '127.0.0.1'
npm start
```

## 网页管理员后台

管理员登录后进入 `/admin`，也可以从游戏大厅右下角的「账号管理」进入：

- **创建账号**：填写账号、初始密码，选择普通用户或管理员。新用户首次登录也必须修改初始密码。
- **查看用户**：查看角色、启用状态以及是否需要修改初始密码。后台和接口都不会显示密码哈希。
- **重置密码**：为其他用户设置新的初始密码。该用户的所有登录会话和游戏连接立即失效，重新登录后需要修改初始密码。
- **启用 / 禁用**：禁用立即撤销该用户所有会话和连接；重新启用不会恢复旧会话，需要重新登录。
- **调整角色 / 删除账号**：只能操作其他账号，角色修改或删除会撤销该账号的所有会话。不能从列表禁用、降级或删除自己，系统始终保留至少一名启用的管理员。
- **修改自己的密码**：输入当前密码、新密码和确认密码；成功后该账号在所有浏览器退出，使用新密码重新登录。

普通用户的 `/account` 只有修改密码功能，不能访问管理员接口或操作其他账号。管理接口在服务端逐次检查权限、同源请求和密码修改状态；每个账号 15 分钟最多 10 次写操作，整个进程每分钟最多 30 次写操作。账号修改会串行保存，写入失败时保留原来的账号和会话，页面显示错误。

网页修改会直接保存到账号文件，**立即生效，服务重启后仍保留**。登录会话只在内存中保存，重启后需要重新登录。

## 终端管理与密码恢复

忘记管理员密码时，可以停止服务后使用原有终端工具：

```bash
npm run auth:user -- list
npm run auth:user -- add friend     # 账号已存在时重置密码
npm run auth:user -- remove friend
```

终端工具修改文件后重新启动服务生效；不要在后台写入账号时同时从终端修改文件。重启会清除所有登录会话，也会结束原有对局（项目原有行为）。`list` 会显示角色与状态，`add` 保留现有角色；全新文件中的第一个账号为管理员。工具拒绝删除最后一名启用的管理员。输入密码不会回显，也不接收命令行密码，避免密码出现在 shell 历史和进程参数中。

## Docker

源码部署不需要 Docker。以下仅供项目已有容器部署使用：网页管理需要对账号目录写入，必须挂载整个私有配置目录，不能只读挂载单个账号文件。以下映射只允许本机反向代理访问：

```bash
npm run auth:user -- add admin
docker build -t stronghold-protocol --build-arg FETCH_ASSETS=1 .
# 镜像以 node 用户 (uid 1000) 运行：将配置目录写入权限交给该用户
sudo chown -R 1000:1000 config
sudo chmod 600 storage/auth-users.json
docker run -d --name stronghold --restart unless-stopped \
  -p 127.0.0.1:3000:3000 \
  --mount type=bind,src="$PWD/config",dst=/app/config \
  stronghold-protocol
```

随后用上述 Caddy / Nginx 配置开启 HTTPS。网页修改立即生效；从宿主机终端工具修改时先停止容器，确认账号文件归属为 `1000:1000`、权限为 `600` 后重新启动。

Compose 示例（同样先准备账号文件及权限）：

```yaml
services:
  stronghold:
    build:
      context: .
      args: { FETCH_ASSETS: "1" }
    ports: ["127.0.0.1:3000:3000"]
    restart: unless-stopped
    volumes:
      - type: bind
        source: ./config
        target: /app/config
        bind:
          create_host_path: false
```

确保容器用户有目录访问和写入权限。systemd 部署时让运行服务的用户拥有账号目录，并在 `[Service]` 中设置 `Environment=HOST=127.0.0.1`。

## 配置与会话行为

| 环境变量 | 默认 | 含义 |
|---|---|---|
| `SP_AUTH` | `on` | `on` 开启；`off` 显式关闭，仅适合受信任的本地 / 局域网环境 |
| `SP_AUTH_USERS_FILE` | 新部署 `storage/auth-users.json`，旧部署兼容 `config/` | 私有账号文件路径，建议使用绝对路径 |
| `SP_STATE_DIR` | 新部署 `storage/`；旧数据兼容 `config/` | 统一账号和排位的私有数据目录，可使用固定绝对路径 |
| `SP_AUTH_COOKIE_SECURE` | `1` | `1` 仅通过 HTTPS 发送登录 Cookie；`0` 用于 HTTP（包括公网 IP 直连） |
| `SP_AUTH_SESSION_HOURS` | `12` | 登录有效小时数，最大 168 小时；到期重新登录 |

设置环境变量的方法见 [README.md](../README.md#端口与配置)。服务器不会自动加载 `.env`；可以用 Node.js 的 `--env-file`，例如 `node --env-file=.env server/index.js`，或让 Docker 的 `--env-file` / systemd 注入变量。

- 密码用 Node.js 内置异步 scrypt（N=32768, r=8, p=3）哈希；每个密码独立随机盐，比较使用 `timingSafeEqual`。
- 登录使用 256 位随机会话令牌，服务器仅在内存保存令牌摘要。Cookie 为 `HttpOnly; SameSite=Strict; Path=/`，默认加 `Secure`；成功登录会轮换本浏览器的旧会话。
- 登录和退出接口要求同源 Origin；WebSocket 握手也校验 Origin 和登录 Cookie。服务端对已建立连接的消息继续检查会话，到期或退出即撤销权限。
- 每个来源地址 15 分钟内最多 10 次登录请求（包含成功请求），整个进程每分钟最多 30 次；同时最多执行 2 个密码校验，繁忙返回 503，限流返回 429 和 `Retry-After`。地址解析沿用 `TRUST_PROXY`；反向代理应覆盖真实 IP 头，并限制后端端口的来源。
- 首页 / 大厅右下角显示账号、「账号管理」（普通用户显示「修改密码」）和「退出登录」。房间及对局内隐藏该入口，避免遮挡游戏；可回到大厅退出。退出撤销当前浏览器会话及其所有标签页的连接，同账号其他浏览器保持登录。
- 游戏重连令牌绑定登录账号；切换账号不会接管上一个账号的游戏身份。同账号重新登录仍可在原有游戏重连时限内恢复对局。
- 未登录 `/healthz` 仅返回 `{"ok":true}`，容器健康检查无需账号；游戏资源的响应标记 `private, no-cache`，避免共享缓存绕过认证。
- 缺少账号文件时初始化默认管理员；账号文件损坏或环境变量无效时服务拒绝启动，不会退回匿名模式。

只有明确希望关闭认证时，才使用 `SP_AUTH=off npm start`。测试中的旧游戏用例通过 `startServer({ auth: false, ... })` 显式关闭认证，新认证用例独立启用认证。

## 验证与排错

```bash
node --test test/auth.test.js test/auth-admin.test.js
```

覆盖默认管理员初始化、首次强制修改密码、管理员权限与用户管理、即时撤销会话 / WebSocket、并发管理与原子保存、旧账号兼容、保存失败保留原状态，以及未登录资源拦截、Cookie 属性、同源限制、限流、退出 / 过期和重连令牌账号隔离。

| 现象 | 检查 |
|---|---|
| 启动提示无法读取认证账号文件 | 检查 `SP_AUTH_USERS_FILE` 路径、账号文件格式、服务用户读取与目录写入权限 |
| 后台提示账号保存失败 | 服务用户必须能在账号文件所在目录创建临时文件和替换账号文件；检查目录权限、只读挂载和磁盘空间 |
| 默认账号无法登录 | 已存在账号文件时不会创建默认账号；用 `npm run auth:user -- list` 查看账号，忘记密码时停服后使用终端工具重置 |
| 本机 HTTP 登录被拒绝 | 设置 `SP_AUTH_COOKIE_SECURE=0`；公网 IP + HTTP 直连使用本页首节配置 |
| 公网 IP + HTTP 登录返回 403 或登录后回到登录页 | 使用 `config/server.env.example` 中的 HTTP 配置，确保 `SP_AUTH_COOKIE_SECURE=0` 后重启 |
| 公网 IP 页面无法访问 | 确认 `HOST=0.0.0.0`、云安全组及系统防火墙允许 TCP 3000，检查公网 IP 和端口是否正确 |
| 代理后登录 / WebSocket 返回 403 | 保留原始 Host，检查页面为 HTTPS、Cookie Secure 配置，以及访问域名一致 |
| 登录返回 429 | 等待 `Retry-After` 指定秒数；检查代理是否正确传递真实 IP |
| 重启后要求重新登录 | 正常：登录会话保存在内存，账号密码哈希保存在文件 |

实现参考：[Node.js scrypt 文档](https://nodejs.org/docs/latest-v22.x/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback)、[OWASP 会话管理指南](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)。
