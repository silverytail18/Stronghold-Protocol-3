# 对局统计申诉

## 玩家侧

在“统计数据 → 对局记录”中，自己已经结算的对局行会出现“申诉”按钮：

1. 点击“申诉”，填写 1–500 字原因；
2. 提交后按钮变为“申诉审核中”；
3. 管理员处理前，该局仍按原规则计入统计；
4. 管理员通过后，该行显示“申诉通过，不计入统计”，汇总、成就和单局纪录都不再包含它，但对局记录本身保留；
5. 被驳回后可以补充原因重新申诉。

只有已结算、且本人是该局成员的对局可申诉。中途退出/未完成的记录没有服务器结算编号，不能申诉。

## 管理员侧

浏览器 `/account` → 管理员 → “对局申诉”：

- 列出待处理/已处理申诉，含玩家、对局编号、模式、难度、原因和时间；
- “通过”会在 `record_exclusions` 写入该玩家的排除项，并把申诉标记为 `approved`；
- “驳回”只改状态，不动统计；
- 处理是幂等的：已处理的申诉不能再次处理。

## 服务端

新表（`ranked.sqlite`）：

```sql
match_appeals(id, record_id, record_key, account_id, reason, status, created_at,
              decided_at, decided_by, note, UNIQUE(record_key, account_id))
record_exclusions(account_id, record_id, record_key, created_at,
                  PRIMARY KEY(account_id, record_id))
```

`record_key` 是客户端统计记录的合成 id（`r1.*`）；`record_id` 是 `battle_records.id`。申诉提交时服务端会遍历该账号的已结算战报，用 `shared/stats.js` 的 `buildRecord` 把 `r1.*` 映射回真实记录；通过后两套 id 都写入排除表，服务端统计和客户端本地统计都能跳过。

接口：

- `GET /product/match-appeals`：当前账号的申诉与排除 id；
- `POST /product/match-appeal`：`{ recordId, reason }`；
- `GET /auth/admin/match-appeals`：管理员列表；
- `POST /auth/admin/match-appeals/<id>`：`{ action: 'approve'|'reject', note? }`。

只允许同源 JSON 请求；管理员接口要求管理员会话。

## 边界

- 申诉只影响**申诉账号的统计**；同一局其他玩家仍按原统计。
- 记录本身、历史回看、服务器战报和排位积分不受影响。
- 管理员通过后，客户端在下一次打开统计/刷新时生效；已打开的旧页面不会自动重算。
