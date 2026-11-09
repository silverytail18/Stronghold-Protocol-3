# 个性化表情包、局内聊天身份与段位里程碑名片

本文说明 2026-11-06 在 `Stronghold-Protocol-3-next` 增加的三个界面功能，以及它们的服务端边界。它们是产品层功能，不改变战斗模拟、排位计分或上游 `server/sim` 规则。

## 1. 局内交流：官方 / 个性化 / 卫戍协议

`public/js/ui/emotes.js` 的“交流”面板现在有三个标签页：

| 标签 | 内容 | 来源 |
| --- | --- | --- |
| 官方 | 6 个主题 × 6 个 = 36 个官方局内表情 | `shared/constants.js` 的 `EMOTE_THEMES` |
| 个性化 | 管理员导入的个性化表情包；没有导入时不显示任何单元格 | `shared/chatStickers.js` 的 `SIFENG_EMOTES`（管理员参考）+ `/chat-stickers/catalog` |
| 卫戍协议 | 管理员以 `group=covenant` 导入的表情包；没有内容时显示空状态 | `/chat-stickers/catalog` |

- 没有导入图片时，“个性化”页显示空状态，不预留任何单元格；管理员页仍保留 14 个参考位置用于对照。
- 每页 3×2、分页点、左右滑动/方向键/滚轮、1 秒冷却、3 秒气泡沿用原官方行为。
- 个性化表情通过现有的 `g.emote` 发送，服务端只接受：
  - 官方 36 个 id；
  - `server/product/emote-packs.js` 索引中真实存在图片的 id。
- 旧客户端收到不认识的表情 id 时显示中性占位，不会渲染文字或断裂。

## 2. 管理员导入个性化表情包

入口：浏览器 `/account` → 管理员 → “表情包”。

- 支持 PNG / JPEG / GIF / WebP（GIF 动图保留动画），单张 ≤ 4 MiB，一次最多 14 张，总请求 ≤ 32 MiB（base64 后略大）。
- 包 ID 只能是小写字母、数字、`-`、`_`，最多 32 位。
- 使用 ID `sifeng` 时，14 张图片按固定顺序填入四风位置；只导入几张时，客户端只显示这几张；其他 ID 生成 `pack.<id>.<序号>` 的独立表情位。
- 分组：
  - `personal`：进入“个性化”；
  - `covenant`：进入“卫戍协议”。
- 服务端以图片魔数校验类型，不信任扩展名或 `Content-Type`；SVG 被拒绝。
- 删除包会同时删除该包目录和索引项；正在对局中的客户端可能在短时间内仍显示旧缓存，刷新后恢复。
- 管理员上传/删除后，服务器向在线客户端广播 `chatStickers.changed`；客户端立即重新拉取清单并预载新图片，已缓存的旧图片继续使用。

存储与接口：

- 目录：`<state>/emote-packs/<pack-id>/`，索引 `<state>/emote-packs/index.json`。
- `GET /chat-stickers/catalog`：已登录客户端读取槽位与包清单。
- `GET /chat-stickers/file/<pack>/<file>`：只读取索引中列出的文件；响应带包更新时间版本和一年 `immutable` 私有缓存，客户端加载清单后会预载这些图片，后续打开直接用本地缓存。
- `GET /auth/admin/chat-stickers`、`POST /auth/admin/chat-stickers`、`DELETE /auth/admin/chat-stickers/<id>`：仅管理员，且要求同源请求。

资源策略：这些图片由管理员上传到本服状态目录，不引入 Emi 的资源 CDN、跨服账号租约或客户端安装包；客户端只通过同源 `/chat-stickers/` 读取。

## 3. 局内聊天身份

`public/js/ui/emiChat.js` 的每条消息现在包含：

- 头像：优先使用发送者在房间里的名片干员（`seat.card`），没有时回退公开档案头像；
- 头像框与名片主题：来自 `community.presentation` 的 `frame` / `namecard`；
- 段位：来自排位档案的当前段位标签；
- 时间：本地 `HH:mm`。

服务端 `server/match/match/intents.js` 在 `m.chat` / `m.chatHistory` 中携带 `card`、`frame`、`namecard`、`rank` 快照；`server/product/lobby-bridge.js` 在对局开始时把 `playerPresentation` 挂到该局。普通对局/测试夹具没有这些字段时，客户端只显示名字与占位头像。

## 4. 段位里程碑名片与解锁通知

- 定义：`shared/nameCards.js` 的 `RANK_MILESTONE_CARDS`。
- 解锁条件：当前段位或历史最高段位达到对应大段；权限永久保留。
- 名片值：
  - `milestone_gold`（黄金纪念）
  - `milestone_platinum`（白金纪念）
  - `milestone_diamond`（钻石纪念）
  - `milestone_ascendant`（超凡纪念）
  - `milestone_immortal`（神话纪念）
- 服务端 `ranked.profile` 下发 `unlockedNameCards`；`/community/presentation` 只允许基础三主题或已解锁的里程碑名片。
- 客户端：
  - 玩家档案的“编辑展示”只列出已解锁的里程碑名片；
  - 档案页显示五个里程碑的已解锁/未解锁状态；
  - 第一次看到新解锁时显示“解锁新名片”提示，并在本机按账号记住已提示；
  - 房间座位、档案横幅和局内聊天头像使用对应的现有颜色样式，不新增图片素材。

## 5. 已知边界

- 四风 14 个位置默认没有图片：本轮没有找到可用的四风素材，因此只完成导入结构与管理员界面；客户端不显示任何预留空位。
- 导入的图片由本服保存；服务器迁移/备份时需要连同 `<state>/emote-packs/` 一起备份。
- 旧客户端、旧回放和未加载目录的客户端对个性化 id 显示占位，不做文本回退。
- 本次没有实机 Android/Windows 输入法或完整对局验收；浏览器布局和定向测试需在发布前补做。
