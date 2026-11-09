# 炸惊模拟：装备、策略、召唤物、敌人与回合的完整数据变化

下面按记录ID逐项列出增加、删除和修改；原文涉及公式时，完整参数见 RAW-DIFF.json。

## items

新增 11，删除 0，修改 12。

### 新增：奖杯 · chess_item_jibian_trophy

炸惊：攻击力+100%

```json
{
  "isGolden": false,
  "trapId": "trap_1041_acarm041",
  "iconId": "jibian_trophy",
  "itemType": "EQUIP",
  "tier": 1,
  "shopSortId": 1,
  "price": 0,
  "hideInShop": true,
  "shopExcluded": true,
  "shopExcludedBy": null,
  "mergeable": false,
  "upgradeNum": 0,
  "upgradeChessId": null,
  "duration": -1,
  "giveBondId": null,
  "givePowerId": null,
  "canGiveBond": false,
  "requiresBondId": null,
  "category": "STAT",
  "kind": "passive",
  "family": null,
  "note": null,
  "rangeGrid": [
    [
      0,
      0
    ]
  ],
  "id": "chess_item_jibian_trophy",
  "baseId": "chess_item_jibian_trophy",
  "goldenId": null,
  "identifier": 390,
  "name": "奖杯",
  "effectId": "eff_jibian_trophy",
  "effectName": "奖杯",
  "desc": "攻击力+100%",
  "descRaw": "攻击力<@ba.vup>+100%</>",
  "buffs": [
    {
      "key": "env_gbuff_new_with_verify",
      "countType": "NONE",
      "bb": {
        "atk": 1
      },
      "bbStr": {
        "key": "attr_common_global_buff"
      }
    }
  ],
  "params": {
    "atk": 1,
    "key": "attr_common_global_buff"
  },
  "implFormula": "ATK% += atk (additive with other ATK% buffs) — 惊变「老子是冠军他是什么」的奖杯",
  "flavor": "“kskblzdjd”"
}
```

### 新增：板藤 · chess_item_jibian_banteng

炸惊：每回合开始时获得4资金

```json
{
  "isGolden": false,
  "trapId": "trap_1041_acarm041",
  "iconId": "jibian_banteng",
  "itemType": "EQUIP",
  "tier": 1,
  "shopSortId": 1,
  "price": 0,
  "hideInShop": true,
  "shopExcluded": true,
  "shopExcludedBy": null,
  "mergeable": false,
  "upgradeNum": 0,
  "upgradeChessId": null,
  "duration": -1,
  "giveBondId": null,
  "givePowerId": null,
  "canGiveBond": false,
  "requiresBondId": null,
  "category": "MAGIC",
  "kind": "passive",
  "family": null,
  "note": null,
  "rangeGrid": [
    [
      0,
      0
    ]
  ],
  "id": "chess_item_jibian_banteng",
  "baseId": "chess_item_jibian_banteng",
  "goldenId": null,
  "identifier": 391,
  "name": "板藤",
  "effectId": "eff_jibian_banteng",
  "effectName": "板藤",
  "desc": "每回合开始时获得4资金",
  "descRaw": "每回合开始时获得<@ba.vup>4</>资金",
  "buffs": [],
  "params": {},
  "implFormula": "no battle effect — 惊变「板藤」 pays 4 funds per prep (server/sim/content/jibian.js)",
  "flavor": null
}
```

### 新增：超大杯 · chess_item_jibian_chaodabei

炸惊：攻击力+200%，技力恢复速度+2/s

```json
{
  "isGolden": false,
  "trapId": "trap_1041_acarm041",
  "iconId": "jibian_chaodabei",
  "itemType": "EQUIP",
  "tier": 1,
  "shopSortId": 1,
  "price": 0,
  "hideInShop": true,
  "shopExcluded": true,
  "shopExcludedBy": null,
  "mergeable": false,
  "upgradeNum": 0,
  "upgradeChessId": null,
  "duration": -1,
  "giveBondId": null,
  "givePowerId": null,
  "canGiveBond": false,
  "requiresBondId": null,
  "category": "STAT",
  "kind": "passive",
  "family": null,
  "note": null,
  "rangeGrid": [
    [
      0,
      0
    ]
  ],
  "id": "chess_item_jibian_chaodabei",
  "baseId": "chess_item_jibian_chaodabei",
  "goldenId": null,
  "identifier": 392,
  "name": "超大杯",
  "effectId": "eff_jibian_chaodabei",
  "effectName": "超大杯",
  "desc": "攻击力+200%，技力恢复速度+2/s",
  "descRaw": "攻击力<@ba.vup>+200%</>，技力恢复速度<@ba.vup>+2/s</>",
  "buffs": [
    {
      "key": "env_gbuff_new_with_verify",
      "countType": "NONE",
      "bb": {
        "atk": 2,
        "sp_recovery_per_sec": 2
      },
      "bbStr": {
        "key": "attr_common_global_buff"
      }
    }
  ],
  "params": {
    "atk": 2,
    "sp_recovery_per_sec": 2,
    "key": "attr_common_global_buff"
  },
  "implFormula": "ATK% += atk（与其它 ATK% 加算）· 技力恢复 += sp_recovery_per_sec/s —— 惊变「超大杯」的奖杯",
  "flavor": "“你什么杯级？”"
}
```

### 新增：高卢银行支票 · chess_item_jibian_gaoluzhipiao

炸惊：你获得一个“高卢银行支票”。每回合整备阶段，它的提现金额会在原有基础上随机增加“+10”“0”“-10”中的一种（最低不会低于0，极小概率为“+100”）；每击杀一个敌方单位、每漏掉一个敌方单位、每被队友兜住一只怪，都会让对应结果的概率在下次结算时提高。提现后它就被兑现掉了。

```json
{
  "isGolden": false,
  "trapId": "trap_1041_acarm041",
  "iconId": "jibian_gaoluzhipiao",
  "itemType": "EQUIP",
  "tier": 1,
  "shopSortId": 1,
  "price": 0,
  "hideInShop": true,
  "shopExcluded": true,
  "shopExcludedBy": null,
  "mergeable": false,
  "upgradeNum": 0,
  "upgradeChessId": null,
  "duration": -1,
  "giveBondId": null,
  "givePowerId": null,
  "canGiveBond": false,
  "requiresBondId": null,
  "category": "MAGIC",
  "kind": "passive",
  "family": null,
  "note": null,
  "rangeGrid": [
    [
      0,
      0
    ]
  ],
  "id": "chess_item_jibian_gaoluzhipiao",
  "baseId": "chess_item_jibian_gaoluzhipiao",
  "goldenId": null,
  "identifier": 393,
  "name": "高卢银行支票",
  "effectId": "eff_jibian_gaoluzhipiao",
  "effectName": "高卢银行支票",
  "desc": "你获得一个“高卢银行支票”。每回合整备阶段，它的提现金额会在原有基础上随机增加“+10”“0”“-10”中的一种（最低不会低于0，极小概率为“+100”）；每击杀一个敌方单位、每漏掉一个敌方单位、每被队友兜住一只怪，都会让对应结果的概率在下次结算时提高。提现后它就被兑现掉了。",
  "descRaw": "你获得一个“高卢银行支票”。每回合整备阶段，它的提现金额会在<@ba.vup>原有基础上</>随机增加“+10”“0”“-10”中的一种（最低不会低于0，极小概率为“+100”）；每击杀一个敌方单位、每漏掉一个敌方单位、每被队友兜住一只怪，都会让对应结果的概率在下次结算时提高。提现后它就被兑现掉了。",
  "buffs": [],
  "params": {},
  "implFormula": "prep side only. Each 整备阶段 start (HOOKS.jibian_gaoluzhipiao.onPrepStart -> chequeSettle) rolls one of +10 / 0 / -10 (and +100 with CHEQUE_JACKPOT = 10%) and ADDS it to the current value: value = max(0, prev + roll) — accumulate with a floor of 0; the roll never SETS the value. chequeAccrue (onBattleResult) raises the weight of +10 for kill / leak / saved until the next settle. cashCheque spends it (server/match/player/economy.js); a value of 0 cannot be cashed. Implemented in server/sim/content/jibian.js (CHEQUE_START / CHEQUE_JACKPOT / chequeWeights).",
  "flavor": "镶金嵌银、奢华无比的支票本，现在已经无从兑现。"
}
```

### 新增：极速送达！ · chess_item_jibian_jisusongda_normal

炸惊：你获得一个来自企鹅物流的包裹，把它装备到任意干员身上时会消耗并开启。

```json
{
  "isGolden": false,
  "trapId": "trap_1041_acarm041",
  "iconId": "jibian_jisusongda_normal",
  "itemType": "EQUIP",
  "tier": 1,
  "shopSortId": 1,
  "price": 0,
  "hideInShop": true,
  "shopExcluded": true,
  "shopExcludedBy": null,
  "mergeable": false,
  "upgradeNum": 0,
  "upgradeChessId": null,
  "duration": -1,
  "giveBondId": null,
  "givePowerId": null,
  "canGiveBond": false,
  "requiresBondId": null,
  "category": "MAGIC",
  "kind": "consume_on_equip",
  "family": null,
  "note": null,
  "rangeGrid": [
    [
      0,
      0
    ]
  ],
  "id": "chess_item_jibian_jisusongda_normal",
  "baseId": "chess_item_jibian_jisusongda_normal",
  "goldenId": null,
  "identifier": 394,
  "name": "极速送达！",
  "effectId": "eff_jibian_jisusongda_normal",
  "effectName": "极速送达！",
  "desc": "你获得一个来自企鹅物流的包裹，把它装备到任意干员身上时会消耗并开启。",
  "descRaw": "你获得一个来自企鹅物流的包裹，把它装备到任意干员身上时会消耗并开启。",
  "buffs": [],
  "params": {},
  "implFormula": "no battle effect — 惊变「极速送达！」的包裹开启结算尚未实现（见 server/sim/content/jibian.js）；普通档记录",
  "flavor": "你也不知道里面究竟是炸弹还是意大利面。"
}
```

### 新增：极速送达！ · chess_item_jibian_jisusongda_rare

炸惊：你获得一个来自企鹅物流的包裹，把它装备到任意干员身上时会消耗并开启。

```json
{
  "isGolden": false,
  "trapId": "trap_1041_acarm041",
  "iconId": "jibian_jisusongda_rare",
  "itemType": "EQUIP",
  "tier": 1,
  "shopSortId": 1,
  "price": 0,
  "hideInShop": true,
  "shopExcluded": true,
  "shopExcludedBy": null,
  "mergeable": false,
  "upgradeNum": 0,
  "upgradeChessId": null,
  "duration": -1,
  "giveBondId": null,
  "givePowerId": null,
  "canGiveBond": false,
  "requiresBondId": null,
  "category": "MAGIC",
  "kind": "consume_on_equip",
  "family": null,
  "note": null,
  "rangeGrid": [
    [
      0,
      0
    ]
  ],
  "id": "chess_item_jibian_jisusongda_rare",
  "baseId": "chess_item_jibian_jisusongda_rare",
  "goldenId": null,
  "identifier": 395,
  "name": "极速送达！",
  "effectId": "eff_jibian_jisusongda_rare",
  "effectName": "极速送达！",
  "desc": "你获得一个来自企鹅物流的包裹，把它装备到任意干员身上时会消耗并开启。",
  "descRaw": "你获得一个来自企鹅物流的包裹，把它装备到任意干员身上时会消耗并开启。",
  "buffs": [],
  "params": {},
  "implFormula": "no battle effect — 惊变「极速送达！」的包裹开启结算尚未实现（见 server/sim/content/jibian.js）；稀有档记录",
  "flavor": "你也不知道里面究竟是炸弹还是意大利面。"
}
```

### 新增：极速送达！ · chess_item_jibian_jisusongda_epic

炸惊：你获得一个来自企鹅物流的包裹，把它装备到任意干员身上时会消耗并开启。

```json
{
  "isGolden": false,
  "trapId": "trap_1041_acarm041",
  "iconId": "jibian_jisusongda_epic",
  "itemType": "EQUIP",
  "tier": 1,
  "shopSortId": 1,
  "price": 0,
  "hideInShop": true,
  "shopExcluded": true,
  "shopExcludedBy": null,
  "mergeable": false,
  "upgradeNum": 0,
  "upgradeChessId": null,
  "duration": -1,
  "giveBondId": null,
  "givePowerId": null,
  "canGiveBond": false,
  "requiresBondId": null,
  "category": "MAGIC",
  "kind": "consume_on_equip",
  "family": null,
  "note": null,
  "rangeGrid": [
    [
      0,
      0
    ]
  ],
  "id": "chess_item_jibian_jisusongda_epic",
  "baseId": "chess_item_jibian_jisusongda_epic",
  "goldenId": null,
  "identifier": 396,
  "name": "极速送达！",
  "effectId": "eff_jibian_jisusongda_epic",
  "effectName": "极速送达！",
  "desc": "你获得一个来自企鹅物流的包裹，把它装备到任意干员身上时会消耗并开启。",
  "descRaw": "你获得一个来自企鹅物流的包裹，把它装备到任意干员身上时会消耗并开启。",
  "buffs": [],
  "params": {},
  "implFormula": "no battle effect — 惊变「极速送达！」的包裹开启结算尚未实现（见 server/sim/content/jibian.js）；史诗档记录",
  "flavor": "你也不知道里面究竟是炸弹还是意大利面。"
}
```

### 新增：“S.E.E.S”袖章 · chess_item_sees_armband_a

炸惊：使装备者获得【S.E.E.S】盟约，攻击力+50%。
占用“变形同构体”的独立槽位（第三格），因此不占普通装备格。
与“变形同构体”一样可以【转职】：携带者其它装备上写明的盟约也会一并生效。
不能与“变形同构体”同时装备。

```json
{
  "id": "chess_item_sees_armband_a",
  "baseId": "chess_item_sees_armband_a",
  "name": "“S.E.E.S”袖章",
  "itemType": "EQUIP",
  "kind": "passive",
  "category": "STAT",
  "tier": 6,
  "identifier": 397,
  "iconId": "sees_armband",
  "trapId": "sees_armband",
  "effectId": "eff_sees_armband_a",
  "effectName": "“S.E.E.S”袖章",
  "buffs": [
    {
      "key": "env_gbuff_new_with_verify",
      "countType": "NONE",
      "bb": {
        "atk": 0.5
      },
      "bbStr": {
        "key": "attr_common_global_buff"
      }
    }
  ],
  "params": {},
  "canGiveBond": true,
  "giveBondId": "seesShip",
  "givePowerId": null,
  "requiresBondId": null,
  "goldenId": null,
  "upgradeChessId": null,
  "upgradeNum": 0,
  "mergeable": false,
  "isGolden": false,
  "duration": -1,
  "rangeGrid": [
    [
      0,
      0
    ]
  ],
  "price": 3,
  "shopSortId": 13,
  "shopExcluded": false,
  "shopExcludedBy": null,
  "hideInShop": false,
  "family": null,
  "note": null,
  "flavor": "“特别课外活动小组的证明。”（S.E.E.S = Special Extracurricular Execute Sector）",
  "desc": "使装备者获得【S.E.E.S】盟约，攻击力+50%。\n占用“变形同构体”的独立槽位（第三格），因此不占普通装备格。\n与“变形同构体”一样可以【转职】：携带者其它装备上写明的盟约也会一并生效。\n不能与“变形同构体”同时装备。",
  "descRaw": "使装备者获得【S.E.E.S】盟约，<@ba.vup>攻击力+50%</>。\n占用“变形同构体”的<@ba.kw>独立槽位</>（第三格），因此不占普通装备格。\n与“变形同构体”一样可以<@ba.kw>【转职】</>：携带者其它装备上写明的盟约也会一并生效。\n不能与“变形同构体”同时装备。",
  "implFormula": "Wearer gains bond S.E.E.S (bonds.json seesShip.zj.equipCombo lists this item key) and ATK +50% (buffs.atk 0.5). canGiveBond:true ⇒ GameData.morphEquipSlot third slot: it does not count against equipPerChess and invariants.js allows at most ONE such item per operator, which is exactly the \"cannot be worn with 变形同构体\" rule.",
  "zjOnly": true
}
```

### 新增：月光馆学园校服 · chess_item_sees_uniform_a

炸惊：攻击力+100%，攻击速度+120。

```json
{
  "id": "chess_item_sees_uniform_a",
  "baseId": "chess_item_sees_uniform_a",
  "name": "月光馆学园校服",
  "itemType": "EQUIP",
  "kind": "passive",
  "category": "STAT",
  "tier": 6,
  "identifier": 398,
  "iconId": "sees_uniform",
  "trapId": "sees_uniform",
  "effectId": "eff_sees_uniform_a",
  "effectName": "月光馆学园校服",
  "buffs": [
    {
      "key": "env_gbuff_new_with_verify",
      "countType": "NONE",
      "bb": {
        "atk": 1,
        "attack_speed": 120
      },
      "bbStr": {
        "key": "attr_common_global_buff"
      }
    }
  ],
  "params": {},
  "canGiveBond": false,
  "giveBondId": null,
  "givePowerId": null,
  "requiresBondId": "seesShip",
  "goldenId": null,
  "upgradeChessId": null,
  "upgradeNum": 0,
  "mergeable": false,
  "isGolden": false,
  "duration": -1,
  "rangeGrid": [
    [
      0,
      0
    ]
  ],
  "price": 3,
  "shopSortId": 14,
  "shopExcluded": true,
  "shopExcludedBy": "S.E.E.S 首次获得赠品（不由商店出售）",
  "hideInShop": false,
  "family": null,
  "note": null,
  "flavor": "“月光馆学园指定的男款外套，左胸别着校徽。”",
  "desc": "攻击力+100%，攻击速度+120。",
  "descRaw": "<@ba.vup>攻击力+100%</>，<@ba.vup>攻击速度+120</>。",
  "implFormula": "ATK +100% (buffs.atk 1.0) and ASPD +120 flat (buffs.attack_speed 120 — the flat key 叙拉古正装/拉特兰桥夹 use), both permanent while equipped (kind: passive). requiresBondId=seesShip: meant for S.E.E.S members only (equipping the 袖章 makes a wearer one) — NOTE: the engine enforces requiresBondId only in the bot / data validation, not in the player equip path. No stacking (stackMax/stackGroup absent). Granted free on the first 岳羽由加莉 (bonds/addon/meta.js onGain)."
}
```

### 新增：人格面具召唤器 · chess_item_sees_evoker_a

炸惊：使装备者获得的【S.E.E.S】盟约效果翻倍

```json
{
  "id": "chess_item_sees_evoker_a",
  "baseId": "chess_item_sees_evoker_a",
  "name": "人格面具召唤器",
  "itemType": "EQUIP",
  "kind": "passive",
  "category": "STAT",
  "tier": 6,
  "identifier": 399,
  "iconId": "sees_evoker",
  "trapId": "sees_evoker",
  "effectId": "eff_sees_evoker_a",
  "effectName": "人格面具召唤器",
  "buffs": [],
  "params": {},
  "canGiveBond": false,
  "giveBondId": null,
  "givePowerId": null,
  "requiresBondId": null,
  "goldenId": null,
  "upgradeChessId": null,
  "upgradeNum": 0,
  "mergeable": false,
  "isGolden": false,
  "duration": -1,
  "rangeGrid": [
    [
      0,
      0
    ]
  ],
  "price": 3,
  "shopSortId": 15,
  "shopExcluded": true,
  "shopExcludedBy": "S.E.E.S 首次获得赠品（不由商店出售）",
  "hideInShop": false,
  "family": null,
  "note": null,
  "flavor": "“叩击太阳穴，呼唤心底的另一个自己。”",
  "desc": "使装备者获得的【S.E.E.S】盟约效果翻倍",
  "descRaw": "使装备者获得的【S.E.E.S】盟约效果<@ba.vup>翻倍</>",
  "implFormula": "Doubles the S.E.E.S bond effect on the wearer. Implemented battle-side in server/sim/content/bonds/addon/battle.js (the ID.sees block): m = 2 when the unit carries chess_item_sees_evoker, so ATK bonus (10+0.25L)/100 and ASPD (10+0.2L) are doubled, and the 100层 SP-cost cut is doubled too (still capped at baseSpCost-1 so the SP bar never disappears)."
}
```

### 新增：谜の假面 · chess_item_mujica_mask_a

炸惊：使装备者获得【颂乐人偶】盟约，攻击力+50%。
占用“变形同构体”的独立槽位（第三格），因此不占普通装备格。
与“变形同构体”一样可以【转职】：携带者其它装备上写明的盟约也会一并生效。
不能与“变形同构体”同时装备。

```json
{
  "id": "chess_item_mujica_mask_a",
  "baseId": "chess_item_mujica_mask_a",
  "name": "谜の假面",
  "itemType": "EQUIP",
  "kind": "passive",
  "category": "STAT",
  "tier": 6,
  "identifier": 400,
  "iconId": "mujica_mask",
  "trapId": "mujica_mask",
  "effectId": "eff_mujica_mask_a",
  "effectName": "谜の假面",
  "buffs": [
    {
      "key": "env_gbuff_new_with_verify",
      "countType": "NONE",
      "bb": {
        "atk": 0.5
      },
      "bbStr": {
        "key": "attr_common_global_buff"
      }
    }
  ],
  "params": {},
  "canGiveBond": true,
  "giveBondId": "mujicaShip",
  "givePowerId": null,
  "requiresBondId": null,
  "goldenId": null,
  "upgradeChessId": null,
  "upgradeNum": 0,
  "mergeable": false,
  "isGolden": false,
  "duration": -1,
  "rangeGrid": [
    [
      0,
      0
    ]
  ],
  "price": 3,
  "shopSortId": 13,
  "shopExcluded": false,
  "hideInShop": false,
  "family": null,
  "note": "颂乐人偶盟约：首次获得祐天寺若麦时获得（每场一次）",
  "stackMax": 1,
  "stackGroup": null,
  "flavor": "“一个网红给到你手里的，听说戴上它就能上武道馆？”",
  "desc": "使装备者获得【颂乐人偶】盟约，攻击力+50%。\n占用“变形同构体”的独立槽位（第三格），因此不占普通装备格。\n与“变形同构体”一样可以【转职】：携带者其它装备上写明的盟约也会一并生效。\n不能与“变形同构体”同时装备。",
  "descRaw": "使装备者获得【颂乐人偶】盟约，<@ba.vup>攻击力+50%</>。\n占用“变形同构体”的<@ba.kw>独立槽位</>（第三格），因此不占普通装备格。\n与“变形同构体”一样可以<@ba.kw>【转职】</>：携带者其它装备上写明的盟约也会一并生效。\n不能与“变形同构体”同时装备。",
  "implFormula": "Wearer gains bond 颂乐人偶 (bonds.json mujicaShip.zj.equipCombo lists this item key) and ATK +50% (buffs.atk 0.5). canGiveBond:true ⇒ GameData.morphEquipSlot third slot: it does not count against equipPerChess and invariants.js allows at most ONE such item per operator, which is exactly the \"cannot be worn with 变形同构体\" rule.",
  "zjOnly": true
}
```

### 修改：维式重锤 · chess_item_1_01_e_a

原版：攻击力+15%

炸惊：攻击力+15%

```json
{
  "before": {
    "id": "chess_item_1_01_e_a",
    "baseId": "chess_item_1_01_e_a",
    "goldenId": "chess_item_1_01_e_b",
    "isGolden": false,
    "trapId": "trap_1041_acarm041",
    "iconId": "trap_1041_acarm041",
    "identifier": 267,
    "name": "维式重锤",
    "itemType": "EQUIP",
    "tier": 1,
    "shopSortId": 1,
    "price": 1,
    "hideInShop": false,
    "shopExcluded": false,
    "shopExcludedBy": null,
    "mergeable": true,
    "upgradeNum": 2,
    "upgradeChessId": "chess_item_1_01_e_b",
    "duration": -1,
    "giveBondId": "victoriaShip",
    "givePowerId": null,
    "canGiveBond": false,
    "requiresBondId": null,
    "effectId": "eff_acarm041",
    "effectName": "维式重锤",
    "desc": "攻击力+15%",
    "descRaw": "攻击力<@ba.vup>+15%</>",
    "buffs": [
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "atk": 0.15
        },
        "bbStr": {
          "key": "attr_common_global_buff"
        }
      }
    ],
    "params": {
      "atk": 0.15,
      "key": "attr_common_global_buff"
    },
    "category": "STAT",
    "kind": "passive",
    "family": null,
    "implFormula": "ATK% += atk (additive with other ATK% buffs)",
    "note": null,
    "rangeGrid": [
      [
        0,
        0
      ]
    ],
    "flavor": "一柄曾在维多利亚的工厂内铸造和平的重锤。\n“用同样的铁与火，去终结那场战争。”"
  },
  "after": {
    "id": "chess_item_1_01_e_a",
    "baseId": "chess_item_1_01_e_a",
    "goldenId": "chess_item_1_01_e_b",
    "isGolden": false,
    "trapId": "trap_1041_acarm041",
    "iconId": "trap_1041_acarm041",
    "identifier": 267,
    "name": "维式重锤",
    "itemType": "EQUIP",
    "tier": 1,
    "shopSortId": 1,
    "price": 1,
    "hideInShop": false,
    "shopExcluded": false,
    "shopExcludedBy": null,
    "mergeable": true,
    "upgradeNum": 2,
    "upgradeChessId": "chess_item_1_01_e_b",
    "duration": -1,
    "giveBondId": "victoriaShip",
    "givePowerId": null,
    "canGiveBond": false,
    "requiresBondId": null,
    "effectId": "eff_acarm041",
    "effectName": "维式重锤",
    "desc": "攻击力+15%",
    "descRaw": "攻击力<@ba.vup>+15%</>",
    "buffs": [
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "atk": 0.15
        },
        "bbStr": {
          "key": "attr_common_global_buff"
        }
      }
    ],
    "params": {
      "atk": 0.15,
      "key": "attr_common_global_buff"
    },
    "category": "STAT",
    "kind": "passive",
    "family": null,
    "implFormula": "ATK% += atk (additive with other ATK% buffs)",
    "note": null,
    "rangeGrid": [
      [
        0,
        0
      ]
    ],
    "flavor": "一柄曾在维多利亚的工厂内铸造和平的重锤。\n“用同样的铁与火，去终结那场战争。”",
    "stackMax": 20,
    "stackGroup": "vickiHammer"
  }
}
```

### 修改：维式重锤 · chess_item_1_01_e_b

原版：攻击力+25%

炸惊：攻击力+25%

```json
{
  "before": {
    "id": "chess_item_1_01_e_b",
    "baseId": "chess_item_1_01_e_a",
    "goldenId": "chess_item_1_01_e_b",
    "isGolden": true,
    "trapId": "trap_1041_acarm041",
    "iconId": "trap_1041_acarm041",
    "identifier": 326,
    "name": "维式重锤",
    "itemType": "EQUIP",
    "tier": 1,
    "shopSortId": 1,
    "price": 5,
    "hideInShop": false,
    "shopExcluded": false,
    "shopExcludedBy": null,
    "mergeable": false,
    "upgradeNum": 0,
    "upgradeChessId": null,
    "duration": 0,
    "giveBondId": "victoriaShip",
    "givePowerId": null,
    "canGiveBond": false,
    "requiresBondId": null,
    "effectId": "eff_acgarm041",
    "effectName": "维式重锤",
    "desc": "攻击力+25%",
    "descRaw": "攻击力<@ba.vup>+25%</>",
    "buffs": [
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "atk": 0.25
        },
        "bbStr": {
          "key": "attr_common_global_buff"
        }
      }
    ],
    "params": {
      "atk": 0.25,
      "key": "attr_common_global_buff"
    },
    "category": "STAT",
    "kind": "passive",
    "family": null,
    "implFormula": "ATK% += atk (additive with other ATK% buffs)",
    "note": null,
    "rangeGrid": [
      [
        0,
        0
      ]
    ],
    "flavor": "一柄曾在维多利亚的工厂内铸造和平的重锤。\n“用同样的铁与火，去终结那场战争。”"
  },
  "after": {
    "id": "chess_item_1_01_e_b",
    "baseId": "chess_item_1_01_e_a",
    "goldenId": "chess_item_1_01_e_b",
    "isGolden": true,
    "trapId": "trap_1041_acarm041",
    "iconId": "trap_1041_acarm041",
    "identifier": 326,
    "name": "维式重锤",
    "itemType": "EQUIP",
    "tier": 1,
    "shopSortId": 1,
    "price": 5,
    "hideInShop": false,
    "shopExcluded": false,
    "shopExcludedBy": null,
    "mergeable": false,
    "upgradeNum": 0,
    "upgradeChessId": null,
    "duration": 0,
    "giveBondId": "victoriaShip",
    "givePowerId": null,
    "canGiveBond": false,
    "requiresBondId": null,
    "effectId": "eff_acgarm041",
    "effectName": "维式重锤",
    "desc": "攻击力+25%",
    "descRaw": "攻击力<@ba.vup>+25%</>",
    "buffs": [
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "atk": 0.25
        },
        "bbStr": {
          "key": "attr_common_global_buff"
        }
      }
    ],
    "params": {
      "atk": 0.25,
      "key": "attr_common_global_buff"
    },
    "category": "STAT",
    "kind": "passive",
    "family": null,
    "implFormula": "ATK% += atk (additive with other ATK% buffs)",
    "note": null,
    "rangeGrid": [
      [
        0,
        0
      ]
    ],
    "flavor": "一柄曾在维多利亚的工厂内铸造和平的重锤。\n“用同样的铁与火，去终结那场战争。”",
    "stackMax": 20,
    "stackGroup": "vickiHammer"
  }
}
```

### 修改：战栗维式重锤 · chess_item_2_03_e_a

原版：攻击力+20%；若携带者是地面干员则攻击时有10%概率使目标战栗2秒

炸惊：攻击力+20%；若携带者是地面干员则攻击时有10%概率使目标战栗2秒

```json
{
  "before": {
    "id": "chess_item_2_03_e_a",
    "baseId": "chess_item_2_03_e_a",
    "goldenId": "chess_item_2_03_e_b",
    "isGolden": false,
    "trapId": "trap_1045_acarm045",
    "iconId": "trap_1045_acarm045",
    "identifier": 271,
    "name": "战栗维式重锤",
    "itemType": "EQUIP",
    "tier": 2,
    "shopSortId": 3,
    "price": 2,
    "hideInShop": false,
    "shopExcluded": true,
    "shopExcludedBy": "维多利亚盟约每25层 / 洛洛的定制品",
    "mergeable": true,
    "upgradeNum": 2,
    "upgradeChessId": "chess_item_2_03_e_b",
    "duration": -1,
    "giveBondId": "victoriaShip",
    "givePowerId": null,
    "canGiveBond": false,
    "requiresBondId": null,
    "effectId": "eff_acarm045",
    "effectName": "战栗维式重锤",
    "desc": "攻击力+20%；若携带者是地面干员则攻击时有10%概率使目标战栗2秒",
    "descRaw": "攻击力<@ba.vup>+20%</>；若携带者是地面干员则攻击时有10%概率使目标<$ba.tremble>战栗</>2秒",
    "buffs": [
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "atk": 0.2
        },
        "bbStr": {
          "key": "attr_common_global_buff"
        }
      },
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "prob": 0.1,
          "disarmed_duration": 2
        },
        "bbStr": {
          "key": "act1autochess_equip_acarm045_global_buff",
          "big_hammer": "chess_item_6_05_e"
        }
      }
    ],
    "params": {
      "atk": 0.2,
      "key": "attr_common_global_buff",
      "prob": 0.1,
      "disarmed_duration": 2,
      "big_hammer": "chess_item_6_05_e"
    },
    "category": "ON_HIT",
    "kind": "passive",
    "family": "hammer",
    "implFormula": "ATK% += atk. If carrier is a MELEE(ground) operator: on each attack, prob chance to apply 战栗(Tremble: target cannot normal-attack while blocked) for disarmed_duration s. Special effect doubled (prob x2 [ASSUMED]) when carrier also has 蒸汽之心 and is Victoria.",
    "note": null,
    "rangeGrid": [
      [
        0,
        0
      ]
    ],
    "flavor": "一柄曾在维多利亚的工厂内铸造和平的重锤，如今它的威名更盛。\n“用同样的铁与火，去终结那场战争。”"
  },
  "after": {
    "id": "chess_item_2_03_e_a",
    "baseId": "chess_item_2_03_e_a",
    "goldenId": "chess_item_2_03_e_b",
    "isGolden": false,
    "trapId": "trap_1045_acarm045",
    "iconId": "trap_1045_acarm045",
    "identifier": 271,
    "name": "战栗维式重锤",
    "itemType": "EQUIP",
    "tier": 2,
    "shopSortId": 3,
    "price": 2,
    "hideInShop": false,
    "shopExcluded": true,
    "shopExcludedBy": "维多利亚盟约每25层 / 洛洛的定制品",
    "mergeable": true,
    "upgradeNum": 2,
    "upgradeChessId": "chess_item_2_03_e_b",
    "duration": -1,
    "giveBondId": "victoriaShip",
    "givePowerId": null,
    "canGiveBond": false,
    "requiresBondId": null,
    "effectId": "eff_acarm045",
    "effectName": "战栗维式重锤",
    "desc": "攻击力+20%；若携带者是地面干员则攻击时有10%概率使目标战栗2秒",
    "descRaw": "攻击力<@ba.vup>+20%</>；若携带者是地面干员则攻击时有10%概率使目标<$ba.tremble>战栗</>2秒",
    "buffs": [
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "atk": 0.2
        },
        "bbStr": {
          "key": "attr_common_global_buff"
        }
      },
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "prob": 0.1,
          "disarmed_duration": 2
        },
        "bbStr": {
          "key": "act1autochess_equip_acarm045_global_buff",
          "big_hammer": "chess_item_6_05_e"
        }
      }
    ],
    "params": {
      "atk": 0.2,
      "key": "attr_common_global_buff",
      "prob": 0.1,
      "disarmed_duration": 2,
      "big_hammer": "chess_item_6_05_e"
    },
    "category": "ON_HIT",
    "kind": "passive",
    "family": "hammer",
    "implFormula": "ATK% += atk. If carrier is a MELEE(ground) operator: on each attack, prob chance to apply 战栗(Tremble: target cannot normal-attack while blocked) for disarmed_duration s. Special effect doubled (prob x2 [ASSUMED]) when carrier also has 蒸汽之心 and is Victoria.",
    "note": null,
    "rangeGrid": [
      [
        0,
        0
      ]
    ],
    "flavor": "一柄曾在维多利亚的工厂内铸造和平的重锤，如今它的威名更盛。\n“用同样的铁与火，去终结那场战争。”",
    "stackMax": 20,
    "stackGroup": "vickiHammer"
  }
}
```

### 修改：战栗维式重锤 · chess_item_2_03_e_b

原版：攻击力+35%；若携带者是地面干员则攻击时有10%概率使目标战栗2秒

炸惊：攻击力+35%；若携带者是地面干员则攻击时有10%概率使目标战栗2秒

```json
{
  "before": {
    "id": "chess_item_2_03_e_b",
    "baseId": "chess_item_2_03_e_a",
    "goldenId": "chess_item_2_03_e_b",
    "isGolden": true,
    "trapId": "trap_1045_acarm045",
    "iconId": "trap_1045_acarm045",
    "identifier": 330,
    "name": "战栗维式重锤",
    "itemType": "EQUIP",
    "tier": 2,
    "shopSortId": 3,
    "price": 5,
    "hideInShop": false,
    "shopExcluded": true,
    "shopExcludedBy": "维多利亚盟约每25层 / 洛洛的定制品",
    "mergeable": false,
    "upgradeNum": 0,
    "upgradeChessId": null,
    "duration": 0,
    "giveBondId": "victoriaShip",
    "givePowerId": null,
    "canGiveBond": false,
    "requiresBondId": null,
    "effectId": "eff_acgarm045",
    "effectName": "战栗维式重锤",
    "desc": "攻击力+35%；若携带者是地面干员则攻击时有10%概率使目标战栗2秒",
    "descRaw": "攻击力<@ba.vup>+35%</>；若携带者是地面干员则攻击时有10%概率使目标<$ba.tremble>战栗</>2秒",
    "buffs": [
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "atk": 0.35
        },
        "bbStr": {
          "key": "attr_common_global_buff"
        }
      },
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "prob": 0.1,
          "disarmed_duration": 2
        },
        "bbStr": {
          "key": "act1autochess_equip_acarm045_global_buff",
          "big_hammer": "chess_item_6_05_e"
        }
      }
    ],
    "params": {
      "atk": 0.35,
      "key": "attr_common_global_buff",
      "prob": 0.1,
      "disarmed_duration": 2,
      "big_hammer": "chess_item_6_05_e"
    },
    "category": "ON_HIT",
    "kind": "passive",
    "family": "hammer",
    "implFormula": "ATK% += atk. If carrier is a MELEE(ground) operator: on each attack, prob chance to apply 战栗(Tremble: target cannot normal-attack while blocked) for disarmed_duration s. Special effect doubled (prob x2 [ASSUMED]) when carrier also has 蒸汽之心 and is Victoria.",
    "note": null,
    "rangeGrid": [
      [
        0,
        0
      ]
    ],
    "flavor": "一柄曾在维多利亚的工厂内铸造和平的重锤，如今它的威名更盛。\n“用同样的铁与火，去终结那场战争。”"
  },
  "after": {
    "id": "chess_item_2_03_e_b",
    "baseId": "chess_item_2_03_e_a",
    "goldenId": "chess_item_2_03_e_b",
    "isGolden": true,
    "trapId": "trap_1045_acarm045",
    "iconId": "trap_1045_acarm045",
    "identifier": 330,
    "name": "战栗维式重锤",
    "itemType": "EQUIP",
    "tier": 2,
    "shopSortId": 3,
    "price": 5,
    "hideInShop": false,
    "shopExcluded": true,
    "shopExcludedBy": "维多利亚盟约每25层 / 洛洛的定制品",
    "mergeable": false,
    "upgradeNum": 0,
    "upgradeChessId": null,
    "duration": 0,
    "giveBondId": "victoriaShip",
    "givePowerId": null,
    "canGiveBond": false,
    "requiresBondId": null,
    "effectId": "eff_acgarm045",
    "effectName": "战栗维式重锤",
    "desc": "攻击力+35%；若携带者是地面干员则攻击时有10%概率使目标战栗2秒",
    "descRaw": "攻击力<@ba.vup>+35%</>；若携带者是地面干员则攻击时有10%概率使目标<$ba.tremble>战栗</>2秒",
    "buffs": [
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "atk": 0.35
        },
        "bbStr": {
          "key": "attr_common_global_buff"
        }
      },
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "prob": 0.1,
          "disarmed_duration": 2
        },
        "bbStr": {
          "key": "act1autochess_equip_acarm045_global_buff",
          "big_hammer": "chess_item_6_05_e"
        }
      }
    ],
    "params": {
      "atk": 0.35,
      "key": "attr_common_global_buff",
      "prob": 0.1,
      "disarmed_duration": 2,
      "big_hammer": "chess_item_6_05_e"
    },
    "category": "ON_HIT",
    "kind": "passive",
    "family": "hammer",
    "implFormula": "ATK% += atk. If carrier is a MELEE(ground) operator: on each attack, prob chance to apply 战栗(Tremble: target cannot normal-attack while blocked) for disarmed_duration s. Special effect doubled (prob x2 [ASSUMED]) when carrier also has 蒸汽之心 and is Victoria.",
    "note": null,
    "rangeGrid": [
      [
        0,
        0
      ]
    ],
    "flavor": "一柄曾在维多利亚的工厂内铸造和平的重锤，如今它的威名更盛。\n“用同样的铁与火，去终结那场战争。”",
    "stackMax": 20,
    "stackGroup": "vickiHammer"
  }
}
```

### 修改：坚固维式重锤 · chess_item_3_09_e_a

原版：攻击力+25%；首次受到致命伤害时生命值不低于1，持续8秒

炸惊：攻击力+25%；首次受到致命伤害时生命值不低于1，持续8秒

```json
{
  "before": {
    "id": "chess_item_3_09_e_a",
    "baseId": "chess_item_3_09_e_a",
    "goldenId": "chess_item_3_09_e_b",
    "isGolden": false,
    "trapId": "trap_1043_acarm043",
    "iconId": "trap_1043_acarm043",
    "identifier": 269,
    "name": "坚固维式重锤",
    "itemType": "EQUIP",
    "tier": 3,
    "shopSortId": 9,
    "price": 2,
    "hideInShop": false,
    "shopExcluded": true,
    "shopExcludedBy": "维多利亚盟约每25层 / 洛洛的定制品",
    "mergeable": true,
    "upgradeNum": 2,
    "upgradeChessId": "chess_item_3_09_e_b",
    "duration": -1,
    "giveBondId": "victoriaShip",
    "givePowerId": null,
    "canGiveBond": false,
    "requiresBondId": null,
    "effectId": "eff_acarm043",
    "effectName": "坚固维式重锤",
    "desc": "攻击力+25%；首次受到致命伤害时生命值不低于1，持续8秒",
    "descRaw": "攻击力<@ba.vup>+25%</>；首次受到致命伤害时生命值不低于<@ba.vup>1</>，持续8秒",
    "buffs": [
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "atk": 0.25
        },
        "bbStr": {
          "key": "attr_common_global_buff"
        }
      },
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "undeadable_duration": 8
        },
        "bbStr": {
          "key": "act1autochess_equip_acarm043_global_buff",
          "big_hammer": "chess_item_6_05_e"
        }
      }
    ],
    "params": {
      "atk": 0.25,
      "key": "attr_common_global_buff",
      "undeadable_duration": 8,
      "big_hammer": "chess_item_6_05_e"
    },
    "category": "SURVIVAL",
    "kind": "passive",
    "family": "hammer",
    "implFormula": "ATK% += atk. First time per battle carrier would take lethal damage: HP cannot drop below 1 for undeadable_duration s.",
    "note": null,
    "rangeGrid": [
      [
        0,
        0
      ]
    ],
    "flavor": "一柄曾在维多利亚的工厂内铸造和平的重锤，如今它的质地更硬。\n“用同样的铁与火，去终结那场战争。”"
  },
  "after": {
    "id": "chess_item_3_09_e_a",
    "baseId": "chess_item_3_09_e_a",
    "goldenId": "chess_item_3_09_e_b",
    "isGolden": false,
    "trapId": "trap_1043_acarm043",
    "iconId": "trap_1043_acarm043",
    "identifier": 269,
    "name": "坚固维式重锤",
    "itemType": "EQUIP",
    "tier": 3,
    "shopSortId": 9,
    "price": 2,
    "hideInShop": false,
    "shopExcluded": true,
    "shopExcludedBy": "维多利亚盟约每25层 / 洛洛的定制品",
    "mergeable": true,
    "upgradeNum": 2,
    "upgradeChessId": "chess_item_3_09_e_b",
    "duration": -1,
    "giveBondId": "victoriaShip",
    "givePowerId": null,
    "canGiveBond": false,
    "requiresBondId": null,
    "effectId": "eff_acarm043",
    "effectName": "坚固维式重锤",
    "desc": "攻击力+25%；首次受到致命伤害时生命值不低于1，持续8秒",
    "descRaw": "攻击力<@ba.vup>+25%</>；首次受到致命伤害时生命值不低于<@ba.vup>1</>，持续8秒",
    "buffs": [
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "atk": 0.25
        },
        "bbStr": {
          "key": "attr_common_global_buff"
        }
      },
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "undeadable_duration": 8
        },
        "bbStr": {
          "key": "act1autochess_equip_acarm043_global_buff",
          "big_hammer": "chess_item_6_05_e"
        }
      }
    ],
    "params": {
      "atk": 0.25,
      "key": "attr_common_global_buff",
      "undeadable_duration": 8,
      "big_hammer": "chess_item_6_05_e"
    },
    "category": "SURVIVAL",
    "kind": "passive",
    "family": "hammer",
    "implFormula": "ATK% += atk. First time per battle carrier would take lethal damage: HP cannot drop below 1 for undeadable_duration s.",
    "note": null,
    "rangeGrid": [
      [
        0,
        0
      ]
    ],
    "flavor": "一柄曾在维多利亚的工厂内铸造和平的重锤，如今它的质地更硬。\n“用同样的铁与火，去终结那场战争。”",
    "stackMax": 20,
    "stackGroup": "vickiHammer"
  }
}
```

### 修改：坚固维式重锤 · chess_item_3_09_e_b

原版：攻击力+45%；首次受到致命伤害时生命值不低于1，持续8秒

炸惊：攻击力+45%；首次受到致命伤害时生命值不低于1，持续8秒

```json
{
  "before": {
    "id": "chess_item_3_09_e_b",
    "baseId": "chess_item_3_09_e_a",
    "goldenId": "chess_item_3_09_e_b",
    "isGolden": true,
    "trapId": "trap_1043_acarm043",
    "iconId": "trap_1043_acarm043",
    "identifier": 328,
    "name": "坚固维式重锤",
    "itemType": "EQUIP",
    "tier": 3,
    "shopSortId": 9,
    "price": 5,
    "hideInShop": false,
    "shopExcluded": true,
    "shopExcludedBy": "维多利亚盟约每25层 / 洛洛的定制品",
    "mergeable": false,
    "upgradeNum": 0,
    "upgradeChessId": null,
    "duration": 0,
    "giveBondId": "victoriaShip",
    "givePowerId": null,
    "canGiveBond": false,
    "requiresBondId": null,
    "effectId": "eff_acgarm043",
    "effectName": "坚固维式重锤",
    "desc": "攻击力+45%；首次受到致命伤害时生命值不低于1，持续8秒",
    "descRaw": "攻击力<@ba.vup>+45%</>；首次受到致命伤害时生命值不低于<@ba.vup>1</>，持续8秒",
    "buffs": [
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "atk": 0.45
        },
        "bbStr": {
          "key": "attr_common_global_buff"
        }
      },
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "undeadable_duration": 8
        },
        "bbStr": {
          "key": "act1autochess_equip_acarm043_global_buff",
          "big_hammer": "chess_item_6_05_e"
        }
      }
    ],
    "params": {
      "atk": 0.45,
      "key": "attr_common_global_buff",
      "undeadable_duration": 8,
      "big_hammer": "chess_item_6_05_e"
    },
    "category": "SURVIVAL",
    "kind": "passive",
    "family": "hammer",
    "implFormula": "ATK% += atk. First time per battle carrier would take lethal damage: HP cannot drop below 1 for undeadable_duration s.",
    "note": null,
    "rangeGrid": [
      [
        0,
        0
      ]
    ],
    "flavor": "一柄曾在维多利亚的工厂内铸造和平的重锤，如今它的质地更硬。\n“用同样的铁与火，去终结那场战争。”"
  },
  "after": {
    "id": "chess_item_3_09_e_b",
    "baseId": "chess_item_3_09_e_a",
    "goldenId": "chess_item_3_09_e_b",
    "isGolden": true,
    "trapId": "trap_1043_acarm043",
    "iconId": "trap_1043_acarm043",
    "identifier": 328,
    "name": "坚固维式重锤",
    "itemType": "EQUIP",
    "tier": 3,
    "shopSortId": 9,
    "price": 5,
    "hideInShop": false,
    "shopExcluded": true,
    "shopExcludedBy": "维多利亚盟约每25层 / 洛洛的定制品",
    "mergeable": false,
    "upgradeNum": 0,
    "upgradeChessId": null,
    "duration": 0,
    "giveBondId": "victoriaShip",
    "givePowerId": null,
    "canGiveBond": false,
    "requiresBondId": null,
    "effectId": "eff_acgarm043",
    "effectName": "坚固维式重锤",
    "desc": "攻击力+45%；首次受到致命伤害时生命值不低于1，持续8秒",
    "descRaw": "攻击力<@ba.vup>+45%</>；首次受到致命伤害时生命值不低于<@ba.vup>1</>，持续8秒",
    "buffs": [
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "atk": 0.45
        },
        "bbStr": {
          "key": "attr_common_global_buff"
        }
      },
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "undeadable_duration": 8
        },
        "bbStr": {
          "key": "act1autochess_equip_acarm043_global_buff",
          "big_hammer": "chess_item_6_05_e"
        }
      }
    ],
    "params": {
      "atk": 0.45,
      "key": "attr_common_global_buff",
      "undeadable_duration": 8,
      "big_hammer": "chess_item_6_05_e"
    },
    "category": "SURVIVAL",
    "kind": "passive",
    "family": "hammer",
    "implFormula": "ATK% += atk. First time per battle carrier would take lethal damage: HP cannot drop below 1 for undeadable_duration s.",
    "note": null,
    "rangeGrid": [
      [
        0,
        0
      ]
    ],
    "flavor": "一柄曾在维多利亚的工厂内铸造和平的重锤，如今它的质地更硬。\n“用同样的铁与火，去终结那场战争。”",
    "stackMax": 20,
    "stackGroup": "vickiHammer"
  }
}
```

### 修改：加速维式重锤 · chess_item_3_10_e_a

原版：攻击力+25%；攻击速度+30

炸惊：攻击力+25%；攻击速度+30

```json
{
  "before": {
    "id": "chess_item_3_10_e_a",
    "baseId": "chess_item_3_10_e_a",
    "goldenId": "chess_item_3_10_e_b",
    "isGolden": false,
    "trapId": "trap_1044_acarm044",
    "iconId": "trap_1044_acarm044",
    "identifier": 270,
    "name": "加速维式重锤",
    "itemType": "EQUIP",
    "tier": 3,
    "shopSortId": 10,
    "price": 2,
    "hideInShop": false,
    "shopExcluded": true,
    "shopExcludedBy": "维多利亚盟约每25层 / 洛洛的定制品",
    "mergeable": true,
    "upgradeNum": 2,
    "upgradeChessId": "chess_item_3_10_e_b",
    "duration": -1,
    "giveBondId": "victoriaShip",
    "givePowerId": null,
    "canGiveBond": false,
    "requiresBondId": null,
    "effectId": "eff_acarm044",
    "effectName": "加速维式重锤",
    "desc": "攻击力+25%；攻击速度+30",
    "descRaw": "攻击力<@ba.vup>+25%</>；攻击速度<@ba.vup>+30</>",
    "buffs": [
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "atk": 0.25
        },
        "bbStr": {
          "key": "attr_common_global_buff"
        }
      },
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "attack_speed": 30
        },
        "bbStr": {
          "key": "act1autochess_equip_acarm044_global_buff",
          "big_hammer": "chess_item_6_05_e"
        }
      }
    ],
    "params": {
      "atk": 0.25,
      "key": "attr_common_global_buff",
      "attack_speed": 30,
      "big_hammer": "chess_item_6_05_e"
    },
    "category": "STAT",
    "kind": "passive",
    "family": "hammer",
    "implFormula": "ATK% += atk; ASPD += attack_speed (the hammer 'special effect' = the ASPD part).",
    "note": null,
    "rangeGrid": [
      [
        0,
        0
      ]
    ],
    "flavor": "一柄曾在维多利亚的工厂内铸造和平的重锤，如今它的势头更猛。\n“用同样的铁与火，去终结那场战争。”"
  },
  "after": {
    "id": "chess_item_3_10_e_a",
    "baseId": "chess_item_3_10_e_a",
    "goldenId": "chess_item_3_10_e_b",
    "isGolden": false,
    "trapId": "trap_1044_acarm044",
    "iconId": "trap_1044_acarm044",
    "identifier": 270,
    "name": "加速维式重锤",
    "itemType": "EQUIP",
    "tier": 3,
    "shopSortId": 10,
    "price": 2,
    "hideInShop": false,
    "shopExcluded": true,
    "shopExcludedBy": "维多利亚盟约每25层 / 洛洛的定制品",
    "mergeable": true,
    "upgradeNum": 2,
    "upgradeChessId": "chess_item_3_10_e_b",
    "duration": -1,
    "giveBondId": "victoriaShip",
    "givePowerId": null,
    "canGiveBond": false,
    "requiresBondId": null,
    "effectId": "eff_acarm044",
    "effectName": "加速维式重锤",
    "desc": "攻击力+25%；攻击速度+30",
    "descRaw": "攻击力<@ba.vup>+25%</>；攻击速度<@ba.vup>+30</>",
    "buffs": [
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "atk": 0.25
        },
        "bbStr": {
          "key": "attr_common_global_buff"
        }
      },
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "attack_speed": 30
        },
        "bbStr": {
          "key": "act1autochess_equip_acarm044_global_buff",
          "big_hammer": "chess_item_6_05_e"
        }
      }
    ],
    "params": {
      "atk": 0.25,
      "key": "attr_common_global_buff",
      "attack_speed": 30,
      "big_hammer": "chess_item_6_05_e"
    },
    "category": "STAT",
    "kind": "passive",
    "family": "hammer",
    "implFormula": "ATK% += atk; ASPD += attack_speed (the hammer 'special effect' = the ASPD part).",
    "note": null,
    "rangeGrid": [
      [
        0,
        0
      ]
    ],
    "flavor": "一柄曾在维多利亚的工厂内铸造和平的重锤，如今它的势头更猛。\n“用同样的铁与火，去终结那场战争。”",
    "stackMax": 20,
    "stackGroup": "vickiHammer"
  }
}
```

### 修改：加速维式重锤 · chess_item_3_10_e_b

原版：攻击力+45%；攻击速度+30

炸惊：攻击力+45%；攻击速度+30

```json
{
  "before": {
    "id": "chess_item_3_10_e_b",
    "baseId": "chess_item_3_10_e_a",
    "goldenId": "chess_item_3_10_e_b",
    "isGolden": true,
    "trapId": "trap_1044_acarm044",
    "iconId": "trap_1044_acarm044",
    "identifier": 329,
    "name": "加速维式重锤",
    "itemType": "EQUIP",
    "tier": 3,
    "shopSortId": 10,
    "price": 5,
    "hideInShop": false,
    "shopExcluded": true,
    "shopExcludedBy": "维多利亚盟约每25层 / 洛洛的定制品",
    "mergeable": false,
    "upgradeNum": 0,
    "upgradeChessId": null,
    "duration": 0,
    "giveBondId": "victoriaShip",
    "givePowerId": null,
    "canGiveBond": false,
    "requiresBondId": null,
    "effectId": "eff_acgarm044",
    "effectName": "加速维式重锤",
    "desc": "攻击力+45%；攻击速度+30",
    "descRaw": "攻击力<@ba.vup>+45%</>；攻击速度<@ba.vup>+30</>",
    "buffs": [
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "atk": 0.45
        },
        "bbStr": {
          "key": "attr_common_global_buff"
        }
      },
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "attack_speed": 30
        },
        "bbStr": {
          "key": "act1autochess_equip_acarm044_global_buff",
          "big_hammer": "chess_item_6_05_e"
        }
      }
    ],
    "params": {
      "atk": 0.45,
      "key": "attr_common_global_buff",
      "attack_speed": 30,
      "big_hammer": "chess_item_6_05_e"
    },
    "category": "STAT",
    "kind": "passive",
    "family": "hammer",
    "implFormula": "ATK% += atk; ASPD += attack_speed (the hammer 'special effect' = the ASPD part).",
    "note": null,
    "rangeGrid": [
      [
        0,
        0
      ]
    ],
    "flavor": "一柄曾在维多利亚的工厂内铸造和平的重锤，如今它的势头更猛。\n“用同样的铁与火，去终结那场战争。”"
  },
  "after": {
    "id": "chess_item_3_10_e_b",
    "baseId": "chess_item_3_10_e_a",
    "goldenId": "chess_item_3_10_e_b",
    "isGolden": true,
    "trapId": "trap_1044_acarm044",
    "iconId": "trap_1044_acarm044",
    "identifier": 329,
    "name": "加速维式重锤",
    "itemType": "EQUIP",
    "tier": 3,
    "shopSortId": 10,
    "price": 5,
    "hideInShop": false,
    "shopExcluded": true,
    "shopExcludedBy": "维多利亚盟约每25层 / 洛洛的定制品",
    "mergeable": false,
    "upgradeNum": 0,
    "upgradeChessId": null,
    "duration": 0,
    "giveBondId": "victoriaShip",
    "givePowerId": null,
    "canGiveBond": false,
    "requiresBondId": null,
    "effectId": "eff_acgarm044",
    "effectName": "加速维式重锤",
    "desc": "攻击力+45%；攻击速度+30",
    "descRaw": "攻击力<@ba.vup>+45%</>；攻击速度<@ba.vup>+30</>",
    "buffs": [
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "atk": 0.45
        },
        "bbStr": {
          "key": "attr_common_global_buff"
        }
      },
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "attack_speed": 30
        },
        "bbStr": {
          "key": "act1autochess_equip_acarm044_global_buff",
          "big_hammer": "chess_item_6_05_e"
        }
      }
    ],
    "params": {
      "atk": 0.45,
      "key": "attr_common_global_buff",
      "attack_speed": 30,
      "big_hammer": "chess_item_6_05_e"
    },
    "category": "STAT",
    "kind": "passive",
    "family": "hammer",
    "implFormula": "ATK% += atk; ASPD += attack_speed (the hammer 'special effect' = the ASPD part).",
    "note": null,
    "rangeGrid": [
      [
        0,
        0
      ]
    ],
    "flavor": "一柄曾在维多利亚的工厂内铸造和平的重锤，如今它的势头更猛。\n“用同样的铁与火，去终结那场战争。”",
    "stackMax": 20,
    "stackGroup": "vickiHammer"
  }
}
```

### 修改：有限加速器 · chess_item_4_03_e_a

原版：每次攻击或治疗后，本场战斗中攻击速度+1，最高60层

炸惊：每次攻击或治疗后，本场战斗中攻击速度+1，最高60层

```json
{
  "before": {
    "id": "chess_item_4_03_e_a",
    "baseId": "chess_item_4_03_e_a",
    "goldenId": "chess_item_4_03_e_b",
    "isGolden": false,
    "trapId": "trap_1052_acarm052",
    "iconId": "trap_1052_acarm052",
    "identifier": 278,
    "name": "有限加速器",
    "itemType": "EQUIP",
    "tier": 4,
    "shopSortId": 3,
    "price": 2,
    "hideInShop": false,
    "shopExcluded": false,
    "shopExcludedBy": null,
    "mergeable": true,
    "upgradeNum": 2,
    "upgradeChessId": "chess_item_4_03_e_b",
    "duration": -1,
    "giveBondId": null,
    "givePowerId": null,
    "canGiveBond": false,
    "requiresBondId": null,
    "effectId": "eff_acarm052",
    "effectName": "有限加速器",
    "desc": "每次攻击或治疗后，本场战斗中攻击速度+1，最高60层",
    "descRaw": "每次攻击或治疗后，本场战斗中攻击速度<@ba.vup>+1</>，最高60层",
    "buffs": [
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "COUNTING",
        "bb": {
          "attack_speed": 1,
          "max_buff_cnt": 60,
          "atk": 0
        },
        "bbStr": {
          "key": "act1vautochess_equip_acarm037_global_buff"
        }
      }
    ],
    "params": {
      "attack_speed": 1,
      "max_buff_cnt": 60,
      "atk": 0,
      "key": "act1vautochess_equip_acarm037_global_buff"
    },
    "category": "ON_HIT",
    "kind": "passive_counter",
    "family": null,
    "implFormula": "After each attack or heal: stacks = min(stacks+1, max_buff_cnt); ASPD += attack_speed * stacks. Resets each battle.",
    "note": null,
    "rangeGrid": [
      [
        0,
        0
      ]
    ],
    "flavor": "“通过触摸有限的极致，我们得以观察无限的边缘。”"
  },
  "after": {
    "id": "chess_item_4_03_e_a",
    "baseId": "chess_item_4_03_e_a",
    "goldenId": "chess_item_4_03_e_b",
    "isGolden": false,
    "trapId": "trap_1052_acarm052",
    "iconId": "trap_1052_acarm052",
    "identifier": 278,
    "name": "有限加速器",
    "itemType": "EQUIP",
    "tier": 4,
    "shopSortId": 3,
    "price": 2,
    "hideInShop": false,
    "shopExcluded": false,
    "shopExcludedBy": null,
    "mergeable": true,
    "upgradeNum": 2,
    "upgradeChessId": "chess_item_4_03_e_b",
    "duration": -1,
    "giveBondId": "skillfulShip",
    "givePowerId": null,
    "canGiveBond": false,
    "requiresBondId": null,
    "effectId": "eff_acarm052",
    "effectName": "有限加速器",
    "desc": "每次攻击或治疗后，本场战斗中攻击速度+1，最高60层",
    "descRaw": "每次攻击或治疗后，本场战斗中攻击速度<@ba.vup>+1</>，最高60层",
    "buffs": [
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "COUNTING",
        "bb": {
          "attack_speed": 1,
          "max_buff_cnt": 60,
          "atk": 0
        },
        "bbStr": {
          "key": "act1vautochess_equip_acarm037_global_buff"
        }
      }
    ],
    "params": {
      "attack_speed": 1,
      "max_buff_cnt": 60,
      "atk": 0,
      "key": "act1vautochess_equip_acarm037_global_buff"
    },
    "category": "ON_HIT",
    "kind": "passive_counter",
    "family": null,
    "implFormula": "After each attack or heal: stacks = min(stacks+1, max_buff_cnt); ASPD += attack_speed * stacks. Resets each battle.",
    "note": null,
    "rangeGrid": [
      [
        0,
        0
      ]
    ],
    "flavor": "“通过触摸有限的极致，我们得以观察无限的边缘。”"
  }
}
```

### 修改：有限加速器 · chess_item_4_03_e_b

原版：每次攻击或治疗后，本场战斗中攻击速度+2，最高60层

炸惊：每次攻击或治疗后，本场战斗中攻击速度+2，最高60层

```json
{
  "before": {
    "id": "chess_item_4_03_e_b",
    "baseId": "chess_item_4_03_e_a",
    "goldenId": "chess_item_4_03_e_b",
    "isGolden": true,
    "trapId": "trap_1052_acarm052",
    "iconId": "trap_1052_acarm052",
    "identifier": 337,
    "name": "有限加速器",
    "itemType": "EQUIP",
    "tier": 4,
    "shopSortId": 3,
    "price": 5,
    "hideInShop": false,
    "shopExcluded": false,
    "shopExcludedBy": null,
    "mergeable": false,
    "upgradeNum": 0,
    "upgradeChessId": null,
    "duration": 0,
    "giveBondId": null,
    "givePowerId": null,
    "canGiveBond": false,
    "requiresBondId": null,
    "effectId": "eff_acgarm052",
    "effectName": "有限加速器",
    "desc": "每次攻击或治疗后，本场战斗中攻击速度+2，最高60层",
    "descRaw": "每次攻击或治疗后，本场战斗中攻击速度<@ba.vup>+2</>，最高60层",
    "buffs": [
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "COUNTING",
        "bb": {
          "attack_speed": 2,
          "max_buff_cnt": 60,
          "atk": 0
        },
        "bbStr": {
          "key": "act1vautochess_equip_acarm037_global_buff"
        }
      }
    ],
    "params": {
      "attack_speed": 2,
      "max_buff_cnt": 60,
      "atk": 0,
      "key": "act1vautochess_equip_acarm037_global_buff"
    },
    "category": "ON_HIT",
    "kind": "passive_counter",
    "family": null,
    "implFormula": "After each attack or heal: stacks = min(stacks+1, max_buff_cnt); ASPD += attack_speed * stacks. Resets each battle.",
    "note": null,
    "rangeGrid": [
      [
        0,
        0
      ]
    ],
    "flavor": "“通过触摸有限的极致，我们得以观察无限的边缘。”"
  },
  "after": {
    "id": "chess_item_4_03_e_b",
    "baseId": "chess_item_4_03_e_a",
    "goldenId": "chess_item_4_03_e_b",
    "isGolden": true,
    "trapId": "trap_1052_acarm052",
    "iconId": "trap_1052_acarm052",
    "identifier": 337,
    "name": "有限加速器",
    "itemType": "EQUIP",
    "tier": 4,
    "shopSortId": 3,
    "price": 5,
    "hideInShop": false,
    "shopExcluded": false,
    "shopExcludedBy": null,
    "mergeable": false,
    "upgradeNum": 0,
    "upgradeChessId": null,
    "duration": 0,
    "giveBondId": "skillfulShip",
    "givePowerId": null,
    "canGiveBond": false,
    "requiresBondId": null,
    "effectId": "eff_acgarm052",
    "effectName": "有限加速器",
    "desc": "每次攻击或治疗后，本场战斗中攻击速度+2，最高60层",
    "descRaw": "每次攻击或治疗后，本场战斗中攻击速度<@ba.vup>+2</>，最高60层",
    "buffs": [
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "COUNTING",
        "bb": {
          "attack_speed": 2,
          "max_buff_cnt": 60,
          "atk": 0
        },
        "bbStr": {
          "key": "act1vautochess_equip_acarm037_global_buff"
        }
      }
    ],
    "params": {
      "attack_speed": 2,
      "max_buff_cnt": 60,
      "atk": 0,
      "key": "act1vautochess_equip_acarm037_global_buff"
    },
    "category": "ON_HIT",
    "kind": "passive_counter",
    "family": null,
    "implFormula": "After each attack or heal: stacks = min(stacks+1, max_buff_cnt); ASPD += attack_speed * stacks. Resets each battle.",
    "note": null,
    "rangeGrid": [
      [
        0,
        0
      ]
    ],
    "flavor": "“通过触摸有限的极致，我们得以观察无限的边缘。”"
  }
}
```

### 修改：灼燃维式重锤 · chess_item_4_09_e_a

原版：攻击力+30%；造成法术伤害附带相当于10%伤害的灼燃损伤

炸惊：攻击力+30%；造成法术伤害附带相当于10%伤害的灼燃损伤

```json
{
  "before": {
    "id": "chess_item_4_09_e_a",
    "baseId": "chess_item_4_09_e_a",
    "goldenId": "chess_item_4_09_e_b",
    "isGolden": false,
    "trapId": "trap_1042_acarm042",
    "iconId": "trap_1042_acarm042",
    "identifier": 268,
    "name": "灼燃维式重锤",
    "itemType": "EQUIP",
    "tier": 4,
    "shopSortId": 9,
    "price": 2,
    "hideInShop": false,
    "shopExcluded": true,
    "shopExcludedBy": "维多利亚盟约每25层 / 洛洛的定制品",
    "mergeable": true,
    "upgradeNum": 2,
    "upgradeChessId": "chess_item_4_09_e_b",
    "duration": -1,
    "giveBondId": "victoriaShip",
    "givePowerId": null,
    "canGiveBond": false,
    "requiresBondId": null,
    "effectId": "eff_acarm042",
    "effectName": "灼燃维式重锤",
    "desc": "攻击力+30%；造成法术伤害附带相当于10%伤害的灼燃损伤",
    "descRaw": "攻击力<@ba.vup>+30%</>；造成法术伤害附带相当于<@ba.vup>10%</>伤害的<$ba.dt.burning2>灼燃损伤</>",
    "buffs": [
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "atk": 0.3
        },
        "bbStr": {
          "key": "attr_common_global_buff"
        }
      },
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "damage_scale": 0.1
        },
        "bbStr": {
          "key": "act1autochess_equip_acarm042_global_buff",
          "big_hammer": "chess_item_6_05_e"
        }
      }
    ],
    "params": {
      "atk": 0.3,
      "key": "attr_common_global_buff",
      "damage_scale": 0.1,
      "big_hammer": "chess_item_6_05_e"
    },
    "category": "ON_HIT",
    "kind": "passive",
    "family": "hammer",
    "implFormula": "ATK% += atk. When dealing ARTS damage: also inflict 灼燃损伤(Burn elemental damage) = damage_scale * that damage.",
    "note": null,
    "rangeGrid": [
      [
        0,
        0
      ]
    ],
    "flavor": "一柄曾在维多利亚的工厂内铸造和平的重锤，如今它的火焰更旺。\n“用同样的铁与火，去终结那场战争。”"
  },
  "after": {
    "id": "chess_item_4_09_e_a",
    "baseId": "chess_item_4_09_e_a",
    "goldenId": "chess_item_4_09_e_b",
    "isGolden": false,
    "trapId": "trap_1042_acarm042",
    "iconId": "trap_1042_acarm042",
    "identifier": 268,
    "name": "灼燃维式重锤",
    "itemType": "EQUIP",
    "tier": 4,
    "shopSortId": 9,
    "price": 2,
    "hideInShop": false,
    "shopExcluded": true,
    "shopExcludedBy": "维多利亚盟约每25层 / 洛洛的定制品",
    "mergeable": true,
    "upgradeNum": 2,
    "upgradeChessId": "chess_item_4_09_e_b",
    "duration": -1,
    "giveBondId": "victoriaShip",
    "givePowerId": null,
    "canGiveBond": false,
    "requiresBondId": null,
    "effectId": "eff_acarm042",
    "effectName": "灼燃维式重锤",
    "desc": "攻击力+30%；造成法术伤害附带相当于10%伤害的灼燃损伤",
    "descRaw": "攻击力<@ba.vup>+30%</>；造成法术伤害附带相当于<@ba.vup>10%</>伤害的<$ba.dt.burning2>灼燃损伤</>",
    "buffs": [
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "atk": 0.3
        },
        "bbStr": {
          "key": "attr_common_global_buff"
        }
      },
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "damage_scale": 0.1
        },
        "bbStr": {
          "key": "act1autochess_equip_acarm042_global_buff",
          "big_hammer": "chess_item_6_05_e"
        }
      }
    ],
    "params": {
      "atk": 0.3,
      "key": "attr_common_global_buff",
      "damage_scale": 0.1,
      "big_hammer": "chess_item_6_05_e"
    },
    "category": "ON_HIT",
    "kind": "passive",
    "family": "hammer",
    "implFormula": "ATK% += atk. When dealing ARTS damage: also inflict 灼燃损伤(Burn elemental damage) = damage_scale * that damage.",
    "note": null,
    "rangeGrid": [
      [
        0,
        0
      ]
    ],
    "flavor": "一柄曾在维多利亚的工厂内铸造和平的重锤，如今它的火焰更旺。\n“用同样的铁与火，去终结那场战争。”",
    "stackMax": 20,
    "stackGroup": "vickiHammer"
  }
}
```

### 修改：灼燃维式重锤 · chess_item_4_09_e_b

原版：攻击力+50%；造成法术伤害附带相当于10%伤害的灼燃损伤

炸惊：攻击力+50%；造成法术伤害附带相当于10%伤害的灼燃损伤

```json
{
  "before": {
    "id": "chess_item_4_09_e_b",
    "baseId": "chess_item_4_09_e_a",
    "goldenId": "chess_item_4_09_e_b",
    "isGolden": true,
    "trapId": "trap_1042_acarm042",
    "iconId": "trap_1042_acarm042",
    "identifier": 327,
    "name": "灼燃维式重锤",
    "itemType": "EQUIP",
    "tier": 4,
    "shopSortId": 9,
    "price": 5,
    "hideInShop": false,
    "shopExcluded": true,
    "shopExcludedBy": "维多利亚盟约每25层 / 洛洛的定制品",
    "mergeable": false,
    "upgradeNum": 0,
    "upgradeChessId": null,
    "duration": 0,
    "giveBondId": "victoriaShip",
    "givePowerId": null,
    "canGiveBond": false,
    "requiresBondId": null,
    "effectId": "eff_acgarm042",
    "effectName": "灼燃维式重锤",
    "desc": "攻击力+50%；造成法术伤害附带相当于10%伤害的灼燃损伤",
    "descRaw": "攻击力<@ba.vup>+50%</>；造成法术伤害附带相当于<@ba.vup>10%</>伤害的<$ba.dt.burning2>灼燃损伤</>",
    "buffs": [
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "atk": 0.5
        },
        "bbStr": {
          "key": "attr_common_global_buff"
        }
      },
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "damage_scale": 0.1
        },
        "bbStr": {
          "key": "act1autochess_equip_acarm042_global_buff",
          "big_hammer": "chess_item_6_05_e"
        }
      }
    ],
    "params": {
      "atk": 0.5,
      "key": "attr_common_global_buff",
      "damage_scale": 0.1,
      "big_hammer": "chess_item_6_05_e"
    },
    "category": "ON_HIT",
    "kind": "passive",
    "family": "hammer",
    "implFormula": "ATK% += atk. When dealing ARTS damage: also inflict 灼燃损伤(Burn elemental damage) = damage_scale * that damage.",
    "note": null,
    "rangeGrid": [
      [
        0,
        0
      ]
    ],
    "flavor": "一柄曾在维多利亚的工厂内铸造和平的重锤，如今它的火焰更旺。\n“用同样的铁与火，去终结那场战争。”"
  },
  "after": {
    "id": "chess_item_4_09_e_b",
    "baseId": "chess_item_4_09_e_a",
    "goldenId": "chess_item_4_09_e_b",
    "isGolden": true,
    "trapId": "trap_1042_acarm042",
    "iconId": "trap_1042_acarm042",
    "identifier": 327,
    "name": "灼燃维式重锤",
    "itemType": "EQUIP",
    "tier": 4,
    "shopSortId": 9,
    "price": 5,
    "hideInShop": false,
    "shopExcluded": true,
    "shopExcludedBy": "维多利亚盟约每25层 / 洛洛的定制品",
    "mergeable": false,
    "upgradeNum": 0,
    "upgradeChessId": null,
    "duration": 0,
    "giveBondId": "victoriaShip",
    "givePowerId": null,
    "canGiveBond": false,
    "requiresBondId": null,
    "effectId": "eff_acgarm042",
    "effectName": "灼燃维式重锤",
    "desc": "攻击力+50%；造成法术伤害附带相当于10%伤害的灼燃损伤",
    "descRaw": "攻击力<@ba.vup>+50%</>；造成法术伤害附带相当于<@ba.vup>10%</>伤害的<$ba.dt.burning2>灼燃损伤</>",
    "buffs": [
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "atk": 0.5
        },
        "bbStr": {
          "key": "attr_common_global_buff"
        }
      },
      {
        "key": "env_gbuff_new_with_verify",
        "countType": "NONE",
        "bb": {
          "damage_scale": 0.1
        },
        "bbStr": {
          "key": "act1autochess_equip_acarm042_global_buff",
          "big_hammer": "chess_item_6_05_e"
        }
      }
    ],
    "params": {
      "atk": 0.5,
      "key": "attr_common_global_buff",
      "damage_scale": 0.1,
      "big_hammer": "chess_item_6_05_e"
    },
    "category": "ON_HIT",
    "kind": "passive",
    "family": "hammer",
    "implFormula": "ATK% += atk. When dealing ARTS damage: also inflict 灼燃损伤(Burn elemental damage) = damage_scale * that damage.",
    "note": null,
    "rangeGrid": [
      [
        0,
        0
      ]
    ],
    "flavor": "一柄曾在维多利亚的工厂内铸造和平的重锤，如今它的火焰更旺。\n“用同样的铁与火，去终结那场战争。”",
    "stackMax": 20,
    "stackGroup": "vickiHammer"
  }
}
```

## bands

新增 2，删除 0，修改 0。

### 新增：祀 · band_zj_si

炸惊：【长兄如父】第1回合获得一名精锐重岳（炎 / 岁 / 迅捷盟约），其发动技能时使已激活的【炎】、【迅捷】层数+1；累计花费50资金后，获得1名4阶及以上随机的精锐<岁>干员。（技能局内可切换）
在<岁>部分干员缺席时体验可能不完整

```json
{
  "bandId": "band_zj_si",
  "sortId": 0,
  "name": "祀",
  "iconId": "band_zj_si",
  "modeTypeList": [
    "SINGLE",
    "MULTI"
  ],
  "zjOnly": true,
  "totalHp": 13,
  "effectId": "aceffect_band_zj_si",
  "effectName": "长兄如父",
  "desc": "【长兄如父】第1回合获得一名精锐重岳（炎 / 岁 / 迅捷盟约），其发动技能时使已激活的【炎】、【迅捷】层数+1；累计花费50资金后，获得1名4阶及以上随机的精锐<岁>干员。（技能局内可切换）\n在<岁>部分干员缺席时体验可能不完整",
  "descRaw": "【长兄如父】第1回合获得一名精锐重岳（炎 / 岁 / 迅捷盟约），其发动技能时使已激活的【炎】、【迅捷】层数+1；累计花费50资金后，获得1名4阶及以上随机的精锐<岁>干员。（技能局内可切换）\n<@ba.vdown>在<岁>部分干员缺席时体验可能不完整</>",
  "buffs": [
    {
      "key": "zj_si_grant_chyue",
      "bb": {},
      "bbStr": {}
    },
    {
      "key": "zj_si_skill_layers",
      "bb": {
        "layer": 1
      },
      "bbStr": {
        "key": "zj_si_skill_layers"
      }
    },
    {
      "key": "zj_si_spend_sui",
      "bb": {
        "spend": 50
      },
      "bbStr": {}
    }
  ],
  "params": {
    "layer": 1,
    "spend": 50
  }
}
```

### 新增：山岸风花 · band_zj_fuuka

炸惊：【神通法】战斗中【S.E.E.S】干员部署时，获得相当于2倍调度中心等级的【S.E.E.S】层数。

```json
{
  "bandId": "band_zj_fuuka",
  "sortId": 0,
  "name": "山岸风花",
  "iconId": "band_zj_fuuka",
  "modeTypeList": [
    "SINGLE",
    "MULTI"
  ],
  "zjOnly": true,
  "totalHp": 22,
  "effectId": "aceffect_band_zj_fuuka",
  "effectName": "神通法",
  "desc": "【神通法】战斗中【S.E.E.S】干员部署时，获得相当于2倍调度中心等级的【S.E.E.S】层数。",
  "descRaw": "【神通法】战斗中【S.E.E.S】干员<@ba.vup>部署</>时，获得相当于<@ba.vup>2</>倍<@ba.vup>调度中心等级</>的【S.E.E.S】层数。",
  "buffs": [
    {
      "key": "zj_fuuka_sees_deploy",
      "bb": {
        "mult": 2
      },
      "bbStr": {
        "key": "zj_fuuka_sees_deploy"
      }
    }
  ],
  "params": {
    "mult": 2
  }
}
```

## choices

新增 0，删除 0，修改 1。

### 修改：pools · pools

原版：（无独立效果文字；见参数对照）

炸惊：（结构或参数变化；见下列完整记录）

```json
{
  "before": {
    "pool_equip_normal": {
      "kind": "equip",
      "rule": "shopEligible",
      "maxTier": "shopLevel",
      "assumed": true
    },
    "pool_equip_shop_1": {
      "kind": "equip",
      "rule": "shopEligible",
      "tiers": [
        1
      ],
      "assumed": true
    },
    "pool_equip_kathe": {
      "kind": "equip",
      "rule": "shopEligible",
      "maxTier": "shopLevel",
      "assumed": true
    },
    "pool_equip_narant": {
      "kind": "equip",
      "rule": "shopEligible",
      "maxTier": "shopLevel",
      "assumed": true
    },
    "pool_equip_vict": {
      "kind": "equip",
      "items": [
        "chess_item_4_09_e_a",
        "chess_item_3_09_e_a",
        "chess_item_3_10_e_a",
        "chess_item_2_03_e_a"
      ],
      "assumed": true
    },
    "pool_equip_pepe": {
      "kind": "equip",
      "weighted": [
        [
          "chess_item_1_03_e_a",
          45
        ],
        [
          "chess_item_2_04_e_a",
          45
        ],
        [
          "chess_item_6_07_e_a",
          10
        ]
      ],
      "goldenWeights": [
        40,
        40,
        20
      ],
      "assumed": true
    },
    "pool_equip_rockr": {
      "kind": "equip",
      "items": [
        "chess_item_4_09_e_a",
        "chess_item_3_09_e_a",
        "chess_item_3_10_e_a",
        "chess_item_2_03_e_a"
      ],
      "assumed": true
    },
    "pool_chess_glady": {
      "kind": "chess",
      "items": [
        "chess_char_3_05_a",
        "chess_char_2_07_a",
        "chess_char_1_04_a"
      ],
      "assumed": true
    },
    "pool_char_pinus": {
      "kind": "chess",
      "weighted": [
        [
          "chess_char_1_19_a",
          45
        ],
        [
          "chess_char_2_18_a",
          45
        ],
        [
          "chess_char_4_20_a",
          10
        ]
      ],
      "assumed": true
    },
    "pool_char_later": {
      "kind": "chess",
      "bond": "lateranoShip",
      "minTier": 4,
      "golden": true,
      "rule": "shopEligible",
      "assumed": true
    },
    "pool_chess_shop_1_reward": {
      "kind": "chess",
      "tier": 1,
      "rule": "shopEligible",
      "assumed": true
    },
    "pool_chess_shop_2_reward": {
      "kind": "chess",
      "tier": 2,
      "rule": "shopEligible",
      "assumed": true
    },
    "pool_chess_shop_3_reward": {
      "kind": "chess",
      "tier": 3,
      "rule": "shopEligible",
      "assumed": true
    },
    "pool_chess_shop_4_reward": {
      "kind": "chess",
      "tier": 4,
      "rule": "shopEligible",
      "assumed": true
    },
    "pool_chess_shop_5_reward": {
      "kind": "chess",
      "tier": 5,
      "rule": "shopEligible",
      "assumed": true
    },
    "pool_chess_shop_6_reward": {
      "kind": "chess",
      "tier": 6,
      "rule": "shopEligible",
      "assumed": true
    }
  },
  "after": {
    "pool_equip_normal": {
      "kind": "equip",
      "rule": "shopEligible",
      "maxTier": "shopLevel",
      "assumed": true
    },
    "pool_equip_shop_1": {
      "kind": "equip",
      "rule": "shopEligible",
      "tiers": [
        1
      ],
      "assumed": true
    },
    "pool_equip_kathe": {
      "kind": "equip",
      "rule": "shopEligible",
      "maxTier": "shopLevel",
      "assumed": true
    },
    "pool_equip_narant": {
      "kind": "equip",
      "rule": "shopEligible",
      "maxTier": "shopLevel",
      "assumed": true
    },
    "pool_equip_vict": {
      "kind": "equip",
      "items": [
        "chess_item_4_09_e_a",
        "chess_item_3_09_e_a",
        "chess_item_3_10_e_a",
        "chess_item_2_03_e_a"
      ],
      "assumed": true
    },
    "pool_equip_pepe": {
      "kind": "equip",
      "weighted": [
        [
          "chess_item_1_03_e_a",
          45
        ],
        [
          "chess_item_2_04_e_a",
          45
        ],
        [
          "chess_item_6_07_e_a",
          10
        ]
      ],
      "goldenWeights": [
        40,
        40,
        20
      ],
      "assumed": true
    },
    "pool_equip_rockr": {
      "kind": "equip",
      "items": [
        "chess_item_4_09_e_a",
        "chess_item_3_09_e_a",
        "chess_item_3_10_e_a",
        "chess_item_2_03_e_a"
      ],
      "assumed": true
    },
    "pool_chess_glady": {
      "kind": "chess",
      "items": [
        "chess_char_3_05_a",
        "chess_char_2_07_a",
        "chess_char_1_04_a"
      ],
      "assumed": true
    },
    "pool_char_pinus": {
      "kind": "chess",
      "weighted": [
        [
          "chess_char_1_19_a",
          45
        ],
        [
          "chess_char_2_18_a",
          45
        ],
        [
          "chess_char_4_20_a",
          10
        ]
      ],
      "assumed": true
    },
    "pool_char_later": {
      "kind": "chess",
      "bond": "lateranoShip",
      "minTier": 4,
      "golden": true,
      "rule": "shopEligible",
      "assumed": true
    },
    "pool_chess_shop_1_reward": {
      "kind": "chess",
      "tier": 1,
      "rule": "shopEligible",
      "assumed": true
    },
    "pool_chess_shop_2_reward": {
      "kind": "chess",
      "tier": 2,
      "rule": "shopEligible",
      "assumed": true
    },
    "pool_chess_shop_3_reward": {
      "kind": "chess",
      "tier": 3,
      "rule": "shopEligible",
      "assumed": true
    },
    "pool_chess_shop_4_reward": {
      "kind": "chess",
      "tier": 4,
      "rule": "shopEligible",
      "assumed": true
    },
    "pool_chess_shop_5_reward": {
      "kind": "chess",
      "tier": 5,
      "rule": "shopEligible",
      "assumed": true
    },
    "pool_chess_shop_6_reward": {
      "kind": "chess",
      "tier": 6,
      "rule": "shopEligible",
      "assumed": true
    },
    "pool_chess_glady_zj": {
      "kind": "chess",
      "items": [
        "chess_zj_34_a",
        "chess_zj_20_a",
        "chess_zj_04_a"
      ],
      "assumed": true
    }
  }
}
```

## enemies

新增 0，删除 0，修改 3。

### 修改：帝国炮火先兆者 · enemy_1112_emppnt

原版：乌萨斯军炮兵术师操作的无人机，装甲厚重，材质坚实

炸惊：乌萨斯军炮兵术师操作的无人机，装甲厚重，材质坚实

```json
{
  "before": {
    "key": "enemy_1112_emppnt",
    "name": "帝国炮火先兆者",
    "level": 0,
    "rank": "ELITE",
    "handbookIndex": "U11",
    "desc": "乌萨斯军炮兵术师操作的无人机，装甲厚重，材质坚实",
    "descRaw": "乌萨斯军炮兵术师操作的无人机，装甲厚重，材质坚实",
    "applyWay": "RANGED",
    "stats": {
      "maxHp": 13000,
      "atk": 1000,
      "def": 800,
      "res": 50,
      "moveSpeed": 0.5,
      "bat": 5,
      "aspd": 100,
      "rangeRadius": 2,
      "rawRangeRadius": 2,
      "blockCnt": 1,
      "massLevel": 4,
      "lpr": 1,
      "hpRecoveryPerSec": 0,
      "elementRes": 0,
      "elementDmgRes": 0,
      "hitRatePhys": 0,
      "hitRateArts": 0,
      "dmgType": "phys",
      "dmgTypes": [
        "phys"
      ],
      "motion": "FLY",
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "otherImmunities": [],
      "tauntLevel": 0
    },
    "abilities": [
      {
        "text": "飞行单位",
        "textRaw": "飞行单位",
        "format": "NORMAL"
      }
    ],
    "talents": {
      "bb": {},
      "bbStr": {}
    },
    "skills": [],
    "notCountInTotal": false,
    "tags": [
      "drone"
    ],
    "be": 102750,
    "beFactor": 0.2,
    "attrPower": 20550,
    "isFlyEnemy": true,
    "tokenOnly": false,
    "acTypes": [
      "FLY"
    ],
    "acType": "FLY",
    "templateSlot": null,
    "summons": [],
    "inactiveIn": [
      "mode_single_funny",
      "mode_single_normal",
      "mode_multi_funny",
      "mode_multi_normal"
    ],
    "seasonOverride": null,
    "iconId": "enemy_1112_emppnt",
    "spine": "enemy_1112_emppnt",
    "staticBody": true,
    "modelScale": 0.7037,
    "attackAnim": {
      "clip": "Attack",
      "dur": 1.167,
      "hit": 0.333
    }
  },
  "after": {
    "key": "enemy_1112_emppnt",
    "name": "帝国炮火先兆者",
    "level": 0,
    "rank": "ELITE",
    "handbookIndex": "U11",
    "desc": "乌萨斯军炮兵术师操作的无人机，装甲厚重，材质坚实",
    "descRaw": "乌萨斯军炮兵术师操作的无人机，装甲厚重，材质坚实",
    "applyWay": "RANGED",
    "stats": {
      "maxHp": 13000,
      "atk": 1000,
      "def": 800,
      "res": 50,
      "moveSpeed": 0.5,
      "bat": 5,
      "aspd": 100,
      "rangeRadius": 2,
      "rawRangeRadius": 2,
      "blockCnt": 1,
      "massLevel": 4,
      "lpr": 1,
      "hpRecoveryPerSec": 0,
      "elementRes": 0,
      "elementDmgRes": 0,
      "hitRatePhys": 0,
      "hitRateArts": 0,
      "dmgType": "phys",
      "dmgTypes": [
        "phys"
      ],
      "motion": "FLY",
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "otherImmunities": [],
      "tauntLevel": 0
    },
    "abilities": [
      {
        "text": "飞行单位",
        "textRaw": "飞行单位",
        "format": "NORMAL"
      }
    ],
    "talents": {
      "bb": {},
      "bbStr": {}
    },
    "skills": [],
    "notCountInTotal": false,
    "tags": [
      "drone"
    ],
    "be": 102750,
    "beFactor": 0.2,
    "attrPower": 20550,
    "isFlyEnemy": true,
    "tokenOnly": false,
    "acTypes": [
      "FLY"
    ],
    "acType": "FLY",
    "templateSlot": null,
    "summons": [],
    "inactiveIn": [
      "mode_single_funny",
      "mode_single_normal",
      "mode_multi_funny",
      "mode_multi_normal"
    ],
    "seasonOverride": null,
    "iconId": "enemy_1112_emppnt",
    "spine": "enemy_1112_emppnt",
    "staticBody": true,
    "modelScale": 0.7037,
    "attackAnim": {
      "clip": "Attack",
      "dur": 1.167,
      "hit": 0.333
    },
    "modelScaleY": 1.263
  }
}
```

### 修改：帝国炮火中枢先兆者 · enemy_1112_emppnt_2

原版：乌萨斯军炮兵术师操作的无人机中枢，装甲厚重，材质坚实

炸惊：乌萨斯军炮兵术师操作的无人机中枢，装甲厚重，材质坚实

```json
{
  "before": {
    "key": "enemy_1112_emppnt_2",
    "name": "帝国炮火中枢先兆者",
    "level": 0,
    "rank": "ELITE",
    "handbookIndex": "U12",
    "desc": "乌萨斯军炮兵术师操作的无人机中枢，装甲厚重，材质坚实",
    "descRaw": "乌萨斯军炮兵术师操作的无人机中枢，装甲厚重，材质坚实",
    "applyWay": "RANGED",
    "stats": {
      "maxHp": 16000,
      "atk": 1200,
      "def": 800,
      "res": 50,
      "moveSpeed": 0.5,
      "bat": 5,
      "aspd": 100,
      "rangeRadius": 2,
      "rawRangeRadius": 2,
      "blockCnt": 1,
      "massLevel": 4,
      "lpr": 1,
      "hpRecoveryPerSec": 0,
      "elementRes": 0,
      "elementDmgRes": 0,
      "hitRatePhys": 0,
      "hitRateArts": 0,
      "dmgType": "phys",
      "dmgTypes": [
        "phys"
      ],
      "motion": "FLY",
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "otherImmunities": [],
      "tauntLevel": 0
    },
    "abilities": [
      {
        "text": "飞行单位",
        "textRaw": "飞行单位",
        "format": "NORMAL"
      }
    ],
    "talents": {
      "bb": {},
      "bbStr": {}
    },
    "skills": [],
    "notCountInTotal": false,
    "tags": [
      "drone"
    ],
    "be": 122750,
    "beFactor": 0.2,
    "attrPower": 24550,
    "isFlyEnemy": true,
    "tokenOnly": false,
    "acTypes": [],
    "acType": null,
    "templateSlot": null,
    "summons": [],
    "inactiveIn": [],
    "seasonOverride": null,
    "iconId": "enemy_1112_emppnt_2",
    "spine": "enemy_1112_emppnt_2",
    "staticBody": true,
    "modelScale": 0.7037,
    "attackAnim": {
      "clip": "Attack",
      "dur": 1.167,
      "hit": 0.333
    }
  },
  "after": {
    "key": "enemy_1112_emppnt_2",
    "name": "帝国炮火中枢先兆者",
    "level": 0,
    "rank": "ELITE",
    "handbookIndex": "U12",
    "desc": "乌萨斯军炮兵术师操作的无人机中枢，装甲厚重，材质坚实",
    "descRaw": "乌萨斯军炮兵术师操作的无人机中枢，装甲厚重，材质坚实",
    "applyWay": "RANGED",
    "stats": {
      "maxHp": 16000,
      "atk": 1200,
      "def": 800,
      "res": 50,
      "moveSpeed": 0.5,
      "bat": 5,
      "aspd": 100,
      "rangeRadius": 2,
      "rawRangeRadius": 2,
      "blockCnt": 1,
      "massLevel": 4,
      "lpr": 1,
      "hpRecoveryPerSec": 0,
      "elementRes": 0,
      "elementDmgRes": 0,
      "hitRatePhys": 0,
      "hitRateArts": 0,
      "dmgType": "phys",
      "dmgTypes": [
        "phys"
      ],
      "motion": "FLY",
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "otherImmunities": [],
      "tauntLevel": 0
    },
    "abilities": [
      {
        "text": "飞行单位",
        "textRaw": "飞行单位",
        "format": "NORMAL"
      }
    ],
    "talents": {
      "bb": {},
      "bbStr": {}
    },
    "skills": [],
    "notCountInTotal": false,
    "tags": [
      "drone"
    ],
    "be": 122750,
    "beFactor": 0.2,
    "attrPower": 24550,
    "isFlyEnemy": true,
    "tokenOnly": false,
    "acTypes": [],
    "acType": null,
    "templateSlot": null,
    "summons": [],
    "inactiveIn": [],
    "seasonOverride": null,
    "iconId": "enemy_1112_emppnt_2",
    "spine": "enemy_1112_emppnt_2",
    "staticBody": true,
    "modelScale": 0.7037,
    "attackAnim": {
      "clip": "Attack",
      "dur": 1.167,
      "hit": 0.333
    },
    "modelScaleY": 1.263
  }
}
```

### 修改：木制瑞印 · enemy_1196_msfyin

原版：不攻击，无法被阻挡，需要2次伤害击倒

炸惊：不攻击，无法被阻挡，需要2次伤害击倒

```json
{
  "before": {
    "key": "enemy_1196_msfyin",
    "name": "木制瑞印",
    "level": 0,
    "rank": "NORMAL",
    "handbookIndex": "AN3",
    "desc": "不攻击，无法被阻挡，需要2次伤害击倒",
    "descRaw": "不攻击，无法被阻挡，需要<@eb.key>2</>次伤害击倒",
    "applyWay": "NONE",
    "stats": {
      "maxHp": 2,
      "atk": 0,
      "def": 0,
      "res": 0,
      "moveSpeed": 0.8,
      "bat": 1,
      "aspd": 100,
      "rangeRadius": 0,
      "rawRangeRadius": 0,
      "blockCnt": 1,
      "massLevel": 0,
      "lpr": 1,
      "hpRecoveryPerSec": 0,
      "elementRes": 0,
      "elementDmgRes": 0,
      "hitRatePhys": 0,
      "hitRateArts": 0,
      "dmgType": "none",
      "dmgTypes": [
        "none"
      ],
      "motion": "WALK",
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "otherImmunities": [],
      "tauntLevel": 0
    },
    "abilities": [
      {
        "text": "无法被阻挡",
        "textRaw": "无法被阻挡",
        "format": "NORMAL"
      },
      {
        "text": "需要2次伤害击倒",
        "textRaw": "需要2次伤害击倒",
        "format": "NORMAL"
      }
    ],
    "talents": {
      "bb": {},
      "bbStr": {}
    },
    "skills": [],
    "notCountInTotal": false,
    "tags": [
      "animated"
    ],
    "be": 10,
    "beFactor": 0.2,
    "attrPower": 2,
    "isFlyEnemy": false,
    "tokenOnly": false,
    "acTypes": [],
    "acType": null,
    "templateSlot": null,
    "summons": [],
    "inactiveIn": [],
    "seasonOverride": null,
    "iconId": "enemy_1196_msfyin",
    "spine": "enemy_1196_msfyin",
    "modelScale": 1.4815
  },
  "after": {
    "key": "enemy_1196_msfyin",
    "name": "木制瑞印",
    "level": 0,
    "rank": "NORMAL",
    "handbookIndex": "AN3",
    "desc": "不攻击，无法被阻挡，需要2次伤害击倒",
    "descRaw": "不攻击，无法被阻挡，需要<@eb.key>2</>次伤害击倒",
    "applyWay": "NONE",
    "stats": {
      "maxHp": 2,
      "atk": 0,
      "def": 0,
      "res": 0,
      "moveSpeed": 0.8,
      "bat": 1,
      "aspd": 100,
      "rangeRadius": 0,
      "rawRangeRadius": 0,
      "blockCnt": 1,
      "massLevel": 0,
      "lpr": 1,
      "hpRecoveryPerSec": 0,
      "elementRes": 0,
      "elementDmgRes": 0,
      "hitRatePhys": 0,
      "hitRateArts": 0,
      "dmgType": "none",
      "dmgTypes": [
        "none"
      ],
      "motion": "WALK",
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "otherImmunities": [],
      "tauntLevel": 0
    },
    "abilities": [
      {
        "text": "无法被阻挡",
        "textRaw": "无法被阻挡",
        "format": "NORMAL"
      },
      {
        "text": "需要2次伤害击倒",
        "textRaw": "需要2次伤害击倒",
        "format": "NORMAL"
      }
    ],
    "talents": {
      "bb": {},
      "bbStr": {}
    },
    "skills": [],
    "notCountInTotal": false,
    "tags": [
      "animated"
    ],
    "be": 10,
    "beFactor": 0.2,
    "attrPower": 2,
    "isFlyEnemy": false,
    "tokenOnly": false,
    "acTypes": [],
    "acType": null,
    "templateSlot": null,
    "summons": [],
    "inactiveIn": [],
    "seasonOverride": null,
    "iconId": "enemy_1196_msfyin",
    "spine": "enemy_1196_msfyin",
    "modelScale": 1.4815,
    "mirrorX": true
  }
}
```

## bosses

新增 0，删除 0，修改 0。

## tokens

新增 15，删除 0，修改 0。

### 新增：塔纳托斯 · token_makoto_thanatos

炸惊：不阻挡敌人

```json
{
  "tokenId": "token_makoto_thanatos",
  "kind": "summon",
  "name": "塔纳托斯",
  "appellation": "Persona",
  "desc": "不阻挡敌人",
  "descRaw": "不阻挡敌人",
  "profession": "TOKEN",
  "subProfessionId": "notchar1",
  "position": "ALL",
  "displayType": "HIDDEN",
  "placeable": false,
  "ownerRange": false,
  "stats": {
    "maxHp": 1000,
    "atk": 677,
    "def": 0,
    "res": 0,
    "cost": 0,
    "blockCnt": 0,
    "bat": 1.1,
    "aspd": 100,
    "respawnTime": 70,
    "spRecovery": 1,
    "hpRecoveryPerSec": 0,
    "moveSpeed": 1,
    "tauntLevel": 0,
    "massLevel": 0,
    "deployLimit": 1,
    "deckStack": 0
  },
  "rangeGrid": [
    [
      1,
      -1
    ],
    [
      1,
      0
    ],
    [
      1,
      1
    ],
    [
      0,
      -1
    ],
    [
      0,
      0
    ],
    [
      0,
      1
    ],
    [
      -1,
      -1
    ],
    [
      -1,
      0
    ],
    [
      -1,
      1
    ]
  ],
  "dmgType": "arts",
  "attackKind": "melee",
  "projectile": "none",
  "canHitFly": true,
  "skill": null,
  "deployLimit": 1,
  "count": null,
  "abnormal": [],
  "assets": {
    "avatar": "char_4217_makoto",
    "spine": "char_4217_makoto"
  },
  "charId": "char_4217_makoto",
  "isGolden": false,
  "owners": [
    "char_4217_makoto@2/1/4/0",
    "char_4217_makoto@2/60/7/1",
    "char_4217_makoto@2/60/7/3"
  ],
  "variants": {
    "char_4217_makoto@2/1/4/0": {
      "phase": 2,
      "level": 1,
      "stats": {
        "maxHp": 1000,
        "atk": 677,
        "def": 0,
        "res": 0,
        "cost": 0,
        "blockCnt": 0,
        "bat": 1.1,
        "aspd": 100,
        "respawnTime": 70,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          1,
          -1
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          0,
          -1
        ],
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ]
      ],
      "trait": {
        "desc": "不阻挡敌人",
        "descRaw": "不阻挡敌人",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "arts",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": true,
      "targetPriority": null,
      "skill": null,
      "talents": [],
      "count": null,
      "sources": [
        "skill"
      ],
      "bySkill": {
        "0": {
          "skill": null,
          "count": null,
          "sources": [
            "skill"
          ]
        },
        "2": {
          "skill": null,
          "count": null,
          "sources": [
            "skill"
          ]
        }
      }
    },
    "char_4217_makoto@2/60/7/1": {
      "phase": 2,
      "level": 60,
      "stats": {
        "maxHp": 1000,
        "atk": 771,
        "def": 0,
        "res": 0,
        "cost": 0,
        "blockCnt": 0,
        "bat": 1.1,
        "aspd": 100,
        "respawnTime": 70,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          1,
          -1
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          0,
          -1
        ],
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ]
      ],
      "trait": {
        "desc": "不阻挡敌人",
        "descRaw": "不阻挡敌人",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "arts",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": true,
      "targetPriority": null,
      "skill": null,
      "talents": [],
      "count": null,
      "sources": [
        "skill"
      ],
      "bySkill": {
        "0": {
          "skill": null,
          "count": null,
          "sources": [
            "skill"
          ]
        },
        "2": {
          "skill": null,
          "count": null,
          "sources": [
            "skill"
          ]
        }
      },
      "byModule": {}
    },
    "char_4217_makoto@2/60/7/3": {
      "phase": 2,
      "level": 60,
      "stats": {
        "maxHp": 1000,
        "atk": 771,
        "def": 0,
        "res": 0,
        "cost": 0,
        "blockCnt": 0,
        "bat": 1.1,
        "aspd": 100,
        "respawnTime": 70,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          1,
          -1
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          0,
          -1
        ],
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ]
      ],
      "trait": {
        "desc": "不阻挡敌人",
        "descRaw": "不阻挡敌人",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "arts",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": true,
      "targetPriority": null,
      "skill": null,
      "talents": [],
      "count": null,
      "sources": [
        "skill"
      ],
      "bySkill": {
        "0": {
          "skill": null,
          "count": null,
          "sources": [
            "skill"
          ]
        },
        "2": {
          "skill": null,
          "count": null,
          "sources": [
            "skill"
          ]
        }
      },
      "byModule": {}
    }
  }
}
```

### 新增：俄耳甫斯 · token_makoto_orpheus

炸惊：不阻挡敌人

```json
{
  "tokenId": "token_makoto_orpheus",
  "kind": "summon",
  "name": "俄耳甫斯",
  "appellation": "Persona",
  "desc": "不阻挡敌人",
  "descRaw": "不阻挡敌人",
  "profession": "TOKEN",
  "subProfessionId": "notchar1",
  "position": "ALL",
  "displayType": "HIDDEN",
  "placeable": false,
  "ownerRange": false,
  "stats": {
    "maxHp": 1000,
    "atk": 677,
    "def": 0,
    "res": 0,
    "cost": 0,
    "blockCnt": 0,
    "bat": 1.1,
    "aspd": 100,
    "respawnTime": 70,
    "spRecovery": 1,
    "hpRecoveryPerSec": 0,
    "moveSpeed": 1,
    "tauntLevel": 0,
    "massLevel": 0,
    "deployLimit": 1,
    "deckStack": 0
  },
  "rangeGrid": [
    [
      1,
      -1
    ],
    [
      1,
      0
    ],
    [
      1,
      1
    ],
    [
      0,
      -1
    ],
    [
      0,
      0
    ],
    [
      0,
      1
    ],
    [
      -1,
      -1
    ],
    [
      -1,
      0
    ],
    [
      -1,
      1
    ]
  ],
  "dmgType": "arts",
  "attackKind": "melee",
  "projectile": "none",
  "canHitFly": true,
  "skill": null,
  "deployLimit": 1,
  "count": null,
  "abnormal": [],
  "assets": {
    "avatar": "char_4217_makoto",
    "spine": "char_4217_makoto"
  },
  "charId": "char_4217_makoto",
  "isGolden": false,
  "owners": [
    "char_4217_makoto@2/1/4/0",
    "char_4217_makoto@2/60/7/1",
    "char_4217_makoto@2/60/7/3"
  ],
  "variants": {
    "char_4217_makoto@2/1/4/0": {
      "phase": 2,
      "level": 1,
      "stats": {
        "maxHp": 1000,
        "atk": 677,
        "def": 0,
        "res": 0,
        "cost": 0,
        "blockCnt": 0,
        "bat": 1.1,
        "aspd": 100,
        "respawnTime": 70,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          1,
          -1
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          0,
          -1
        ],
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ]
      ],
      "trait": {
        "desc": "不阻挡敌人",
        "descRaw": "不阻挡敌人",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "arts",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": true,
      "targetPriority": null,
      "skill": null,
      "talents": [],
      "count": null,
      "sources": [
        "skill"
      ],
      "bySkill": {
        "0": {
          "skill": null,
          "count": null,
          "sources": [
            "skill"
          ]
        },
        "2": {
          "skill": null,
          "count": null,
          "sources": [
            "skill"
          ]
        }
      }
    },
    "char_4217_makoto@2/60/7/1": {
      "phase": 2,
      "level": 60,
      "stats": {
        "maxHp": 1000,
        "atk": 771,
        "def": 0,
        "res": 0,
        "cost": 0,
        "blockCnt": 0,
        "bat": 1.1,
        "aspd": 100,
        "respawnTime": 70,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          1,
          -1
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          0,
          -1
        ],
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ]
      ],
      "trait": {
        "desc": "不阻挡敌人",
        "descRaw": "不阻挡敌人",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "arts",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": true,
      "targetPriority": null,
      "skill": null,
      "talents": [],
      "count": null,
      "sources": [
        "skill"
      ],
      "bySkill": {
        "0": {
          "skill": null,
          "count": null,
          "sources": [
            "skill"
          ]
        },
        "2": {
          "skill": null,
          "count": null,
          "sources": [
            "skill"
          ]
        }
      },
      "byModule": {}
    },
    "char_4217_makoto@2/60/7/3": {
      "phase": 2,
      "level": 60,
      "stats": {
        "maxHp": 1000,
        "atk": 771,
        "def": 0,
        "res": 0,
        "cost": 0,
        "blockCnt": 0,
        "bat": 1.1,
        "aspd": 100,
        "respawnTime": 70,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          1,
          -1
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          0,
          -1
        ],
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ]
      ],
      "trait": {
        "desc": "不阻挡敌人",
        "descRaw": "不阻挡敌人",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "arts",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": true,
      "targetPriority": null,
      "skill": null,
      "talents": [],
      "count": null,
      "sources": [
        "skill"
      ],
      "bySkill": {
        "0": {
          "skill": null,
          "count": null,
          "sources": [
            "skill"
          ]
        },
        "2": {
          "skill": null,
          "count": null,
          "sources": [
            "skill"
          ]
        }
      },
      "byModule": {}
    }
  }
}
```

### 新增：“一会儿见！” · token_10071_aglna2_agairp

炸惊：（结构或参数变化；见下列完整记录）

```json
{
  "tokenId": "token_10071_aglna2_agairp",
  "kind": "summon",
  "name": "“一会儿见！”",
  "appellation": "\"See you soon!\"",
  "desc": "",
  "descRaw": "",
  "profession": "TOKEN",
  "subProfessionId": "notchar1",
  "position": "MELEE",
  "displayType": null,
  "placeable": false,
  "ownerRange": false,
  "owners": [
    "chess_zj_06_a",
    "chess_zj_06_b"
  ],
  "stats": {
    "maxHp": 1000,
    "atk": 100,
    "def": 100,
    "res": 0,
    "cost": 0,
    "blockCnt": 0,
    "bat": 1,
    "aspd": 100,
    "respawnTime": 70,
    "spRecovery": 1,
    "hpRecoveryPerSec": 0,
    "moveSpeed": 1,
    "tauntLevel": 0,
    "massLevel": 0,
    "deployLimit": 1,
    "deckStack": 0
  },
  "rangeGrid": [
    [
      0,
      0
    ]
  ],
  "dmgType": "phys",
  "attackKind": "melee",
  "projectile": "none",
  "canHitFly": false,
  "skill": null,
  "deployLimit": 1,
  "count": null,
  "abnormal": [],
  "variants": {
    "chess_zj_06_a": {
      "phase": 2,
      "level": 1,
      "stats": {
        "maxHp": 1000,
        "atk": 100,
        "def": 100,
        "res": 0,
        "cost": 0,
        "blockCnt": 0,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 70,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          0,
          0
        ]
      ],
      "trait": {
        "desc": "",
        "descRaw": "",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "skill": null,
      "talents": [],
      "count": null,
      "sources": [],
      "bySkill": {
        "1": {
          "skill": null,
          "count": null,
          "sources": []
        },
        "2": {
          "skill": null,
          "count": null,
          "sources": [
            "skill"
          ]
        }
      }
    },
    "chess_zj_06_b": {
      "phase": 2,
      "level": 60,
      "stats": {
        "maxHp": 1000,
        "atk": 100,
        "def": 100,
        "res": 0,
        "cost": 0,
        "blockCnt": 0,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 70,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          0,
          0
        ]
      ],
      "trait": {
        "desc": "",
        "descRaw": "",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "skill": null,
      "talents": [],
      "count": null,
      "sources": [],
      "bySkill": {
        "1": {
          "skill": null,
          "count": null,
          "sources": []
        },
        "2": {
          "skill": null,
          "count": null,
          "sources": [
            "skill"
          ]
        }
      }
    },
    "char_1015_aglna2@2/60/7/3": {
      "phase": 2,
      "level": 60,
      "stats": {
        "maxHp": 1000,
        "atk": 100,
        "def": 100,
        "res": 0,
        "cost": 0,
        "blockCnt": 0,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 70,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          0,
          0
        ]
      ],
      "trait": {
        "desc": "",
        "descRaw": "",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "skill": null,
      "talents": [],
      "count": null,
      "sources": [],
      "bySkill": {
        "1": {
          "skill": null,
          "count": null,
          "sources": []
        },
        "2": {
          "skill": null,
          "count": null,
          "sources": [
            "skill"
          ]
        }
      }
    }
  },
  "assets": {
    "avatar": "token_10071_aglna2_agairp",
    "spine": "token_10071_aglna2_agairp"
  }
}
```

### 新增：Mon3tr · token_10002_kalts_mon3tr

炸惊：能够阻挡三个敌人

```json
{
  "tokenId": "token_10002_kalts_mon3tr",
  "kind": "summon",
  "name": "Mon3tr",
  "appellation": "Mon3tr",
  "desc": "能够阻挡三个敌人",
  "descRaw": "能够阻挡三个敌人",
  "profession": "TOKEN",
  "subProfessionId": "notchar1",
  "position": "MELEE",
  "displayType": "DEFAULT",
  "placeable": true,
  "ownerRange": false,
  "owners": [
    "chess_zj_12_a",
    "chess_zj_12_b"
  ],
  "stats": {
    "maxHp": 4292,
    "atk": 1149,
    "def": 336,
    "res": 0,
    "cost": 10,
    "blockCnt": 3,
    "bat": 2,
    "aspd": 100,
    "respawnTime": 25,
    "spRecovery": 1,
    "hpRecoveryPerSec": 0,
    "moveSpeed": 1,
    "tauntLevel": 0,
    "massLevel": 0,
    "deployLimit": 1,
    "deckStack": 0
  },
  "rangeGrid": [
    [
      0,
      0
    ],
    [
      0,
      1
    ]
  ],
  "dmgType": "phys",
  "attackKind": "melee",
  "projectile": "none",
  "canHitFly": false,
  "skill": null,
  "deployLimit": 1,
  "count": 1,
  "abnormal": [],
  "variants": {
    "chess_zj_12_a": {
      "phase": 2,
      "level": 1,
      "stats": {
        "maxHp": 4292,
        "atk": 1149,
        "def": 336,
        "res": 0,
        "cost": 10,
        "blockCnt": 3,
        "bat": 2,
        "aspd": 100,
        "respawnTime": 25,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          0,
          0
        ],
        [
          0,
          1
        ]
      ],
      "trait": {
        "desc": "能够阻挡三个敌人",
        "descRaw": "能够阻挡三个敌人",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "skill": null,
      "talents": [
        {
          "index": 0,
          "name": "Mon3tr",
          "desc": "可以被凯尔希治疗，不在凯尔希攻击范围内时防御力降至0",
          "descRaw": "可以被凯尔希治疗，不在凯尔希攻击范围内时防御力降至0",
          "bb": {},
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "不毁重构",
          "desc": "被击倒后（不包括撤退）使周围8格内所有敌人晕眩3.5（+0.5）秒并对其造成1400（+200）点真实伤害",
          "descRaw": "被击倒后（不包括撤退）使周围8格内所有敌人<$ba.stun>晕眩</>3.5<@ba.talpu>（+0.5）</>秒并对其造成1400<@ba.talpu>（+200）</>点真实伤害",
          "bb": {
            "stun": 3.5,
            "value": 1400
          },
          "bbStr": {},
          "rangeGrid": [
            [
              1,
              -1
            ],
            [
              1,
              0
            ],
            [
              1,
              1
            ],
            [
              0,
              -1
            ],
            [
              0,
              0
            ],
            [
              0,
              1
            ],
            [
              -1,
              -1
            ],
            [
              -1,
              0
            ],
            [
              -1,
              1
            ]
          ],
          "tokenKey": null,
          "hidden": false,
          "fromModule": false,
          "potMin": 4,
          "potBelow": {
            "desc": "被击倒后（不包括撤退）使周围8格内所有敌人晕眩3秒并对其造成1200点真实伤害",
            "descRaw": "被击倒后（不包括撤退）使周围8格内所有敌人<$ba.stun>晕眩</>3秒并对其造成1200点真实伤害",
            "bb": {
              "stun": 3,
              "value": 1200
            }
          }
        }
      ],
      "count": 1,
      "sources": [
        "talent",
        "display"
      ],
      "bySkill": {
        "1": {
          "skill": null,
          "count": 1,
          "sources": [
            "talent",
            "display"
          ]
        },
        "2": {
          "skill": null,
          "count": 1,
          "sources": [
            "talent",
            "display"
          ]
        }
      }
    },
    "chess_zj_12_b": {
      "phase": 2,
      "level": 60,
      "stats": {
        "maxHp": 5048,
        "atk": 1317,
        "def": 382,
        "res": 0,
        "cost": 10,
        "blockCnt": 3,
        "bat": 2,
        "aspd": 100,
        "respawnTime": 25,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          0,
          0
        ],
        [
          0,
          1
        ]
      ],
      "trait": {
        "desc": "能够阻挡三个敌人",
        "descRaw": "能够阻挡三个敌人",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "skill": null,
      "talents": [
        {
          "index": 0,
          "name": "Mon3tr",
          "desc": "可以被凯尔希治疗，不在凯尔希攻击范围内时防御力降至0",
          "descRaw": "可以被凯尔希治疗，不在凯尔希攻击范围内时防御力降至0",
          "bb": {},
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "不毁重构",
          "desc": "被击倒后（不包括撤退）使周围8格内所有敌人晕眩3.5（+0.5）秒并对其造成1400（+200）点真实伤害",
          "descRaw": "被击倒后（不包括撤退）使周围8格内所有敌人<$ba.stun>晕眩</>3.5<@ba.talpu>（+0.5）</>秒并对其造成1400<@ba.talpu>（+200）</>点真实伤害",
          "bb": {
            "stun": 3.5,
            "value": 1400
          },
          "bbStr": {},
          "rangeGrid": [
            [
              1,
              -1
            ],
            [
              1,
              0
            ],
            [
              1,
              1
            ],
            [
              0,
              -1
            ],
            [
              0,
              0
            ],
            [
              0,
              1
            ],
            [
              -1,
              -1
            ],
            [
              -1,
              0
            ],
            [
              -1,
              1
            ]
          ],
          "tokenKey": null,
          "hidden": false,
          "fromModule": false,
          "potMin": 4,
          "potBelow": {
            "desc": "被击倒后（不包括撤退）使周围8格内所有敌人晕眩3秒并对其造成1200点真实伤害",
            "descRaw": "被击倒后（不包括撤退）使周围8格内所有敌人<$ba.stun>晕眩</>3秒并对其造成1200点真实伤害",
            "bb": {
              "stun": 3,
              "value": 1200
            }
          }
        }
      ],
      "count": 1,
      "sources": [
        "talent",
        "display"
      ],
      "bySkill": {
        "1": {
          "skill": null,
          "count": 1,
          "sources": [
            "talent",
            "display"
          ]
        },
        "2": {
          "skill": null,
          "count": 1,
          "sources": [
            "talent",
            "display"
          ]
        }
      },
      "byModule": {
        "uniequip_002_kalts": {
          "stats": {
            "maxHp": 5048,
            "atk": 1317,
            "def": 382,
            "res": 0,
            "cost": 10,
            "blockCnt": 3,
            "bat": 2,
            "aspd": 100,
            "respawnTime": 25,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 1,
            "deckStack": 0
          },
          "immunities": {
            "stun": false,
            "silence": false,
            "sleep": false,
            "frozen": false,
            "levitate": false
          },
          "trait": {
            "desc": "能够阻挡三个敌人",
            "descRaw": "能够阻挡三个敌人",
            "bb": {},
            "bbStr": {}
          },
          "talents": [
            {
              "index": 0,
              "name": "Mon3tr",
              "desc": "可以被凯尔希治疗，不在凯尔希攻击范围内时防御力降至0",
              "descRaw": "可以被凯尔希治疗，不在凯尔希攻击范围内时防御力降至0",
              "bb": {},
              "bbStr": {},
              "rangeGrid": null,
              "tokenKey": null,
              "hidden": false,
              "fromModule": false
            },
            {
              "index": 1,
              "name": "不毁重构",
              "desc": "被击倒后（不包括撤退）使周围8格内所有敌人晕眩3.5（+0.5）秒并对其造成1400（+200）点真实伤害",
              "descRaw": "被击倒后（不包括撤退）使周围8格内所有敌人<$ba.stun>晕眩</>3.5<@ba.talpu>（+0.5）</>秒并对其造成1400<@ba.talpu>（+200）</>点真实伤害",
              "bb": {
                "stun": 3.5,
                "value": 1400
              },
              "bbStr": {},
              "rangeGrid": [
                [
                  1,
                  -1
                ],
                [
                  1,
                  0
                ],
                [
                  1,
                  1
                ],
                [
                  0,
                  -1
                ],
                [
                  0,
                  0
                ],
                [
                  0,
                  1
                ],
                [
                  -1,
                  -1
                ],
                [
                  -1,
                  0
                ],
                [
                  -1,
                  1
                ]
              ],
              "tokenKey": null,
              "hidden": false,
              "fromModule": false,
              "potMin": 4,
              "potBelow": {
                "desc": "被击倒后（不包括撤退）使周围8格内所有敌人晕眩3秒并对其造成1200点真实伤害",
                "descRaw": "被击倒后（不包括撤退）使周围8格内所有敌人<$ba.stun>晕眩</>3秒并对其造成1200点真实伤害",
                "bb": {
                  "stun": 3,
                  "value": 1200
                }
              }
            }
          ]
        },
        "uniequip_003_kalts": {
          "stats": {
            "maxHp": 5048,
            "atk": 1317,
            "def": 382,
            "res": 0,
            "cost": 10,
            "blockCnt": 3,
            "bat": 2,
            "aspd": 100,
            "respawnTime": 25,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 1,
            "deckStack": 0
          },
          "immunities": {
            "stun": false,
            "silence": false,
            "sleep": false,
            "frozen": false,
            "levitate": false
          },
          "trait": {
            "desc": "能够阻挡三个敌人",
            "descRaw": "能够阻挡三个敌人",
            "bb": {},
            "bbStr": {}
          },
          "talents": [
            {
              "index": 0,
              "name": "Mon3tr",
              "desc": "可以被凯尔希治疗，不在凯尔希攻击范围内时防御力降至0",
              "descRaw": "可以被凯尔希治疗，不在凯尔希攻击范围内时防御力降至0",
              "bb": {},
              "bbStr": {},
              "rangeGrid": null,
              "tokenKey": null,
              "hidden": false,
              "fromModule": false
            },
            {
              "index": 1,
              "name": "不毁重构",
              "desc": "被击倒后（不包括撤退）使周围8格内所有敌人晕眩3.5（+0.5）秒并对其造成1400（+200）点真实伤害",
              "descRaw": "被击倒后（不包括撤退）使周围8格内所有敌人<$ba.stun>晕眩</>3.5<@ba.talpu>（+0.5）</>秒并对其造成1400<@ba.talpu>（+200）</>点真实伤害",
              "bb": {
                "stun": 3.5,
                "value": 1400
              },
              "bbStr": {},
              "rangeGrid": [
                [
                  1,
                  -1
                ],
                [
                  1,
                  0
                ],
                [
                  1,
                  1
                ],
                [
                  0,
                  -1
                ],
                [
                  0,
                  0
                ],
                [
                  0,
                  1
                ],
                [
                  -1,
                  -1
                ],
                [
                  -1,
                  0
                ],
                [
                  -1,
                  1
                ]
              ],
              "tokenKey": null,
              "hidden": false,
              "fromModule": false,
              "potMin": 4,
              "potBelow": {
                "desc": "被击倒后（不包括撤退）使周围8格内所有敌人晕眩3秒并对其造成1200点真实伤害",
                "descRaw": "被击倒后（不包括撤退）使周围8格内所有敌人<$ba.stun>晕眩</>3秒并对其造成1200点真实伤害",
                "bb": {
                  "stun": 3,
                  "value": 1200
                }
              }
            }
          ]
        },
        "uniequip_004_kalts": {
          "stats": {
            "maxHp": 5048,
            "atk": 1317,
            "def": 382,
            "res": 0,
            "cost": 10,
            "blockCnt": 3,
            "bat": 2,
            "aspd": 100,
            "respawnTime": 25,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 1,
            "deckStack": 0
          },
          "immunities": {
            "stun": false,
            "silence": false,
            "sleep": false,
            "frozen": false,
            "levitate": false
          },
          "trait": {
            "desc": "能够阻挡三个敌人",
            "descRaw": "能够阻挡三个敌人",
            "bb": {},
            "bbStr": {}
          },
          "talents": [
            {
              "index": 0,
              "name": "Mon3tr",
              "desc": "可以被凯尔希治疗，不在凯尔希攻击范围内时防御力降至0",
              "descRaw": "可以被凯尔希治疗，不在凯尔希攻击范围内时防御力降至0",
              "bb": {},
              "bbStr": {},
              "rangeGrid": null,
              "tokenKey": null,
              "hidden": false,
              "fromModule": false
            },
            {
              "index": 1,
              "name": "不毁重构",
              "desc": "被击倒后（不包括撤退）使周围8格内所有敌人晕眩3.5（+0.5）秒并对其造成1400（+200）点真实伤害",
              "descRaw": "被击倒后（不包括撤退）使周围8格内所有敌人<$ba.stun>晕眩</>3.5<@ba.talpu>（+0.5）</>秒并对其造成1400<@ba.talpu>（+200）</>点真实伤害",
              "bb": {
                "stun": 3.5,
                "value": 1400
              },
              "bbStr": {},
              "rangeGrid": [
                [
                  1,
                  -1
                ],
                [
                  1,
                  0
                ],
                [
                  1,
                  1
                ],
                [
                  0,
                  -1
                ],
                [
                  0,
                  0
                ],
                [
                  0,
                  1
                ],
                [
                  -1,
                  -1
                ],
                [
                  -1,
                  0
                ],
                [
                  -1,
                  1
                ]
              ],
              "tokenKey": null,
              "hidden": false,
              "fromModule": false,
              "potMin": 4,
              "potBelow": {
                "desc": "被击倒后（不包括撤退）使周围8格内所有敌人晕眩3秒并对其造成1200点真实伤害",
                "descRaw": "被击倒后（不包括撤退）使周围8格内所有敌人<$ba.stun>晕眩</>3秒并对其造成1200点真实伤害",
                "bb": {
                  "stun": 3,
                  "value": 1200
                }
              }
            }
          ]
        }
      }
    },
    "char_003_kalts@2/60/7/3": {
      "phase": 2,
      "level": 60,
      "stats": {
        "maxHp": 5048,
        "atk": 1317,
        "def": 382,
        "res": 0,
        "cost": 10,
        "blockCnt": 3,
        "bat": 2,
        "aspd": 100,
        "respawnTime": 25,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          0,
          0
        ],
        [
          0,
          1
        ]
      ],
      "trait": {
        "desc": "能够阻挡三个敌人",
        "descRaw": "能够阻挡三个敌人",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "skill": null,
      "talents": [
        {
          "index": 0,
          "name": "Mon3tr",
          "desc": "可以被凯尔希治疗，不在凯尔希攻击范围内时防御力降至0",
          "descRaw": "可以被凯尔希治疗，不在凯尔希攻击范围内时防御力降至0",
          "bb": {},
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "不毁重构",
          "desc": "被击倒后（不包括撤退）使周围8格内所有敌人晕眩3.5（+0.5）秒并对其造成1400（+200）点真实伤害",
          "descRaw": "被击倒后（不包括撤退）使周围8格内所有敌人<$ba.stun>晕眩</>3.5<@ba.talpu>（+0.5）</>秒并对其造成1400<@ba.talpu>（+200）</>点真实伤害",
          "bb": {
            "stun": 3.5,
            "value": 1400
          },
          "bbStr": {},
          "rangeGrid": [
            [
              1,
              -1
            ],
            [
              1,
              0
            ],
            [
              1,
              1
            ],
            [
              0,
              -1
            ],
            [
              0,
              0
            ],
            [
              0,
              1
            ],
            [
              -1,
              -1
            ],
            [
              -1,
              0
            ],
            [
              -1,
              1
            ]
          ],
          "tokenKey": null,
          "hidden": false,
          "fromModule": false,
          "potMin": 4,
          "potBelow": {
            "desc": "被击倒后（不包括撤退）使周围8格内所有敌人晕眩3秒并对其造成1200点真实伤害",
            "descRaw": "被击倒后（不包括撤退）使周围8格内所有敌人<$ba.stun>晕眩</>3秒并对其造成1200点真实伤害",
            "bb": {
              "stun": 3,
              "value": 1200
            }
          }
        }
      ],
      "count": 1,
      "sources": [
        "talent",
        "display"
      ],
      "bySkill": {
        "1": {
          "skill": null,
          "count": 1,
          "sources": [
            "talent",
            "display"
          ]
        },
        "2": {
          "skill": null,
          "count": 1,
          "sources": [
            "talent",
            "display"
          ]
        }
      },
      "byModule": {
        "uniequip_002_kalts": {
          "stats": {
            "maxHp": 5048,
            "atk": 1317,
            "def": 382,
            "res": 0,
            "cost": 10,
            "blockCnt": 3,
            "bat": 2,
            "aspd": 100,
            "respawnTime": 25,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 1,
            "deckStack": 0
          },
          "immunities": {
            "stun": false,
            "silence": false,
            "sleep": false,
            "frozen": false,
            "levitate": false
          },
          "trait": {
            "desc": "能够阻挡三个敌人",
            "descRaw": "能够阻挡三个敌人",
            "bb": {},
            "bbStr": {}
          },
          "talents": [
            {
              "index": 0,
              "name": "Mon3tr",
              "desc": "可以被凯尔希治疗，不在凯尔希攻击范围内时防御力降至0",
              "descRaw": "可以被凯尔希治疗，不在凯尔希攻击范围内时防御力降至0",
              "bb": {},
              "bbStr": {},
              "rangeGrid": null,
              "tokenKey": null,
              "hidden": false,
              "fromModule": false
            },
            {
              "index": 1,
              "name": "不毁重构",
              "desc": "生命值首次低于50%和被击倒后（不包括撤退）使周围8格内所有敌人晕眩4（+0.5）秒并对其造成1700（+200）点真实伤害",
              "descRaw": "生命值首次低于50%和被击倒后（不包括撤退）使周围8格内所有敌人<$ba.stun>晕眩</>4<@ba.talpu>（+0.5）</>秒并对其造成1700<@ba.talpu>（+200）</>点真实伤害",
              "bb": {
                "stun": 4,
                "value": 1700,
                "hp_ratio": 0.5
              },
              "bbStr": {},
              "rangeGrid": [
                [
                  1,
                  -1
                ],
                [
                  1,
                  0
                ],
                [
                  1,
                  1
                ],
                [
                  0,
                  -1
                ],
                [
                  0,
                  0
                ],
                [
                  0,
                  1
                ],
                [
                  -1,
                  -1
                ],
                [
                  -1,
                  0
                ],
                [
                  -1,
                  1
                ]
              ],
              "tokenKey": null,
              "hidden": false,
              "fromModule": true,
              "potMin": 4,
              "potBelow": {
                "desc": "生命值首次低于50%和被击倒后（不包括撤退）使周围8格内所有敌人晕眩3.5秒并对其造成1500点真实伤害",
                "descRaw": "生命值首次低于50%和被击倒后（不包括撤退）使周围8格内所有敌人<$ba.stun>晕眩</>3.5秒并对其造成1500点真实伤害",
                "bb": {
                  "stun": 3.5,
                  "value": 1500,
                  "hp_ratio": 0.5
                }
              }
            }
          ]
        },
        "uniequip_003_kalts": {
          "stats": {
            "maxHp": 5048,
            "atk": 1317,
            "def": 382,
            "res": 0,
            "cost": 10,
            "blockCnt": 3,
            "bat": 2,
            "aspd": 100,
            "respawnTime": 25,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 1,
            "deckStack": 0
          },
          "immunities": {
            "stun": false,
            "silence": false,
            "sleep": false,
            "frozen": false,
            "levitate": false
          },
          "trait": {
            "desc": "能够阻挡三个敌人",
            "descRaw": "能够阻挡三个敌人",
            "bb": {},
            "bbStr": {}
          },
          "talents": [
            {
              "index": 0,
              "name": "Mon3tr",
              "desc": "可以被凯尔希治疗，在凯尔希攻击范围内时攻击速度提高20且防御力提高20％，不在凯尔希攻击范围内时防御力降至0",
              "descRaw": "可以被凯尔希治疗，在凯尔希攻击范围内时攻击速度提高20且防御力提高20％，不在凯尔希攻击范围内时防御力降至0",
              "bb": {},
              "bbStr": {},
              "rangeGrid": null,
              "tokenKey": null,
              "hidden": false,
              "fromModule": true
            },
            {
              "index": 1,
              "name": "不毁重构",
              "desc": "被击倒后（不包括撤退）使周围8格内所有敌人晕眩3.5（+0.5）秒并对其造成1400（+200）点真实伤害",
              "descRaw": "被击倒后（不包括撤退）使周围8格内所有敌人<$ba.stun>晕眩</>3.5<@ba.talpu>（+0.5）</>秒并对其造成1400<@ba.talpu>（+200）</>点真实伤害",
              "bb": {
                "stun": 3.5,
                "value": 1400
              },
              "bbStr": {},
              "rangeGrid": [
                [
                  1,
                  -1
                ],
                [
                  1,
                  0
                ],
                [
                  1,
                  1
                ],
                [
                  0,
                  -1
                ],
                [
                  0,
                  0
                ],
                [
                  0,
                  1
                ],
                [
                  -1,
                  -1
                ],
                [
                  -1,
                  0
                ],
                [
                  -1,
                  1
                ]
              ],
              "tokenKey": null,
              "hidden": false,
              "fromModule": false,
              "potMin": 4,
              "potBelow": {
                "desc": "被击倒后（不包括撤退）使周围8格内所有敌人晕眩3秒并对其造成1200点真实伤害",
                "descRaw": "被击倒后（不包括撤退）使周围8格内所有敌人<$ba.stun>晕眩</>3秒并对其造成1200点真实伤害",
                "bb": {
                  "stun": 3,
                  "value": 1200
                }
              }
            }
          ]
        },
        "uniequip_004_kalts": {
          "stats": {
            "maxHp": 5048,
            "atk": 1317,
            "def": 382,
            "res": 0,
            "cost": 10,
            "blockCnt": 3,
            "bat": 2,
            "aspd": 100,
            "respawnTime": 25,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 1,
            "deckStack": 0
          },
          "immunities": {
            "stun": false,
            "silence": false,
            "sleep": false,
            "frozen": false,
            "levitate": false
          },
          "trait": {
            "desc": "能够阻挡三个敌人",
            "descRaw": "能够阻挡三个敌人",
            "bb": {},
            "bbStr": {}
          },
          "talents": [
            {
              "index": 0,
              "name": "Mon3tr",
              "desc": "可以被凯尔希治疗，不在凯尔希攻击范围内时防御力降至0；在集成战略中不占用部署位，生命上限和攻击力+50%且受到的治疗效果提升50%",
              "descRaw": "可以被凯尔希治疗，不在凯尔希攻击范围内时防御力降至0；在<@ba.kw>集成战略</>中不占用部署位，生命上限和攻击力+50%且受到的治疗效果提升50%",
              "bb": {},
              "bbStr": {},
              "rangeGrid": null,
              "tokenKey": null,
              "hidden": false,
              "fromModule": true
            },
            {
              "index": 1,
              "name": "不毁重构",
              "desc": "被击倒后（不包括撤退）使周围8格内所有敌人晕眩3.5（+0.5）秒并对其造成1400（+200）点真实伤害",
              "descRaw": "被击倒后（不包括撤退）使周围8格内所有敌人<$ba.stun>晕眩</>3.5<@ba.talpu>（+0.5）</>秒并对其造成1400<@ba.talpu>（+200）</>点真实伤害",
              "bb": {
                "stun": 3.5,
                "value": 1400
              },
              "bbStr": {},
              "rangeGrid": [
                [
                  1,
                  -1
                ],
                [
                  1,
                  0
                ],
                [
                  1,
                  1
                ],
                [
                  0,
                  -1
                ],
                [
                  0,
                  0
                ],
                [
                  0,
                  1
                ],
                [
                  -1,
                  -1
                ],
                [
                  -1,
                  0
                ],
                [
                  -1,
                  1
                ]
              ],
              "tokenKey": null,
              "hidden": false,
              "fromModule": false,
              "potMin": 4,
              "potBelow": {
                "desc": "被击倒后（不包括撤退）使周围8格内所有敌人晕眩3秒并对其造成1200点真实伤害",
                "descRaw": "被击倒后（不包括撤退）使周围8格内所有敌人<$ba.stun>晕眩</>3秒并对其造成1200点真实伤害",
                "bb": {
                  "stun": 3,
                  "value": 1200
                }
              }
            }
          ]
        }
      }
    }
  },
  "assets": {
    "avatar": "token_10002_kalts_mon3tr",
    "spine": "token_10002_kalts_mon3tr"
  }
}
```

### 新增：重构体 · token_10050_monstr_prosts

炸惊：自身生命会不断流失

```json
{
  "tokenId": "token_10050_monstr_prosts",
  "kind": "summon",
  "name": "重构体",
  "appellation": "Reconstruct",
  "desc": "自身生命会不断流失",
  "descRaw": "自身生命会不断流失",
  "profession": "TOKEN",
  "subProfessionId": "notchar1",
  "position": "MELEE",
  "displayType": null,
  "placeable": true,
  "ownerRange": true,
  "owners": [
    "chess_zj_26_a",
    "chess_zj_26_b"
  ],
  "stats": {
    "maxHp": 4292,
    "atk": 0,
    "def": 181,
    "res": 0,
    "cost": 3,
    "blockCnt": 0,
    "bat": 2.85,
    "aspd": 100,
    "respawnTime": 15,
    "spRecovery": 1,
    "hpRecoveryPerSec": 0,
    "moveSpeed": 1,
    "tauntLevel": 0,
    "massLevel": 0,
    "deployLimit": 1,
    "deckStack": 0
  },
  "rangeGrid": [
    [
      1,
      -1
    ],
    [
      1,
      0
    ],
    [
      1,
      1
    ],
    [
      0,
      -1
    ],
    [
      0,
      0
    ],
    [
      0,
      1
    ],
    [
      -1,
      -1
    ],
    [
      -1,
      0
    ],
    [
      -1,
      1
    ]
  ],
  "dmgType": "phys",
  "attackKind": "melee",
  "projectile": "none",
  "canHitFly": false,
  "skill": {
    "skillId": "sktok_monstr_prosts1",
    "bb": {}
  },
  "deployLimit": 1,
  "count": 1,
  "abnormal": [],
  "variants": {
    "chess_zj_26_a": {
      "phase": 2,
      "level": 1,
      "stats": {
        "maxHp": 4292,
        "atk": 0,
        "def": 181,
        "res": 0,
        "cost": 3,
        "blockCnt": 0,
        "bat": 2.85,
        "aspd": 100,
        "respawnTime": 15,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          1,
          -1
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          0,
          -1
        ],
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ]
      ],
      "trait": {
        "desc": "自身生命会不断流失",
        "descRaw": "自身生命会不断流失",
        "bb": {
          "cnt": 1,
          "damage_per_second": 80
        },
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "skill": {
        "skillId": "sktok_monstr_prosts1",
        "iconId": "sktok_monstr_prosts1",
        "name": "策略：超压链接",
        "level": 4,
        "desc": null,
        "descRaw": null,
        "skillType": "AUTO",
        "durationType": "NONE",
        "duration": -1,
        "spType": "ON_DEPLOY",
        "spCost": 0,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {},
        "bbStr": {},
        "rangeId": "x-4",
        "rangeGrid": [
          [
            1,
            -1
          ],
          [
            1,
            0
          ],
          [
            1,
            1
          ],
          [
            0,
            -1
          ],
          [
            0,
            0
          ],
          [
            0,
            1
          ],
          [
            -1,
            -1
          ],
          [
            -1,
            0
          ],
          [
            -1,
            1
          ]
        ],
        "prefabId": "sktok_monstr_prosts1",
        "trigger": {
          "rule": "DEFAULT",
          "rawRule": "DEFAULT",
          "customRangeGrid": null
        },
        "index": 0
      },
      "talents": [],
      "count": 1,
      "sources": [
        "talent",
        "display"
      ],
      "bySkill": {
        "1": {
          "skill": {
            "skillId": "sktok_monstr_prosts2",
            "iconId": "sktok_monstr_prosts2",
            "name": "策略：超负荷",
            "level": 4,
            "desc": null,
            "descRaw": null,
            "skillType": "AUTO",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {},
            "bbStr": {},
            "rangeId": "x-4",
            "rangeGrid": [
              [
                1,
                -1
              ],
              [
                1,
                0
              ],
              [
                1,
                1
              ],
              [
                0,
                -1
              ],
              [
                0,
                0
              ],
              [
                0,
                1
              ],
              [
                -1,
                -1
              ],
              [
                -1,
                0
              ],
              [
                -1,
                1
              ]
            ],
            "prefabId": "sktok_monstr_prosts2",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 1
          },
          "count": 1,
          "sources": [
            "talent",
            "display"
          ]
        },
        "2": {
          "skill": {
            "skillId": "sktok_monstr_prosts3",
            "iconId": "sktok_monstr_prosts3",
            "name": "策略：熔毁",
            "level": 4,
            "desc": null,
            "descRaw": null,
            "skillType": "AUTO",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {},
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_monstr_prosts3",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 2
          },
          "count": 1,
          "sources": [
            "talent",
            "display"
          ]
        }
      }
    },
    "chess_zj_26_b": {
      "phase": 2,
      "level": 60,
      "stats": {
        "maxHp": 5048,
        "atk": 0,
        "def": 208,
        "res": 0,
        "cost": 3,
        "blockCnt": 0,
        "bat": 2.85,
        "aspd": 100,
        "respawnTime": 15,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          1,
          -1
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          0,
          -1
        ],
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ]
      ],
      "trait": {
        "desc": "自身生命会不断流失",
        "descRaw": "自身生命会不断流失",
        "bb": {
          "cnt": 1,
          "damage_per_second": 80
        },
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "skill": {
        "skillId": "sktok_monstr_prosts1",
        "iconId": "sktok_monstr_prosts1",
        "name": "策略：超压链接",
        "level": 7,
        "desc": null,
        "descRaw": null,
        "skillType": "AUTO",
        "durationType": "NONE",
        "duration": -1,
        "spType": "ON_DEPLOY",
        "spCost": 0,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {},
        "bbStr": {},
        "rangeId": "x-4",
        "rangeGrid": [
          [
            1,
            -1
          ],
          [
            1,
            0
          ],
          [
            1,
            1
          ],
          [
            0,
            -1
          ],
          [
            0,
            0
          ],
          [
            0,
            1
          ],
          [
            -1,
            -1
          ],
          [
            -1,
            0
          ],
          [
            -1,
            1
          ]
        ],
        "prefabId": "sktok_monstr_prosts1",
        "trigger": {
          "rule": "DEFAULT",
          "rawRule": "DEFAULT",
          "customRangeGrid": null
        },
        "index": 0
      },
      "talents": [],
      "count": 1,
      "sources": [
        "talent",
        "display"
      ],
      "bySkill": {
        "1": {
          "skill": {
            "skillId": "sktok_monstr_prosts2",
            "iconId": "sktok_monstr_prosts2",
            "name": "策略：超负荷",
            "level": 7,
            "desc": null,
            "descRaw": null,
            "skillType": "AUTO",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {},
            "bbStr": {},
            "rangeId": "x-4",
            "rangeGrid": [
              [
                1,
                -1
              ],
              [
                1,
                0
              ],
              [
                1,
                1
              ],
              [
                0,
                -1
              ],
              [
                0,
                0
              ],
              [
                0,
                1
              ],
              [
                -1,
                -1
              ],
              [
                -1,
                0
              ],
              [
                -1,
                1
              ]
            ],
            "prefabId": "sktok_monstr_prosts2",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 1
          },
          "count": 1,
          "sources": [
            "talent",
            "display"
          ]
        },
        "2": {
          "skill": {
            "skillId": "sktok_monstr_prosts3",
            "iconId": "sktok_monstr_prosts3",
            "name": "策略：熔毁",
            "level": 7,
            "desc": null,
            "descRaw": null,
            "skillType": "AUTO",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {},
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_monstr_prosts3",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 2
          },
          "count": 1,
          "sources": [
            "talent",
            "display"
          ]
        }
      },
      "byModule": {
        "uniequip_002_monstr": {
          "stats": {
            "maxHp": 5048,
            "atk": 0,
            "def": 208,
            "res": 0,
            "cost": 3,
            "blockCnt": 0,
            "bat": 2.85,
            "aspd": 100,
            "respawnTime": 15,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 1,
            "deckStack": 0
          },
          "immunities": {
            "stun": false,
            "silence": false,
            "sleep": false,
            "frozen": false,
            "levitate": false
          },
          "trait": {
            "desc": "自身生命会不断流失",
            "descRaw": "自身生命会不断流失",
            "bb": {
              "cnt": 1,
              "damage_per_second": 80
            },
            "bbStr": {}
          },
          "talents": []
        }
      }
    },
    "char_4179_monstr@2/60/7/3": {
      "phase": 2,
      "level": 60,
      "stats": {
        "maxHp": 5048,
        "atk": 0,
        "def": 208,
        "res": 0,
        "cost": 3,
        "blockCnt": 0,
        "bat": 2.85,
        "aspd": 100,
        "respawnTime": 15,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          1,
          -1
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          0,
          -1
        ],
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ]
      ],
      "trait": {
        "desc": "自身生命会不断流失",
        "descRaw": "自身生命会不断流失",
        "bb": {
          "cnt": 1,
          "damage_per_second": 80
        },
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "skill": {
        "skillId": "sktok_monstr_prosts1",
        "iconId": "sktok_monstr_prosts1",
        "name": "策略：超压链接",
        "level": 7,
        "desc": null,
        "descRaw": null,
        "skillType": "AUTO",
        "durationType": "NONE",
        "duration": -1,
        "spType": "ON_DEPLOY",
        "spCost": 0,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {},
        "bbStr": {},
        "rangeId": "x-4",
        "rangeGrid": [
          [
            1,
            -1
          ],
          [
            1,
            0
          ],
          [
            1,
            1
          ],
          [
            0,
            -1
          ],
          [
            0,
            0
          ],
          [
            0,
            1
          ],
          [
            -1,
            -1
          ],
          [
            -1,
            0
          ],
          [
            -1,
            1
          ]
        ],
        "prefabId": "sktok_monstr_prosts1",
        "trigger": {
          "rule": "DEFAULT",
          "rawRule": "DEFAULT",
          "customRangeGrid": null
        },
        "index": 0
      },
      "talents": [],
      "count": 1,
      "sources": [
        "talent",
        "display"
      ],
      "bySkill": {
        "1": {
          "skill": {
            "skillId": "sktok_monstr_prosts2",
            "iconId": "sktok_monstr_prosts2",
            "name": "策略：超负荷",
            "level": 7,
            "desc": null,
            "descRaw": null,
            "skillType": "AUTO",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {},
            "bbStr": {},
            "rangeId": "x-4",
            "rangeGrid": [
              [
                1,
                -1
              ],
              [
                1,
                0
              ],
              [
                1,
                1
              ],
              [
                0,
                -1
              ],
              [
                0,
                0
              ],
              [
                0,
                1
              ],
              [
                -1,
                -1
              ],
              [
                -1,
                0
              ],
              [
                -1,
                1
              ]
            ],
            "prefabId": "sktok_monstr_prosts2",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 1
          },
          "count": 1,
          "sources": [
            "talent",
            "display"
          ]
        },
        "2": {
          "skill": {
            "skillId": "sktok_monstr_prosts3",
            "iconId": "sktok_monstr_prosts3",
            "name": "策略：熔毁",
            "level": 7,
            "desc": null,
            "descRaw": null,
            "skillType": "AUTO",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {},
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_monstr_prosts3",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 2
          },
          "count": 1,
          "sources": [
            "talent",
            "display"
          ]
        }
      },
      "byModule": {
        "uniequip_002_monstr": {
          "stats": {
            "maxHp": 5048,
            "atk": 0,
            "def": 208,
            "res": 0,
            "cost": 3,
            "blockCnt": 0,
            "bat": 2.85,
            "aspd": 100,
            "respawnTime": 15,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 1,
            "deckStack": 0
          },
          "immunities": {
            "stun": false,
            "silence": false,
            "sleep": false,
            "frozen": false,
            "levitate": false
          },
          "trait": {
            "desc": "自身生命会不断流失",
            "descRaw": "自身生命会不断流失",
            "bb": {
              "cnt": 1,
              "damage_per_second": 80
            },
            "bbStr": {}
          },
          "talents": []
        }
      }
    }
  },
  "assets": {
    "avatar": "token_10050_monstr_prosts",
    "spine": "token_10050_monstr_prosts"
  }
}
```

### 新增：魂灵之影 · token_10035_wisdel_wward

炸惊：可攻击维什戴尔攻击范围内的敌人

```json
{
  "tokenId": "token_10035_wisdel_wward",
  "kind": "summon",
  "name": "魂灵之影",
  "appellation": "Shadow of Revenant",
  "desc": "可攻击维什戴尔攻击范围内的敌人",
  "descRaw": "可攻击维什戴尔攻击范围内的敌人",
  "profession": "TOKEN",
  "subProfessionId": "notchar1",
  "position": "ALL",
  "displayType": "HIDDEN",
  "placeable": false,
  "ownerRange": false,
  "owners": [
    "chess_zj_37_a",
    "chess_zj_37_b"
  ],
  "stats": {
    "maxHp": 3500,
    "atk": 660,
    "def": 585,
    "res": 50,
    "cost": 0,
    "blockCnt": 0,
    "bat": 1,
    "aspd": 100,
    "respawnTime": 5,
    "spRecovery": 1,
    "hpRecoveryPerSec": 0,
    "moveSpeed": 1,
    "tauntLevel": 0,
    "massLevel": 0,
    "deployLimit": 3,
    "deckStack": 1
  },
  "rangeGrid": [
    [
      0,
      0
    ]
  ],
  "dmgType": "phys",
  "attackKind": "ranged",
  "projectile": "arrow",
  "canHitFly": true,
  "skill": {
    "skillId": "sktok_wisdel_wward",
    "bb": {
      "sluggish": 1,
      "sp_min": 0,
      "sp_max": 3
    }
  },
  "deployLimit": 3,
  "count": null,
  "abnormal": [],
  "variants": {
    "chess_zj_37_a": {
      "phase": 2,
      "level": 1,
      "stats": {
        "maxHp": 3500,
        "atk": 660,
        "def": 585,
        "res": 50,
        "cost": 0,
        "blockCnt": 0,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 5,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 3,
        "deckStack": 1
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          0,
          0
        ]
      ],
      "trait": {
        "desc": "可攻击维什戴尔攻击范围内的敌人",
        "descRaw": "可攻击维什戴尔攻击范围内的敌人",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "ranged",
      "projectile": "arrow",
      "canHitFly": true,
      "targetPriority": null,
      "skill": {
        "skillId": "sktok_wisdel_wward",
        "iconId": "sktok_wisdel_wward",
        "name": "魂灵之影",
        "level": 4,
        "desc": "对一名在维什戴尔攻击范围内的敌人造成法术伤害，对其造成1秒停顿并附着残影，之后获得0-2点技力",
        "descRaw": "对一名在维什戴尔攻击范围内的敌人造成法术伤害，对其造成<@ba.vup>1</>秒<$ba.sluggish>停顿</>并附着残影，之后获得0-2点技力",
        "skillType": "AUTO",
        "durationType": "NONE",
        "duration": 0,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 5,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "sluggish": 1,
          "sp_min": 0,
          "sp_max": 3
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "sktok_wisdel_wward",
        "trigger": {
          "rule": "DEFAULT",
          "rawRule": "DEFAULT",
          "customRangeGrid": null
        },
        "index": 0
      },
      "talents": [],
      "count": null,
      "sources": [
        "talent",
        "display"
      ],
      "bySkill": {
        "1": {
          "skill": {
            "skillId": "sktok_wisdel_wward",
            "iconId": "sktok_wisdel_wward",
            "name": "魂灵之影",
            "level": 4,
            "desc": "对一名在维什戴尔攻击范围内的敌人造成法术伤害，对其造成1秒停顿并附着残影，之后获得0-2点技力",
            "descRaw": "对一名在维什戴尔攻击范围内的敌人造成法术伤害，对其造成<@ba.vup>1</>秒<$ba.sluggish>停顿</>并附着残影，之后获得0-2点技力",
            "skillType": "AUTO",
            "durationType": "NONE",
            "duration": 0,
            "spType": "INCREASE_WITH_TIME",
            "spCost": 5,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {
              "sluggish": 1,
              "sp_min": 0,
              "sp_max": 3
            },
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_wisdel_wward",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 1
          },
          "count": null,
          "sources": [
            "talent",
            "display"
          ]
        },
        "2": {
          "skill": {
            "skillId": "sktok_wisdel_wward",
            "iconId": "sktok_wisdel_wward",
            "name": "魂灵之影",
            "level": 4,
            "desc": "对一名在维什戴尔攻击范围内的敌人造成法术伤害，对其造成1秒停顿并附着残影，之后获得0-2点技力",
            "descRaw": "对一名在维什戴尔攻击范围内的敌人造成法术伤害，对其造成<@ba.vup>1</>秒<$ba.sluggish>停顿</>并附着残影，之后获得0-2点技力",
            "skillType": "AUTO",
            "durationType": "NONE",
            "duration": 0,
            "spType": "INCREASE_WITH_TIME",
            "spCost": 5,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {
              "sluggish": 1,
              "sp_min": 0,
              "sp_max": 3
            },
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_wisdel_wward",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 2
          },
          "count": null,
          "sources": [
            "talent",
            "skill",
            "display"
          ]
        }
      }
    },
    "chess_zj_37_b": {
      "phase": 2,
      "level": 60,
      "stats": {
        "maxHp": 3500,
        "atk": 738,
        "def": 628,
        "res": 50,
        "cost": 0,
        "blockCnt": 0,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 5,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 3,
        "deckStack": 1
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          0,
          0
        ]
      ],
      "trait": {
        "desc": "可攻击维什戴尔攻击范围内的敌人",
        "descRaw": "可攻击维什戴尔攻击范围内的敌人",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "ranged",
      "projectile": "arrow",
      "canHitFly": true,
      "targetPriority": null,
      "skill": {
        "skillId": "sktok_wisdel_wward",
        "iconId": "sktok_wisdel_wward",
        "name": "魂灵之影",
        "level": 7,
        "desc": "对一名在维什戴尔攻击范围内的敌人造成法术伤害，对其造成1秒停顿并附着残影，之后获得0-2点技力",
        "descRaw": "对一名在维什戴尔攻击范围内的敌人造成法术伤害，对其造成<@ba.vup>1</>秒<$ba.sluggish>停顿</>并附着残影，之后获得0-2点技力",
        "skillType": "AUTO",
        "durationType": "NONE",
        "duration": 0,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 5,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "sluggish": 1,
          "sp_min": 0,
          "sp_max": 3
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "sktok_wisdel_wward",
        "trigger": {
          "rule": "DEFAULT",
          "rawRule": "DEFAULT",
          "customRangeGrid": null
        },
        "index": 0
      },
      "talents": [],
      "count": null,
      "sources": [
        "talent",
        "display"
      ],
      "bySkill": {
        "1": {
          "skill": {
            "skillId": "sktok_wisdel_wward",
            "iconId": "sktok_wisdel_wward",
            "name": "魂灵之影",
            "level": 7,
            "desc": "对一名在维什戴尔攻击范围内的敌人造成法术伤害，对其造成1秒停顿并附着残影，之后获得0-2点技力",
            "descRaw": "对一名在维什戴尔攻击范围内的敌人造成法术伤害，对其造成<@ba.vup>1</>秒<$ba.sluggish>停顿</>并附着残影，之后获得0-2点技力",
            "skillType": "AUTO",
            "durationType": "NONE",
            "duration": 0,
            "spType": "INCREASE_WITH_TIME",
            "spCost": 5,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {
              "sluggish": 1,
              "sp_min": 0,
              "sp_max": 3
            },
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_wisdel_wward",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 1
          },
          "count": null,
          "sources": [
            "talent",
            "display"
          ]
        },
        "2": {
          "skill": {
            "skillId": "sktok_wisdel_wward",
            "iconId": "sktok_wisdel_wward",
            "name": "魂灵之影",
            "level": 7,
            "desc": "对一名在维什戴尔攻击范围内的敌人造成法术伤害，对其造成1秒停顿并附着残影，之后获得0-2点技力",
            "descRaw": "对一名在维什戴尔攻击范围内的敌人造成法术伤害，对其造成<@ba.vup>1</>秒<$ba.sluggish>停顿</>并附着残影，之后获得0-2点技力",
            "skillType": "AUTO",
            "durationType": "NONE",
            "duration": 0,
            "spType": "INCREASE_WITH_TIME",
            "spCost": 5,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {
              "sluggish": 1,
              "sp_min": 0,
              "sp_max": 3
            },
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_wisdel_wward",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 2
          },
          "count": null,
          "sources": [
            "talent",
            "skill",
            "display"
          ]
        }
      },
      "byModule": {
        "uniequip_002_wisdel": {
          "stats": {
            "maxHp": 3500,
            "atk": 738,
            "def": 628,
            "res": 50,
            "cost": 0,
            "blockCnt": 0,
            "bat": 1,
            "aspd": 100,
            "respawnTime": 5,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 3,
            "deckStack": 1
          },
          "immunities": {
            "stun": false,
            "silence": false,
            "sleep": false,
            "frozen": false,
            "levitate": false
          },
          "trait": {
            "desc": "可攻击维什戴尔攻击范围内的敌人",
            "descRaw": "可攻击维什戴尔攻击范围内的敌人",
            "bb": {},
            "bbStr": {}
          },
          "talents": []
        }
      }
    },
    "char_1035_wisdel@2/60/7/3": {
      "phase": 2,
      "level": 60,
      "stats": {
        "maxHp": 3500,
        "atk": 738,
        "def": 628,
        "res": 50,
        "cost": 0,
        "blockCnt": 0,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 5,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 3,
        "deckStack": 1
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          0,
          0
        ]
      ],
      "trait": {
        "desc": "可攻击维什戴尔攻击范围内的敌人",
        "descRaw": "可攻击维什戴尔攻击范围内的敌人",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "ranged",
      "projectile": "arrow",
      "canHitFly": true,
      "targetPriority": null,
      "skill": {
        "skillId": "sktok_wisdel_wward",
        "iconId": "sktok_wisdel_wward",
        "name": "魂灵之影",
        "level": 7,
        "desc": "对一名在维什戴尔攻击范围内的敌人造成法术伤害，对其造成1秒停顿并附着残影，之后获得0-2点技力",
        "descRaw": "对一名在维什戴尔攻击范围内的敌人造成法术伤害，对其造成<@ba.vup>1</>秒<$ba.sluggish>停顿</>并附着残影，之后获得0-2点技力",
        "skillType": "AUTO",
        "durationType": "NONE",
        "duration": 0,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 5,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "sluggish": 1,
          "sp_min": 0,
          "sp_max": 3
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "sktok_wisdel_wward",
        "trigger": {
          "rule": "DEFAULT",
          "rawRule": "DEFAULT",
          "customRangeGrid": null
        },
        "index": 0
      },
      "talents": [],
      "count": null,
      "sources": [
        "talent",
        "display"
      ],
      "bySkill": {
        "1": {
          "skill": {
            "skillId": "sktok_wisdel_wward",
            "iconId": "sktok_wisdel_wward",
            "name": "魂灵之影",
            "level": 7,
            "desc": "对一名在维什戴尔攻击范围内的敌人造成法术伤害，对其造成1秒停顿并附着残影，之后获得0-2点技力",
            "descRaw": "对一名在维什戴尔攻击范围内的敌人造成法术伤害，对其造成<@ba.vup>1</>秒<$ba.sluggish>停顿</>并附着残影，之后获得0-2点技力",
            "skillType": "AUTO",
            "durationType": "NONE",
            "duration": 0,
            "spType": "INCREASE_WITH_TIME",
            "spCost": 5,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {
              "sluggish": 1,
              "sp_min": 0,
              "sp_max": 3
            },
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_wisdel_wward",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 1
          },
          "count": null,
          "sources": [
            "talent",
            "display"
          ]
        },
        "2": {
          "skill": {
            "skillId": "sktok_wisdel_wward",
            "iconId": "sktok_wisdel_wward",
            "name": "魂灵之影",
            "level": 7,
            "desc": "对一名在维什戴尔攻击范围内的敌人造成法术伤害，对其造成1秒停顿并附着残影，之后获得0-2点技力",
            "descRaw": "对一名在维什戴尔攻击范围内的敌人造成法术伤害，对其造成<@ba.vup>1</>秒<$ba.sluggish>停顿</>并附着残影，之后获得0-2点技力",
            "skillType": "AUTO",
            "durationType": "NONE",
            "duration": 0,
            "spType": "INCREASE_WITH_TIME",
            "spCost": 5,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {
              "sluggish": 1,
              "sp_min": 0,
              "sp_max": 3
            },
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_wisdel_wward",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 2
          },
          "count": null,
          "sources": [
            "talent",
            "skill",
            "display"
          ]
        }
      },
      "byModule": {
        "uniequip_002_wisdel": {
          "stats": {
            "maxHp": 3500,
            "atk": 738,
            "def": 628,
            "res": 50,
            "cost": 0,
            "blockCnt": 0,
            "bat": 1,
            "aspd": 100,
            "respawnTime": 5,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 3,
            "deckStack": 1
          },
          "immunities": {
            "stun": false,
            "silence": false,
            "sleep": false,
            "frozen": false,
            "levitate": false
          },
          "trait": {
            "desc": "可攻击维什戴尔攻击范围内的敌人",
            "descRaw": "可攻击维什戴尔攻击范围内的敌人",
            "bb": {},
            "bbStr": {}
          },
          "talents": []
        }
      }
    }
  },
  "assets": {
    "avatar": "token_10035_wisdel_wward",
    "spine": "token_10035_wisdel_wward"
  }
}
```

### 新增：本能的召唤 · token_10054_phatm2_encdool

炸惊：不会受到攻击，只能部署在近战位

```json
{
  "tokenId": "token_10054_phatm2_encdool",
  "kind": "summon",
  "name": "本能的召唤",
  "appellation": "Blood's whisper",
  "desc": "不会受到攻击，只能部署在近战位",
  "descRaw": "不会受到攻击，只能部署在近战位",
  "profession": "TOKEN",
  "subProfessionId": "notchar1",
  "position": "MELEE",
  "displayType": null,
  "placeable": true,
  "ownerRange": false,
  "owners": [
    "chess_zj_53_a",
    "chess_zj_53_b"
  ],
  "stats": {
    "maxHp": 100,
    "atk": 100,
    "def": 0,
    "res": 0,
    "cost": 5,
    "blockCnt": 0,
    "bat": 1,
    "aspd": 100,
    "respawnTime": 25,
    "spRecovery": 1,
    "hpRecoveryPerSec": 0,
    "moveSpeed": 1,
    "tauntLevel": 0,
    "massLevel": 0,
    "deployLimit": 1,
    "deckStack": 0
  },
  "rangeGrid": [
    [
      2,
      0
    ],
    [
      1,
      -1
    ],
    [
      1,
      0
    ],
    [
      1,
      1
    ],
    [
      0,
      -2
    ],
    [
      0,
      -1
    ],
    [
      0,
      0
    ],
    [
      0,
      1
    ],
    [
      0,
      2
    ],
    [
      -1,
      -1
    ],
    [
      -1,
      0
    ],
    [
      -1,
      1
    ],
    [
      -2,
      0
    ]
  ],
  "dmgType": "phys",
  "attackKind": "melee",
  "projectile": "none",
  "canHitFly": false,
  "skill": {
    "skillId": "sktok_phatm2_encdool_2",
    "bb": {
      "atk_scale": 1,
      "ep_damage_ratio_token": 0.15,
      "ability_range_radius": 0.4,
      "buff_time": 6,
      "sluggish": 6,
      "interval_damage": 0.5,
      "max_target": 4,
      "interval": 10
    }
  },
  "deployLimit": 1,
  "count": null,
  "abnormal": [],
  "variants": {
    "chess_zj_53_a": {
      "phase": 2,
      "level": 1,
      "stats": {
        "maxHp": 100,
        "atk": 100,
        "def": 0,
        "res": 0,
        "cost": 5,
        "blockCnt": 0,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 25,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          2,
          0
        ],
        [
          1,
          -1
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          0,
          -2
        ],
        [
          0,
          -1
        ],
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          0,
          2
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ],
        [
          -2,
          0
        ]
      ],
      "trait": {
        "desc": "不会受到攻击，只能部署在近战位",
        "descRaw": "不会受到攻击，只能部署在近战位",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "skill": {
        "skillId": "sktok_phatm2_encdool_2",
        "iconId": "sktok_phatm2_encdool",
        "name": "本能的召唤",
        "level": 4,
        "desc": "诱导至多4名进入范围的可达敌人（优先选择精英或领袖）在10秒内走向其所在位置，首个目标到达后撤退并使周围所有敌人在6秒内停顿、每0.5秒受到酒神攻击力100%的法术伤害和攻击力15%的神经损伤\n10秒后自动撤退，拥有独立再部署时间",
        "descRaw": "<$ba.attract>诱导</>至多<@ba.vup>4</>名进入范围的可达敌人（优先选择精英或领袖）在<@ba.vup>10</>秒内走向其所在位置，首个目标到达后撤退并使周围所有敌人在<@ba.vup>6</>秒内<$ba.sluggish>停顿</>、每<@ba.vup>0.5</>秒受到酒神攻击力<@ba.vup>100%</>的法术伤害和攻击力<@ba.vup>15%</>的<$ba.dt.neural2>神经损伤</>\n<@ba.rem>10秒后自动撤退，拥有独立再部署时间</>",
        "skillType": "PASSIVE",
        "durationType": "NONE",
        "duration": -1,
        "spType": "ON_DEPLOY",
        "spCost": 0,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk_scale": 1,
          "ep_damage_ratio_token": 0.15,
          "ability_range_radius": 0.4,
          "buff_time": 6,
          "sluggish": 6,
          "interval_damage": 0.5,
          "max_target": 4,
          "interval": 10
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "sktok_phatm2_encdool_2",
        "trigger": {
          "rule": "DEFAULT",
          "rawRule": "DEFAULT",
          "customRangeGrid": null
        },
        "index": 0
      },
      "talents": [
        {
          "index": 0,
          "name": null,
          "desc": "-",
          "descRaw": "-",
          "bb": {
            "max_target": 4,
            "duration": 10
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": true,
          "fromModule": false
        }
      ],
      "count": null,
      "sources": [
        "display"
      ],
      "bySkill": {
        "1": {
          "skill": {
            "skillId": "sktok_phatm2_encdool_2",
            "iconId": "sktok_phatm2_encdool",
            "name": "本能的召唤",
            "level": 4,
            "desc": "诱导至多4名进入范围的可达敌人（优先选择精英或领袖）在10秒内走向其所在位置，首个目标到达后撤退并使周围所有敌人在6秒内停顿、每0.5秒受到酒神攻击力100%的法术伤害和攻击力15%的神经损伤\n10秒后自动撤退，拥有独立再部署时间",
            "descRaw": "<$ba.attract>诱导</>至多<@ba.vup>4</>名进入范围的可达敌人（优先选择精英或领袖）在<@ba.vup>10</>秒内走向其所在位置，首个目标到达后撤退并使周围所有敌人在<@ba.vup>6</>秒内<$ba.sluggish>停顿</>、每<@ba.vup>0.5</>秒受到酒神攻击力<@ba.vup>100%</>的法术伤害和攻击力<@ba.vup>15%</>的<$ba.dt.neural2>神经损伤</>\n<@ba.rem>10秒后自动撤退，拥有独立再部署时间</>",
            "skillType": "PASSIVE",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {
              "atk_scale": 1,
              "ep_damage_ratio_token": 0.15,
              "ability_range_radius": 0.4,
              "buff_time": 6,
              "sluggish": 6,
              "interval_damage": 0.5,
              "max_target": 4,
              "interval": 10
            },
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_phatm2_encdool_2",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 1
          },
          "count": 1,
          "sources": [
            "skill",
            "display"
          ]
        },
        "2": {
          "skill": {
            "skillId": "sktok_phatm2_encdool_2",
            "iconId": "sktok_phatm2_encdool",
            "name": "本能的召唤",
            "level": 4,
            "desc": "诱导至多4名进入范围的可达敌人（优先选择精英或领袖）在10秒内走向其所在位置，首个目标到达后撤退并使周围所有敌人在6秒内停顿、每0.5秒受到酒神攻击力100%的法术伤害和攻击力15%的神经损伤\n10秒后自动撤退，拥有独立再部署时间",
            "descRaw": "<$ba.attract>诱导</>至多<@ba.vup>4</>名进入范围的可达敌人（优先选择精英或领袖）在<@ba.vup>10</>秒内走向其所在位置，首个目标到达后撤退并使周围所有敌人在<@ba.vup>6</>秒内<$ba.sluggish>停顿</>、每<@ba.vup>0.5</>秒受到酒神攻击力<@ba.vup>100%</>的法术伤害和攻击力<@ba.vup>15%</>的<$ba.dt.neural2>神经损伤</>\n<@ba.rem>10秒后自动撤退，拥有独立再部署时间</>",
            "skillType": "PASSIVE",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {
              "atk_scale": 1,
              "ep_damage_ratio_token": 0.15,
              "ability_range_radius": 0.4,
              "buff_time": 6,
              "sluggish": 6,
              "interval_damage": 0.5,
              "max_target": 4,
              "interval": 10
            },
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_phatm2_encdool_2",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 2
          },
          "count": null,
          "sources": [
            "display"
          ]
        }
      }
    },
    "chess_zj_53_b": {
      "phase": 2,
      "level": 60,
      "stats": {
        "maxHp": 100,
        "atk": 100,
        "def": 0,
        "res": 0,
        "cost": 5,
        "blockCnt": 0,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 25,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          2,
          0
        ],
        [
          1,
          -1
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          0,
          -2
        ],
        [
          0,
          -1
        ],
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          0,
          2
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ],
        [
          -2,
          0
        ]
      ],
      "trait": {
        "desc": "不会受到攻击，只能部署在近战位",
        "descRaw": "不会受到攻击，只能部署在近战位",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "skill": {
        "skillId": "sktok_phatm2_encdool_2",
        "iconId": "sktok_phatm2_encdool",
        "name": "本能的召唤",
        "level": 7,
        "desc": "诱导至多4名进入范围的可达敌人（优先选择精英或领袖）在10秒内走向其所在位置，首个目标到达后撤退并使周围所有敌人在6秒内停顿、每0.5秒受到酒神攻击力120%的法术伤害和攻击力20%的神经损伤\n10秒后自动撤退，拥有独立再部署时间",
        "descRaw": "<$ba.attract>诱导</>至多<@ba.vup>4</>名进入范围的可达敌人（优先选择精英或领袖）在<@ba.vup>10</>秒内走向其所在位置，首个目标到达后撤退并使周围所有敌人在<@ba.vup>6</>秒内<$ba.sluggish>停顿</>、每<@ba.vup>0.5</>秒受到酒神攻击力<@ba.vup>120%</>的法术伤害和攻击力<@ba.vup>20%</>的<$ba.dt.neural2>神经损伤</>\n<@ba.rem>10秒后自动撤退，拥有独立再部署时间</>",
        "skillType": "PASSIVE",
        "durationType": "NONE",
        "duration": -1,
        "spType": "ON_DEPLOY",
        "spCost": 0,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk_scale": 1.2,
          "ep_damage_ratio_token": 0.2,
          "ability_range_radius": 0.4,
          "buff_time": 6,
          "sluggish": 6,
          "interval_damage": 0.5,
          "max_target": 4,
          "interval": 10
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "sktok_phatm2_encdool_2",
        "trigger": {
          "rule": "DEFAULT",
          "rawRule": "DEFAULT",
          "customRangeGrid": null
        },
        "index": 0
      },
      "talents": [
        {
          "index": 0,
          "name": null,
          "desc": "-",
          "descRaw": "-",
          "bb": {
            "max_target": 4,
            "duration": 10
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": true,
          "fromModule": false
        }
      ],
      "count": null,
      "sources": [
        "display"
      ],
      "bySkill": {
        "1": {
          "skill": {
            "skillId": "sktok_phatm2_encdool_2",
            "iconId": "sktok_phatm2_encdool",
            "name": "本能的召唤",
            "level": 7,
            "desc": "诱导至多4名进入范围的可达敌人（优先选择精英或领袖）在10秒内走向其所在位置，首个目标到达后撤退并使周围所有敌人在6秒内停顿、每0.5秒受到酒神攻击力120%的法术伤害和攻击力20%的神经损伤\n10秒后自动撤退，拥有独立再部署时间",
            "descRaw": "<$ba.attract>诱导</>至多<@ba.vup>4</>名进入范围的可达敌人（优先选择精英或领袖）在<@ba.vup>10</>秒内走向其所在位置，首个目标到达后撤退并使周围所有敌人在<@ba.vup>6</>秒内<$ba.sluggish>停顿</>、每<@ba.vup>0.5</>秒受到酒神攻击力<@ba.vup>120%</>的法术伤害和攻击力<@ba.vup>20%</>的<$ba.dt.neural2>神经损伤</>\n<@ba.rem>10秒后自动撤退，拥有独立再部署时间</>",
            "skillType": "PASSIVE",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {
              "atk_scale": 1.2,
              "ep_damage_ratio_token": 0.2,
              "ability_range_radius": 0.4,
              "buff_time": 6,
              "sluggish": 6,
              "interval_damage": 0.5,
              "max_target": 4,
              "interval": 10
            },
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_phatm2_encdool_2",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 1
          },
          "count": 1,
          "sources": [
            "skill",
            "display"
          ]
        },
        "2": {
          "skill": {
            "skillId": "sktok_phatm2_encdool_2",
            "iconId": "sktok_phatm2_encdool",
            "name": "本能的召唤",
            "level": 7,
            "desc": "诱导至多4名进入范围的可达敌人（优先选择精英或领袖）在10秒内走向其所在位置，首个目标到达后撤退并使周围所有敌人在6秒内停顿、每0.5秒受到酒神攻击力120%的法术伤害和攻击力20%的神经损伤\n10秒后自动撤退，拥有独立再部署时间",
            "descRaw": "<$ba.attract>诱导</>至多<@ba.vup>4</>名进入范围的可达敌人（优先选择精英或领袖）在<@ba.vup>10</>秒内走向其所在位置，首个目标到达后撤退并使周围所有敌人在<@ba.vup>6</>秒内<$ba.sluggish>停顿</>、每<@ba.vup>0.5</>秒受到酒神攻击力<@ba.vup>120%</>的法术伤害和攻击力<@ba.vup>20%</>的<$ba.dt.neural2>神经损伤</>\n<@ba.rem>10秒后自动撤退，拥有独立再部署时间</>",
            "skillType": "PASSIVE",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {
              "atk_scale": 1.2,
              "ep_damage_ratio_token": 0.2,
              "ability_range_radius": 0.4,
              "buff_time": 6,
              "sluggish": 6,
              "interval_damage": 0.5,
              "max_target": 4,
              "interval": 10
            },
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_phatm2_encdool_2",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 2
          },
          "count": null,
          "sources": [
            "display"
          ]
        }
      },
      "byModule": {
        "uniequip_002_phatm2": {
          "stats": {
            "maxHp": 100,
            "atk": 100,
            "def": 0,
            "res": 0,
            "cost": 5,
            "blockCnt": 0,
            "bat": 1,
            "aspd": 100,
            "respawnTime": 25,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 1,
            "deckStack": 0
          },
          "immunities": {
            "stun": false,
            "silence": false,
            "sleep": false,
            "frozen": false,
            "levitate": false
          },
          "trait": {
            "desc": "不会受到攻击，只能部署在近战位",
            "descRaw": "不会受到攻击，只能部署在近战位",
            "bb": {},
            "bbStr": {}
          },
          "talents": [
            {
              "index": 0,
              "name": null,
              "desc": "-",
              "descRaw": "-",
              "bb": {
                "max_target": 4,
                "duration": 10
              },
              "bbStr": {},
              "rangeGrid": null,
              "tokenKey": null,
              "hidden": true,
              "fromModule": false
            }
          ]
        }
      }
    },
    "char_1042_phatm2@2/60/7/3": {
      "phase": 2,
      "level": 60,
      "stats": {
        "maxHp": 100,
        "atk": 100,
        "def": 0,
        "res": 0,
        "cost": 5,
        "blockCnt": 0,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 25,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          2,
          0
        ],
        [
          1,
          -1
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          0,
          -2
        ],
        [
          0,
          -1
        ],
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          0,
          2
        ],
        [
          -1,
          -1
        ],
        [
          -1,
          0
        ],
        [
          -1,
          1
        ],
        [
          -2,
          0
        ]
      ],
      "trait": {
        "desc": "不会受到攻击，只能部署在近战位",
        "descRaw": "不会受到攻击，只能部署在近战位",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "skill": {
        "skillId": "sktok_phatm2_encdool_2",
        "iconId": "sktok_phatm2_encdool",
        "name": "本能的召唤",
        "level": 7,
        "desc": "诱导至多4名进入范围的可达敌人（优先选择精英或领袖）在10秒内走向其所在位置，首个目标到达后撤退并使周围所有敌人在6秒内停顿、每0.5秒受到酒神攻击力120%的法术伤害和攻击力20%的神经损伤\n10秒后自动撤退，拥有独立再部署时间",
        "descRaw": "<$ba.attract>诱导</>至多<@ba.vup>4</>名进入范围的可达敌人（优先选择精英或领袖）在<@ba.vup>10</>秒内走向其所在位置，首个目标到达后撤退并使周围所有敌人在<@ba.vup>6</>秒内<$ba.sluggish>停顿</>、每<@ba.vup>0.5</>秒受到酒神攻击力<@ba.vup>120%</>的法术伤害和攻击力<@ba.vup>20%</>的<$ba.dt.neural2>神经损伤</>\n<@ba.rem>10秒后自动撤退，拥有独立再部署时间</>",
        "skillType": "PASSIVE",
        "durationType": "NONE",
        "duration": -1,
        "spType": "ON_DEPLOY",
        "spCost": 0,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk_scale": 1.2,
          "ep_damage_ratio_token": 0.2,
          "ability_range_radius": 0.4,
          "buff_time": 6,
          "sluggish": 6,
          "interval_damage": 0.5,
          "max_target": 4,
          "interval": 10
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "sktok_phatm2_encdool_2",
        "trigger": {
          "rule": "DEFAULT",
          "rawRule": "DEFAULT",
          "customRangeGrid": null
        },
        "index": 0
      },
      "talents": [
        {
          "index": 0,
          "name": null,
          "desc": "-",
          "descRaw": "-",
          "bb": {
            "max_target": 4,
            "duration": 10
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": true,
          "fromModule": false
        }
      ],
      "count": null,
      "sources": [
        "display"
      ],
      "bySkill": {
        "1": {
          "skill": {
            "skillId": "sktok_phatm2_encdool_2",
            "iconId": "sktok_phatm2_encdool",
            "name": "本能的召唤",
            "level": 7,
            "desc": "诱导至多4名进入范围的可达敌人（优先选择精英或领袖）在10秒内走向其所在位置，首个目标到达后撤退并使周围所有敌人在6秒内停顿、每0.5秒受到酒神攻击力120%的法术伤害和攻击力20%的神经损伤\n10秒后自动撤退，拥有独立再部署时间",
            "descRaw": "<$ba.attract>诱导</>至多<@ba.vup>4</>名进入范围的可达敌人（优先选择精英或领袖）在<@ba.vup>10</>秒内走向其所在位置，首个目标到达后撤退并使周围所有敌人在<@ba.vup>6</>秒内<$ba.sluggish>停顿</>、每<@ba.vup>0.5</>秒受到酒神攻击力<@ba.vup>120%</>的法术伤害和攻击力<@ba.vup>20%</>的<$ba.dt.neural2>神经损伤</>\n<@ba.rem>10秒后自动撤退，拥有独立再部署时间</>",
            "skillType": "PASSIVE",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {
              "atk_scale": 1.2,
              "ep_damage_ratio_token": 0.2,
              "ability_range_radius": 0.4,
              "buff_time": 6,
              "sluggish": 6,
              "interval_damage": 0.5,
              "max_target": 4,
              "interval": 10
            },
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_phatm2_encdool_2",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 1
          },
          "count": 1,
          "sources": [
            "skill",
            "display"
          ]
        },
        "2": {
          "skill": {
            "skillId": "sktok_phatm2_encdool_2",
            "iconId": "sktok_phatm2_encdool",
            "name": "本能的召唤",
            "level": 7,
            "desc": "诱导至多4名进入范围的可达敌人（优先选择精英或领袖）在10秒内走向其所在位置，首个目标到达后撤退并使周围所有敌人在6秒内停顿、每0.5秒受到酒神攻击力120%的法术伤害和攻击力20%的神经损伤\n10秒后自动撤退，拥有独立再部署时间",
            "descRaw": "<$ba.attract>诱导</>至多<@ba.vup>4</>名进入范围的可达敌人（优先选择精英或领袖）在<@ba.vup>10</>秒内走向其所在位置，首个目标到达后撤退并使周围所有敌人在<@ba.vup>6</>秒内<$ba.sluggish>停顿</>、每<@ba.vup>0.5</>秒受到酒神攻击力<@ba.vup>120%</>的法术伤害和攻击力<@ba.vup>20%</>的<$ba.dt.neural2>神经损伤</>\n<@ba.rem>10秒后自动撤退，拥有独立再部署时间</>",
            "skillType": "PASSIVE",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {
              "atk_scale": 1.2,
              "ep_damage_ratio_token": 0.2,
              "ability_range_radius": 0.4,
              "buff_time": 6,
              "sluggish": 6,
              "interval_damage": 0.5,
              "max_target": 4,
              "interval": 10
            },
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_phatm2_encdool_2",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 2
          },
          "count": null,
          "sources": [
            "display"
          ]
        }
      },
      "byModule": {
        "uniequip_002_phatm2": {
          "stats": {
            "maxHp": 100,
            "atk": 100,
            "def": 0,
            "res": 0,
            "cost": 5,
            "blockCnt": 0,
            "bat": 1,
            "aspd": 100,
            "respawnTime": 25,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 1,
            "deckStack": 0
          },
          "immunities": {
            "stun": false,
            "silence": false,
            "sleep": false,
            "frozen": false,
            "levitate": false
          },
          "trait": {
            "desc": "不会受到攻击，只能部署在近战位",
            "descRaw": "不会受到攻击，只能部署在近战位",
            "bb": {},
            "bbStr": {}
          },
          "talents": [
            {
              "index": 0,
              "name": null,
              "desc": "-",
              "descRaw": "-",
              "bb": {
                "max_target": 4,
                "duration": 10
              },
              "bbStr": {},
              "rangeGrid": null,
              "tokenKey": null,
              "hidden": true,
              "fromModule": false
            }
          ]
        }
      }
    }
  },
  "assets": {
    "avatar": "token_10054_phatm2_encdool",
    "spine": "token_10054_phatm2_encdool"
  }
}
```

### 新增：迷狂牢笼 · token_10055_phatm2_mndclv

炸惊：牢笼可以阻挡生成/刷新时本格所有敌人，没有阻挡目标或受到3次来自阻挡目标的攻击后消失，酒神技能结束后额外持续30秒

```json
{
  "tokenId": "token_10055_phatm2_mndclv",
  "kind": "summon",
  "name": "迷狂牢笼",
  "appellation": "Cage of chaos",
  "desc": "牢笼可以阻挡生成/刷新时本格所有敌人，没有阻挡目标或受到3次来自阻挡目标的攻击后消失，酒神技能结束后额外持续30秒",
  "descRaw": "牢笼可以阻挡生成/刷新时本格所有敌人，没有阻挡目标或受到3次来自阻挡目标的攻击后消失，酒神技能结束后额外持续30秒",
  "profession": "TOKEN",
  "subProfessionId": "notchar1",
  "position": "MELEE",
  "displayType": "HIDDEN",
  "placeable": false,
  "ownerRange": false,
  "owners": [
    "chess_zj_53_a",
    "chess_zj_53_b"
  ],
  "stats": {
    "maxHp": 3,
    "atk": 100,
    "def": 0,
    "res": 0,
    "cost": 0,
    "blockCnt": 0,
    "bat": 1,
    "aspd": 100,
    "respawnTime": 5,
    "spRecovery": 1,
    "hpRecoveryPerSec": 0,
    "moveSpeed": 1,
    "tauntLevel": 0,
    "massLevel": 0,
    "deployLimit": 1,
    "deckStack": 0
  },
  "rangeGrid": [
    [
      0,
      0
    ]
  ],
  "dmgType": "phys",
  "attackKind": "melee",
  "projectile": "none",
  "canHitFly": false,
  "skill": {
    "skillId": "sktok_phatm2_mndclv_3",
    "bb": {}
  },
  "deployLimit": 1,
  "count": null,
  "abnormal": [],
  "variants": {
    "chess_zj_53_a": {
      "phase": 2,
      "level": 1,
      "stats": {
        "maxHp": 3,
        "atk": 100,
        "def": 0,
        "res": 0,
        "cost": 0,
        "blockCnt": 0,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 5,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          0,
          0
        ]
      ],
      "trait": {
        "desc": "牢笼可以阻挡生成/刷新时本格所有敌人，没有阻挡目标或受到3次来自阻挡目标的攻击后消失，酒神技能结束后额外持续30秒",
        "descRaw": "牢笼可以阻挡生成/刷新时本格所有敌人，没有阻挡目标或受到3次来自阻挡目标的攻击后消失，酒神技能结束后额外持续30秒",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "skill": {
        "skillId": "sktok_phatm2_mndclv_3",
        "iconId": "sktok_phatm2_mndclv_3",
        "name": "迷狂牢笼",
        "level": 4,
        "desc": null,
        "descRaw": null,
        "skillType": "PASSIVE",
        "durationType": "NONE",
        "duration": -1,
        "spType": "ON_DEPLOY",
        "spCost": 0,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {},
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "sktok_phatm2_mndclv_3",
        "trigger": {
          "rule": "DEFAULT",
          "rawRule": "DEFAULT",
          "customRangeGrid": null
        },
        "index": 0
      },
      "talents": [],
      "count": null,
      "sources": [
        "display"
      ],
      "bySkill": {
        "1": {
          "skill": {
            "skillId": "sktok_phatm2_mndclv_3",
            "iconId": "sktok_phatm2_mndclv_3",
            "name": "迷狂牢笼",
            "level": 4,
            "desc": null,
            "descRaw": null,
            "skillType": "PASSIVE",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {},
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_phatm2_mndclv_3",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 1
          },
          "count": null,
          "sources": [
            "display"
          ]
        },
        "2": {
          "skill": {
            "skillId": "sktok_phatm2_mndclv_3",
            "iconId": "sktok_phatm2_mndclv_3",
            "name": "迷狂牢笼",
            "level": 4,
            "desc": null,
            "descRaw": null,
            "skillType": "PASSIVE",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {},
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_phatm2_mndclv_3",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 2
          },
          "count": null,
          "sources": [
            "skill",
            "display"
          ]
        }
      }
    },
    "chess_zj_53_b": {
      "phase": 2,
      "level": 60,
      "stats": {
        "maxHp": 3,
        "atk": 100,
        "def": 0,
        "res": 0,
        "cost": 0,
        "blockCnt": 0,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 5,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          0,
          0
        ]
      ],
      "trait": {
        "desc": "牢笼可以阻挡生成/刷新时本格所有敌人，没有阻挡目标或受到3次来自阻挡目标的攻击后消失，酒神技能结束后额外持续30秒",
        "descRaw": "牢笼可以阻挡生成/刷新时本格所有敌人，没有阻挡目标或受到3次来自阻挡目标的攻击后消失，酒神技能结束后额外持续30秒",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "skill": {
        "skillId": "sktok_phatm2_mndclv_3",
        "iconId": "sktok_phatm2_mndclv_3",
        "name": "迷狂牢笼",
        "level": 7,
        "desc": null,
        "descRaw": null,
        "skillType": "PASSIVE",
        "durationType": "NONE",
        "duration": -1,
        "spType": "ON_DEPLOY",
        "spCost": 0,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {},
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "sktok_phatm2_mndclv_3",
        "trigger": {
          "rule": "DEFAULT",
          "rawRule": "DEFAULT",
          "customRangeGrid": null
        },
        "index": 0
      },
      "talents": [],
      "count": null,
      "sources": [
        "display"
      ],
      "bySkill": {
        "1": {
          "skill": {
            "skillId": "sktok_phatm2_mndclv_3",
            "iconId": "sktok_phatm2_mndclv_3",
            "name": "迷狂牢笼",
            "level": 7,
            "desc": null,
            "descRaw": null,
            "skillType": "PASSIVE",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {},
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_phatm2_mndclv_3",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 1
          },
          "count": null,
          "sources": [
            "display"
          ]
        },
        "2": {
          "skill": {
            "skillId": "sktok_phatm2_mndclv_3",
            "iconId": "sktok_phatm2_mndclv_3",
            "name": "迷狂牢笼",
            "level": 7,
            "desc": null,
            "descRaw": null,
            "skillType": "PASSIVE",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {},
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_phatm2_mndclv_3",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 2
          },
          "count": null,
          "sources": [
            "skill",
            "display"
          ]
        }
      },
      "byModule": {
        "uniequip_002_phatm2": {
          "stats": {
            "maxHp": 3,
            "atk": 100,
            "def": 0,
            "res": 0,
            "cost": 0,
            "blockCnt": 0,
            "bat": 1,
            "aspd": 100,
            "respawnTime": 5,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 1,
            "deckStack": 0
          },
          "immunities": {
            "stun": false,
            "silence": false,
            "sleep": false,
            "frozen": false,
            "levitate": false
          },
          "trait": {
            "desc": "牢笼可以阻挡生成/刷新时本格所有敌人，没有阻挡目标或受到3次来自阻挡目标的攻击后消失，酒神技能结束后额外持续30秒",
            "descRaw": "牢笼可以阻挡生成/刷新时本格所有敌人，没有阻挡目标或受到3次来自阻挡目标的攻击后消失，酒神技能结束后额外持续30秒",
            "bb": {},
            "bbStr": {}
          },
          "talents": []
        }
      }
    },
    "char_1042_phatm2@2/60/7/3": {
      "phase": 2,
      "level": 60,
      "stats": {
        "maxHp": 3,
        "atk": 100,
        "def": 0,
        "res": 0,
        "cost": 0,
        "blockCnt": 0,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 5,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          0,
          0
        ]
      ],
      "trait": {
        "desc": "牢笼可以阻挡生成/刷新时本格所有敌人，没有阻挡目标或受到3次来自阻挡目标的攻击后消失，酒神技能结束后额外持续30秒",
        "descRaw": "牢笼可以阻挡生成/刷新时本格所有敌人，没有阻挡目标或受到3次来自阻挡目标的攻击后消失，酒神技能结束后额外持续30秒",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "skill": {
        "skillId": "sktok_phatm2_mndclv_3",
        "iconId": "sktok_phatm2_mndclv_3",
        "name": "迷狂牢笼",
        "level": 7,
        "desc": null,
        "descRaw": null,
        "skillType": "PASSIVE",
        "durationType": "NONE",
        "duration": -1,
        "spType": "ON_DEPLOY",
        "spCost": 0,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {},
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "sktok_phatm2_mndclv_3",
        "trigger": {
          "rule": "DEFAULT",
          "rawRule": "DEFAULT",
          "customRangeGrid": null
        },
        "index": 0
      },
      "talents": [],
      "count": null,
      "sources": [
        "display"
      ],
      "bySkill": {
        "1": {
          "skill": {
            "skillId": "sktok_phatm2_mndclv_3",
            "iconId": "sktok_phatm2_mndclv_3",
            "name": "迷狂牢笼",
            "level": 7,
            "desc": null,
            "descRaw": null,
            "skillType": "PASSIVE",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {},
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_phatm2_mndclv_3",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 1
          },
          "count": null,
          "sources": [
            "display"
          ]
        },
        "2": {
          "skill": {
            "skillId": "sktok_phatm2_mndclv_3",
            "iconId": "sktok_phatm2_mndclv_3",
            "name": "迷狂牢笼",
            "level": 7,
            "desc": null,
            "descRaw": null,
            "skillType": "PASSIVE",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {},
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_phatm2_mndclv_3",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 2
          },
          "count": null,
          "sources": [
            "skill",
            "display"
          ]
        }
      },
      "byModule": {
        "uniequip_002_phatm2": {
          "stats": {
            "maxHp": 3,
            "atk": 100,
            "def": 0,
            "res": 0,
            "cost": 0,
            "blockCnt": 0,
            "bat": 1,
            "aspd": 100,
            "respawnTime": 5,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 1,
            "deckStack": 0
          },
          "immunities": {
            "stun": false,
            "silence": false,
            "sleep": false,
            "frozen": false,
            "levitate": false
          },
          "trait": {
            "desc": "牢笼可以阻挡生成/刷新时本格所有敌人，没有阻挡目标或受到3次来自阻挡目标的攻击后消失，酒神技能结束后额外持续30秒",
            "descRaw": "牢笼可以阻挡生成/刷新时本格所有敌人，没有阻挡目标或受到3次来自阻挡目标的攻击后消失，酒神技能结束后额外持续30秒",
            "bb": {},
            "bbStr": {}
          },
          "talents": []
        }
      }
    }
  },
  "assets": {
    "avatar": "token_10055_phatm2_mndclv",
    "spine": "token_10055_phatm2_mndclv"
  }
}
```

### 新增：中继器 · token_10070_aphris_pc

炸惊：不会受到攻击，可部署在地面或高台位

```json
{
  "tokenId": "token_10070_aphris_pc",
  "kind": "summon",
  "name": "中继器",
  "appellation": "Repeater",
  "desc": "不会受到攻击，可部署在地面或高台位",
  "descRaw": "不会受到攻击，可部署在地面或高台位",
  "profession": "TOKEN",
  "subProfessionId": "notchar1",
  "position": "ALL",
  "displayType": null,
  "placeable": true,
  "ownerRange": false,
  "owners": [
    "chess_zj_56_a",
    "chess_zj_56_b"
  ],
  "stats": {
    "maxHp": 500,
    "atk": 0,
    "def": 0,
    "res": 0,
    "cost": 3,
    "blockCnt": 0,
    "bat": 1,
    "aspd": 100,
    "respawnTime": 30,
    "spRecovery": 1,
    "hpRecoveryPerSec": 0,
    "moveSpeed": 1,
    "tauntLevel": 0,
    "massLevel": 0,
    "deployLimit": 1,
    "deckStack": 0
  },
  "rangeGrid": [
    [
      0,
      0
    ]
  ],
  "dmgType": "phys",
  "attackKind": "ranged",
  "projectile": "arrow",
  "canHitFly": true,
  "skill": null,
  "deployLimit": 1,
  "count": 1,
  "abnormal": [],
  "variants": {
    "chess_zj_56_a": {
      "phase": 2,
      "level": 1,
      "stats": {
        "maxHp": 500,
        "atk": 0,
        "def": 0,
        "res": 0,
        "cost": 3,
        "blockCnt": 0,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 30,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          0,
          0
        ]
      ],
      "trait": {
        "desc": "不会受到攻击，可部署在地面或高台位",
        "descRaw": "不会受到攻击，可部署在地面或高台位",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "ranged",
      "projectile": "arrow",
      "canHitFly": true,
      "targetPriority": null,
      "skill": null,
      "talents": [
        {
          "index": 0,
          "name": "转向",
          "desc": "能将谬因的攻击转向，且使该次攻击距离+2",
          "descRaw": "能将谬因的攻击转向，且使该次攻击距离+2",
          "bb": {
            "duration": 25
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "count": 1,
      "sources": [
        "talent",
        "display"
      ],
      "bySkill": {
        "1": {
          "skill": null,
          "count": 1,
          "sources": [
            "talent",
            "display"
          ]
        },
        "2": {
          "skill": null,
          "count": 1,
          "sources": [
            "talent",
            "display"
          ]
        }
      }
    },
    "chess_zj_56_b": {
      "phase": 2,
      "level": 60,
      "stats": {
        "maxHp": 500,
        "atk": 0,
        "def": 0,
        "res": 0,
        "cost": 3,
        "blockCnt": 0,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 30,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          0,
          0
        ]
      ],
      "trait": {
        "desc": "不会受到攻击，可部署在地面或高台位",
        "descRaw": "不会受到攻击，可部署在地面或高台位",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "ranged",
      "projectile": "arrow",
      "canHitFly": true,
      "targetPriority": null,
      "skill": null,
      "talents": [
        {
          "index": 0,
          "name": "转向",
          "desc": "能将谬因的攻击转向，且使该次攻击距离+2",
          "descRaw": "能将谬因的攻击转向，且使该次攻击距离+2",
          "bb": {
            "duration": 25
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "count": 1,
      "sources": [
        "talent",
        "display"
      ],
      "bySkill": {
        "1": {
          "skill": null,
          "count": 1,
          "sources": [
            "talent",
            "display"
          ]
        },
        "2": {
          "skill": null,
          "count": 1,
          "sources": [
            "talent",
            "display"
          ]
        }
      },
      "byModule": {
        "uniequip_002_aphris": {
          "stats": {
            "maxHp": 500,
            "atk": 0,
            "def": 0,
            "res": 0,
            "cost": 3,
            "blockCnt": 0,
            "bat": 1,
            "aspd": 100,
            "respawnTime": 30,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 1,
            "deckStack": 0
          },
          "immunities": {
            "stun": false,
            "silence": false,
            "sleep": false,
            "frozen": false,
            "levitate": false
          },
          "trait": {
            "desc": "不会受到攻击，可部署在地面或高台位",
            "descRaw": "不会受到攻击，可部署在地面或高台位",
            "bb": {},
            "bbStr": {}
          },
          "talents": [
            {
              "index": 0,
              "name": "转向",
              "desc": "能将谬因的攻击转向，且使该次攻击距离+2",
              "descRaw": "能将谬因的攻击转向，且使该次攻击距离+2",
              "bb": {
                "duration": 25
              },
              "bbStr": {},
              "rangeGrid": null,
              "tokenKey": null,
              "hidden": false,
              "fromModule": false
            }
          ]
        }
      }
    },
    "char_4229_aphris@2/60/7/3": {
      "phase": 2,
      "level": 60,
      "stats": {
        "maxHp": 500,
        "atk": 0,
        "def": 0,
        "res": 0,
        "cost": 3,
        "blockCnt": 0,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 30,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          0,
          0
        ]
      ],
      "trait": {
        "desc": "不会受到攻击，可部署在地面或高台位",
        "descRaw": "不会受到攻击，可部署在地面或高台位",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "ranged",
      "projectile": "arrow",
      "canHitFly": true,
      "targetPriority": null,
      "skill": null,
      "talents": [
        {
          "index": 0,
          "name": "转向",
          "desc": "能将谬因的攻击转向，且使该次攻击距离+2",
          "descRaw": "能将谬因的攻击转向，且使该次攻击距离+2",
          "bb": {
            "duration": 25
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "count": 1,
      "sources": [
        "talent",
        "display"
      ],
      "bySkill": {
        "1": {
          "skill": null,
          "count": 1,
          "sources": [
            "talent",
            "display"
          ]
        },
        "2": {
          "skill": null,
          "count": 1,
          "sources": [
            "talent",
            "display"
          ]
        }
      },
      "byModule": {
        "uniequip_002_aphris": {
          "stats": {
            "maxHp": 500,
            "atk": 0,
            "def": 0,
            "res": 0,
            "cost": 3,
            "blockCnt": 0,
            "bat": 1,
            "aspd": 100,
            "respawnTime": 20,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 1,
            "deckStack": 0
          },
          "immunities": {
            "stun": false,
            "silence": false,
            "sleep": false,
            "frozen": false,
            "levitate": false
          },
          "trait": {
            "desc": "不会受到攻击，可部署在地面或高台位",
            "descRaw": "不会受到攻击，可部署在地面或高台位",
            "bb": {},
            "bbStr": {}
          },
          "talents": [
            {
              "index": 0,
              "name": "转向",
              "desc": "能将谬因的攻击转向，且使该次攻击距离+2",
              "descRaw": "能将谬因的攻击转向，且使该次攻击距离+2",
              "bb": {
                "duration": 25
              },
              "bbStr": {},
              "rangeGrid": null,
              "tokenKey": null,
              "hidden": false,
              "fromModule": false
            },
            {
              "index": -1,
              "name": null,
              "desc": null,
              "descRaw": null,
              "bb": {
                "duration": 35
              },
              "bbStr": {},
              "rangeGrid": null,
              "tokenKey": null,
              "hidden": true,
              "fromModule": true
            }
          ]
        }
      }
    }
  },
  "assets": {
    "avatar": "token_10070_aphris_pc",
    "spine": "token_10070_aphris_pc"
  }
}
```

### 新增：棋子 · token_10064_wang_stone1

炸惊：（结构或参数变化；见下列完整记录）

```json
{
  "tokenId": "token_10064_wang_stone1",
  "kind": "summon",
  "name": "棋子",
  "appellation": "stones",
  "desc": "",
  "descRaw": "",
  "profession": "TOKEN",
  "subProfessionId": "notchar1",
  "position": "ALL",
  "displayType": null,
  "placeable": true,
  "ownerRange": false,
  "owners": [
    "chess_zj_74_a",
    "chess_zj_74_b"
  ],
  "stats": {
    "maxHp": 1000,
    "atk": 100,
    "def": 0,
    "res": 0,
    "cost": 3,
    "blockCnt": 0,
    "bat": 1,
    "aspd": 100,
    "respawnTime": 2,
    "spRecovery": 1,
    "hpRecoveryPerSec": 0,
    "moveSpeed": 1,
    "tauntLevel": 0,
    "massLevel": 0,
    "deployLimit": 7,
    "deckStack": 8
  },
  "rangeGrid": [
    [
      0,
      0
    ]
  ],
  "dmgType": "phys",
  "attackKind": "melee",
  "projectile": "none",
  "canHitFly": false,
  "skill": {
    "skillId": "sktok_wang_1",
    "bb": {
      "atk_scale": 1.05,
      "sluggish": 6.5
    }
  },
  "deployLimit": 7,
  "count": 7,
  "abnormal": [],
  "variants": {
    "chess_zj_74_a": {
      "phase": 2,
      "level": 1,
      "stats": {
        "maxHp": 1000,
        "atk": 100,
        "def": 0,
        "res": 0,
        "cost": 3,
        "blockCnt": 0,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 2,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 7,
        "deckStack": 8
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          0,
          0
        ]
      ],
      "trait": {
        "desc": "",
        "descRaw": "",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "skill": {
        "skillId": "sktok_wang_1",
        "iconId": "sktok_wang_stone1",
        "name": "取势",
        "level": 4,
        "desc": "触发时使目标敌人停顿且每秒受到相当于望攻击力的105%的法术伤害，持续6.5秒",
        "descRaw": "触发时使目标敌人<$ba.sluggish>停顿</>且每秒受到相当于望攻击力的<@ba.vup>105%</>的法术伤害，持续<@ba.vup>6.5</>秒",
        "skillType": "AUTO",
        "durationType": "NONE",
        "duration": -1,
        "spType": "ON_DEPLOY",
        "spCost": 0,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk_scale": 1.05,
          "sluggish": 6.5
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "sktok_wang_1",
        "trigger": {
          "rule": "DEFAULT",
          "rawRule": "DEFAULT",
          "customRangeGrid": null
        },
        "index": 0
      },
      "talents": [
        {
          "index": 0,
          "name": null,
          "desc": null,
          "descRaw": null,
          "bb": {
            "max_deck_stack_cnt": 1,
            "max_deploy_count": 1,
            "s3_max_deck_stack_cnt": 0,
            "s3_max_deploy_count": 0
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": true,
          "fromModule": false,
          "potMin": 2,
          "potBelow": {
            "bb": {
              "max_deck_stack_cnt": 0,
              "max_deploy_count": 0,
              "s3_max_deck_stack_cnt": 0,
              "s3_max_deploy_count": 0
            }
          }
        }
      ],
      "count": 7,
      "sources": [
        "talent",
        "skill",
        "display"
      ],
      "bySkill": {
        "1": {
          "skill": {
            "skillId": "sktok_wang_2",
            "iconId": "sktok_wang_stone2",
            "name": "连星",
            "level": 4,
            "desc": "触发时对连线方向上两侧3格范围内的敌人造成相当于攻击力的420%的法术伤害，并使其6秒内移动速度降低35%",
            "descRaw": "触发时对连线方向上两侧3格范围内的敌人造成相当于攻击力的<@ba.vup>420%</>的法术伤害，并使其<@ba.vup>6</>秒内移动速度降低<@ba.vup>35%</>",
            "skillType": "AUTO",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {
              "atk_scale": 4.2,
              "move_speed": -0.35,
              "duration": 6,
              "tile_count": 6,
              "display_move_speed": 0.35
            },
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_wang_2",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 1
          },
          "count": 7,
          "sources": [
            "talent",
            "skill",
            "display"
          ]
        },
        "2": {
          "skill": {
            "skillId": "sktok_wang_3",
            "iconId": "sktok_wang_stone3",
            "name": "天下劫",
            "level": 4,
            "desc": "棋子的触发和伤害范围扩大，触发时造成相当于攻击力290%的法术伤害",
            "descRaw": "棋子的触发和伤害范围扩大，触发时造成相当于攻击力<@ba.vup>290%</>的法术伤害",
            "skillType": "AUTO",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {
              "atk_scale": 2.9
            },
            "bbStr": {},
            "rangeId": "x-6",
            "rangeGrid": [
              [
                2,
                0
              ],
              [
                1,
                0
              ],
              [
                0,
                -2
              ],
              [
                0,
                -1
              ],
              [
                0,
                0
              ],
              [
                0,
                1
              ],
              [
                0,
                2
              ],
              [
                -1,
                0
              ],
              [
                -2,
                0
              ]
            ],
            "prefabId": "sktok_wang_3",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 2
          },
          "count": 7,
          "sources": [
            "talent",
            "skill",
            "display"
          ]
        }
      },
      "potDown": {
        "1": {
          "stats.deployLimit": 6,
          "stats.deckStack": 7,
          "count": 6,
          "bySkill.1.count": 6,
          "bySkill.2.count": 6
        }
      }
    },
    "chess_zj_74_b": {
      "phase": 2,
      "level": 60,
      "stats": {
        "maxHp": 1000,
        "atk": 100,
        "def": 0,
        "res": 0,
        "cost": 3,
        "blockCnt": 0,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 2,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 7,
        "deckStack": 8
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          0,
          0
        ]
      ],
      "trait": {
        "desc": "",
        "descRaw": "",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "skill": {
        "skillId": "sktok_wang_1",
        "iconId": "sktok_wang_stone1",
        "name": "取势",
        "level": 7,
        "desc": "触发时使目标敌人停顿且每秒受到相当于望攻击力的120%的法术伤害，持续6.5秒",
        "descRaw": "触发时使目标敌人<$ba.sluggish>停顿</>且每秒受到相当于望攻击力的<@ba.vup>120%</>的法术伤害，持续<@ba.vup>6.5</>秒",
        "skillType": "AUTO",
        "durationType": "NONE",
        "duration": -1,
        "spType": "ON_DEPLOY",
        "spCost": 0,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk_scale": 1.2,
          "sluggish": 6.5
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "sktok_wang_1",
        "trigger": {
          "rule": "DEFAULT",
          "rawRule": "DEFAULT",
          "customRangeGrid": null
        },
        "index": 0
      },
      "talents": [
        {
          "index": 0,
          "name": null,
          "desc": null,
          "descRaw": null,
          "bb": {
            "max_deck_stack_cnt": 1,
            "max_deploy_count": 1,
            "s3_max_deck_stack_cnt": 0,
            "s3_max_deploy_count": 0
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": true,
          "fromModule": false,
          "potMin": 2,
          "potBelow": {
            "bb": {
              "max_deck_stack_cnt": 0,
              "max_deploy_count": 0,
              "s3_max_deck_stack_cnt": 0,
              "s3_max_deploy_count": 0
            }
          }
        }
      ],
      "count": 7,
      "sources": [
        "talent",
        "skill",
        "display"
      ],
      "bySkill": {
        "1": {
          "skill": {
            "skillId": "sktok_wang_2",
            "iconId": "sktok_wang_stone2",
            "name": "连星",
            "level": 7,
            "desc": "触发时对连线方向上两侧3格范围内的敌人造成相当于攻击力的480%的法术伤害，并使其6秒内移动速度降低40%",
            "descRaw": "触发时对连线方向上两侧3格范围内的敌人造成相当于攻击力的<@ba.vup>480%</>的法术伤害，并使其<@ba.vup>6</>秒内移动速度降低<@ba.vup>40%</>",
            "skillType": "AUTO",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {
              "atk_scale": 4.8,
              "move_speed": -0.4,
              "duration": 6,
              "tile_count": 6,
              "display_move_speed": 0.4
            },
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_wang_2",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 1
          },
          "count": 7,
          "sources": [
            "talent",
            "skill",
            "display"
          ]
        },
        "2": {
          "skill": {
            "skillId": "sktok_wang_3",
            "iconId": "sktok_wang_stone3",
            "name": "天下劫",
            "level": 7,
            "desc": "棋子的触发和伤害范围扩大，触发时造成相当于攻击力320%的法术伤害",
            "descRaw": "棋子的触发和伤害范围扩大，触发时造成相当于攻击力<@ba.vup>320%</>的法术伤害",
            "skillType": "AUTO",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {
              "atk_scale": 3.2
            },
            "bbStr": {},
            "rangeId": "x-6",
            "rangeGrid": [
              [
                2,
                0
              ],
              [
                1,
                0
              ],
              [
                0,
                -2
              ],
              [
                0,
                -1
              ],
              [
                0,
                0
              ],
              [
                0,
                1
              ],
              [
                0,
                2
              ],
              [
                -1,
                0
              ],
              [
                -2,
                0
              ]
            ],
            "prefabId": "sktok_wang_3",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 2
          },
          "count": 7,
          "sources": [
            "talent",
            "skill",
            "display"
          ]
        }
      },
      "byModule": {
        "uniequip_002_wang": {
          "stats": {
            "maxHp": 1000,
            "atk": 100,
            "def": 0,
            "res": 0,
            "cost": 2,
            "blockCnt": 0,
            "bat": 1,
            "aspd": 100,
            "respawnTime": 2,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 8,
            "deckStack": 8
          },
          "immunities": {
            "stun": false,
            "silence": false,
            "sleep": false,
            "frozen": false,
            "levitate": false
          },
          "trait": {
            "desc": "",
            "descRaw": "",
            "bb": {},
            "bbStr": {}
          },
          "talents": [
            {
              "index": 0,
              "name": null,
              "desc": null,
              "descRaw": null,
              "bb": {
                "max_deck_stack_cnt": 1,
                "max_deploy_count": 1,
                "s3_max_deck_stack_cnt": 0,
                "s3_max_deploy_count": 0
              },
              "bbStr": {},
              "rangeGrid": null,
              "tokenKey": null,
              "hidden": true,
              "fromModule": false,
              "potMin": 2,
              "potBelow": {
                "bb": {
                  "max_deck_stack_cnt": 0,
                  "max_deploy_count": 0,
                  "s3_max_deck_stack_cnt": 0,
                  "s3_max_deploy_count": 0
                }
              }
            }
          ]
        }
      },
      "potDown": {
        "1": {
          "stats.deployLimit": 6,
          "stats.deckStack": 7,
          "count": 6,
          "bySkill.1.count": 6,
          "bySkill.2.count": 6,
          "byModule.uniequip_002_wang.stats.deployLimit": 7,
          "byModule.uniequip_002_wang.stats.deckStack": 7
        }
      }
    },
    "char_2027_wang@2/60/7/3": {
      "phase": 2,
      "level": 60,
      "stats": {
        "maxHp": 1000,
        "atk": 100,
        "def": 0,
        "res": 0,
        "cost": 3,
        "blockCnt": 0,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 2,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 7,
        "deckStack": 8
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          0,
          0
        ]
      ],
      "trait": {
        "desc": "",
        "descRaw": "",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "skill": {
        "skillId": "sktok_wang_1",
        "iconId": "sktok_wang_stone1",
        "name": "取势",
        "level": 7,
        "desc": "触发时使目标敌人停顿且每秒受到相当于望攻击力的120%的法术伤害，持续6.5秒",
        "descRaw": "触发时使目标敌人<$ba.sluggish>停顿</>且每秒受到相当于望攻击力的<@ba.vup>120%</>的法术伤害，持续<@ba.vup>6.5</>秒",
        "skillType": "AUTO",
        "durationType": "NONE",
        "duration": -1,
        "spType": "ON_DEPLOY",
        "spCost": 0,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk_scale": 1.2,
          "sluggish": 6.5
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "sktok_wang_1",
        "trigger": {
          "rule": "DEFAULT",
          "rawRule": "DEFAULT",
          "customRangeGrid": null
        },
        "index": 0
      },
      "talents": [
        {
          "index": 0,
          "name": null,
          "desc": null,
          "descRaw": null,
          "bb": {
            "max_deck_stack_cnt": 1,
            "max_deploy_count": 1,
            "s3_max_deck_stack_cnt": 0,
            "s3_max_deploy_count": 0
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": true,
          "fromModule": false,
          "potMin": 2,
          "potBelow": {
            "bb": {
              "max_deck_stack_cnt": 0,
              "max_deploy_count": 0,
              "s3_max_deck_stack_cnt": 0,
              "s3_max_deploy_count": 0
            }
          }
        }
      ],
      "count": 7,
      "sources": [
        "talent",
        "skill",
        "display"
      ],
      "bySkill": {
        "1": {
          "skill": {
            "skillId": "sktok_wang_2",
            "iconId": "sktok_wang_stone2",
            "name": "连星",
            "level": 7,
            "desc": "触发时对连线方向上两侧3格范围内的敌人造成相当于攻击力的480%的法术伤害，并使其6秒内移动速度降低40%",
            "descRaw": "触发时对连线方向上两侧3格范围内的敌人造成相当于攻击力的<@ba.vup>480%</>的法术伤害，并使其<@ba.vup>6</>秒内移动速度降低<@ba.vup>40%</>",
            "skillType": "AUTO",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {
              "atk_scale": 4.8,
              "move_speed": -0.4,
              "duration": 6,
              "tile_count": 6,
              "display_move_speed": 0.4
            },
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_wang_2",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 1
          },
          "count": 7,
          "sources": [
            "talent",
            "skill",
            "display"
          ]
        },
        "2": {
          "skill": {
            "skillId": "sktok_wang_3",
            "iconId": "sktok_wang_stone3",
            "name": "天下劫",
            "level": 7,
            "desc": "棋子的触发和伤害范围扩大，触发时造成相当于攻击力320%的法术伤害",
            "descRaw": "棋子的触发和伤害范围扩大，触发时造成相当于攻击力<@ba.vup>320%</>的法术伤害",
            "skillType": "AUTO",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 1,
            "increment": 1,
            "bb": {
              "atk_scale": 3.2
            },
            "bbStr": {},
            "rangeId": "x-6",
            "rangeGrid": [
              [
                2,
                0
              ],
              [
                1,
                0
              ],
              [
                0,
                -2
              ],
              [
                0,
                -1
              ],
              [
                0,
                0
              ],
              [
                0,
                1
              ],
              [
                0,
                2
              ],
              [
                -1,
                0
              ],
              [
                -2,
                0
              ]
            ],
            "prefabId": "sktok_wang_3",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 2
          },
          "count": 7,
          "sources": [
            "talent",
            "skill",
            "display"
          ]
        }
      },
      "byModule": {
        "uniequip_002_wang": {
          "stats": {
            "maxHp": 1000,
            "atk": 100,
            "def": 0,
            "res": 0,
            "cost": 2,
            "blockCnt": 0,
            "bat": 1,
            "aspd": 100,
            "respawnTime": 2,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 8,
            "deckStack": 8
          },
          "immunities": {
            "stun": false,
            "silence": false,
            "sleep": false,
            "frozen": false,
            "levitate": false
          },
          "trait": {
            "desc": "",
            "descRaw": "",
            "bb": {},
            "bbStr": {}
          },
          "talents": [
            {
              "index": 0,
              "name": null,
              "desc": null,
              "descRaw": null,
              "bb": {
                "max_deck_stack_cnt": 1,
                "max_deploy_count": 1,
                "s3_max_deck_stack_cnt": 0,
                "s3_max_deploy_count": 0
              },
              "bbStr": {},
              "rangeGrid": null,
              "tokenKey": null,
              "hidden": true,
              "fromModule": false,
              "potMin": 2,
              "potBelow": {
                "bb": {
                  "max_deck_stack_cnt": 0,
                  "max_deploy_count": 0,
                  "s3_max_deck_stack_cnt": 0,
                  "s3_max_deploy_count": 0
                }
              }
            }
          ]
        }
      },
      "potDown": {
        "1": {
          "stats.deployLimit": 6,
          "stats.deckStack": 7,
          "count": 6,
          "bySkill.1.count": 6,
          "bySkill.2.count": 6,
          "byModule.uniequip_002_wang.stats.deployLimit": 7,
          "byModule.uniequip_002_wang.stats.deckStack": 7
        }
      }
    }
  },
  "assets": {
    "avatar": "token_10064_wang_stone1",
    "spine": "token_10064_wang_stone1"
  }
}
```

### 新增：牵绊 · token_10065_demetr_dmtpos

炸惊：贝洛内技能结束时返回该位置，并且其他干员不能部署

```json
{
  "tokenId": "token_10065_demetr_dmtpos",
  "kind": "summon",
  "name": "牵绊",
  "appellation": "Bond",
  "desc": "贝洛内技能结束时返回该位置，并且其他干员不能部署",
  "descRaw": "贝洛内技能结束时返回该位置，并且其他干员不能部署",
  "profession": "TOKEN",
  "subProfessionId": "notchar1",
  "position": "MELEE",
  "displayType": "HIDDEN",
  "placeable": false,
  "ownerRange": false,
  "owners": [
    "chess_zj_76_a",
    "chess_zj_76_b"
  ],
  "stats": {
    "maxHp": 1000,
    "atk": 100,
    "def": 100,
    "res": 0,
    "cost": 0,
    "blockCnt": 0,
    "bat": 1,
    "aspd": 100,
    "respawnTime": 70,
    "spRecovery": 1,
    "hpRecoveryPerSec": 0,
    "moveSpeed": 1,
    "tauntLevel": 0,
    "massLevel": 0,
    "deployLimit": 1,
    "deckStack": 0
  },
  "rangeGrid": [
    [
      0,
      0
    ]
  ],
  "dmgType": "phys",
  "attackKind": "melee",
  "projectile": "none",
  "canHitFly": false,
  "skill": null,
  "deployLimit": 1,
  "count": null,
  "abnormal": [],
  "variants": {
    "chess_zj_76_a": {
      "phase": 2,
      "level": 1,
      "stats": {
        "maxHp": 1000,
        "atk": 100,
        "def": 100,
        "res": 0,
        "cost": 0,
        "blockCnt": 0,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 70,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          0,
          0
        ]
      ],
      "trait": {
        "desc": "贝洛内技能结束时返回该位置，并且其他干员不能部署",
        "descRaw": "贝洛内技能结束时返回该位置，并且其他干员不能部署",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "skill": null,
      "talents": [
        {
          "index": 0,
          "name": null,
          "desc": "-",
          "descRaw": "-",
          "bb": {},
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": true,
          "fromModule": false
        }
      ],
      "count": null,
      "sources": [],
      "bySkill": {
        "1": {
          "skill": null,
          "count": null,
          "sources": []
        },
        "2": {
          "skill": null,
          "count": null,
          "sources": [
            "skill"
          ]
        }
      }
    },
    "chess_zj_76_b": {
      "phase": 2,
      "level": 60,
      "stats": {
        "maxHp": 1000,
        "atk": 100,
        "def": 100,
        "res": 0,
        "cost": 0,
        "blockCnt": 0,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 70,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          0,
          0
        ]
      ],
      "trait": {
        "desc": "贝洛内技能结束时返回该位置，并且其他干员不能部署",
        "descRaw": "贝洛内技能结束时返回该位置，并且其他干员不能部署",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "skill": null,
      "talents": [
        {
          "index": 0,
          "name": null,
          "desc": "-",
          "descRaw": "-",
          "bb": {},
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": true,
          "fromModule": false
        }
      ],
      "count": null,
      "sources": [],
      "bySkill": {
        "1": {
          "skill": null,
          "count": null,
          "sources": []
        },
        "2": {
          "skill": null,
          "count": null,
          "sources": [
            "skill"
          ]
        }
      },
      "byModule": {
        "uniequip_002_demetr": {
          "stats": {
            "maxHp": 1000,
            "atk": 100,
            "def": 100,
            "res": 0,
            "cost": 0,
            "blockCnt": 0,
            "bat": 1,
            "aspd": 100,
            "respawnTime": 70,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 1,
            "deckStack": 0
          },
          "immunities": {
            "stun": false,
            "silence": false,
            "sleep": false,
            "frozen": false,
            "levitate": false
          },
          "trait": {
            "desc": "贝洛内技能结束时返回该位置，并且其他干员不能部署",
            "descRaw": "贝洛内技能结束时返回该位置，并且其他干员不能部署",
            "bb": {},
            "bbStr": {}
          },
          "talents": [
            {
              "index": 0,
              "name": null,
              "desc": "-",
              "descRaw": "-",
              "bb": {},
              "bbStr": {},
              "rangeGrid": null,
              "tokenKey": null,
              "hidden": true,
              "fromModule": false
            }
          ]
        }
      }
    },
    "char_4037_demetr@2/60/7/3": {
      "phase": 2,
      "level": 60,
      "stats": {
        "maxHp": 1000,
        "atk": 100,
        "def": 100,
        "res": 0,
        "cost": 0,
        "blockCnt": 0,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 70,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          0,
          0
        ]
      ],
      "trait": {
        "desc": "贝洛内技能结束时返回该位置，并且其他干员不能部署",
        "descRaw": "贝洛内技能结束时返回该位置，并且其他干员不能部署",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "skill": null,
      "talents": [
        {
          "index": 0,
          "name": null,
          "desc": "-",
          "descRaw": "-",
          "bb": {},
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": true,
          "fromModule": false
        }
      ],
      "count": null,
      "sources": [],
      "bySkill": {
        "1": {
          "skill": null,
          "count": null,
          "sources": []
        },
        "2": {
          "skill": null,
          "count": null,
          "sources": [
            "skill"
          ]
        }
      },
      "byModule": {
        "uniequip_002_demetr": {
          "stats": {
            "maxHp": 1000,
            "atk": 100,
            "def": 100,
            "res": 0,
            "cost": 0,
            "blockCnt": 0,
            "bat": 1,
            "aspd": 100,
            "respawnTime": 70,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 1,
            "deckStack": 0
          },
          "immunities": {
            "stun": false,
            "silence": false,
            "sleep": false,
            "frozen": false,
            "levitate": false
          },
          "trait": {
            "desc": "贝洛内技能结束时返回该位置，并且其他干员不能部署",
            "descRaw": "贝洛内技能结束时返回该位置，并且其他干员不能部署",
            "bb": {},
            "bbStr": {}
          },
          "talents": [
            {
              "index": 0,
              "name": null,
              "desc": "-",
              "descRaw": "-",
              "bb": {},
              "bbStr": {},
              "rangeGrid": null,
              "tokenKey": null,
              "hidden": true,
              "fromModule": false
            }
          ]
        }
      }
    }
  },
  "assets": {
    "avatar": "token_10065_demetr_dmtpos",
    "spine": "token_10065_demetr_dmtpos"
  }
}
```

### 新增：结构性原理 · token_10069_mcnist_mcgraf

炸惊：能够阻挡三个敌人

```json
{
  "tokenId": "token_10069_mcnist_mcgraf",
  "kind": "summon",
  "name": "结构性原理",
  "appellation": "Structural Principle",
  "desc": "能够阻挡三个敌人",
  "descRaw": "能够阻挡三个敌人",
  "profession": "TOKEN",
  "subProfessionId": "notchar1",
  "position": "MELEE",
  "displayType": null,
  "placeable": true,
  "ownerRange": false,
  "owners": [
    "char_4230_mcnist@2/1/4/0",
    "char_4230_mcnist@2/60/7/1",
    "char_4230_mcnist@2/60/7/3"
  ],
  "stats": {
    "maxHp": 2800,
    "atk": 492,
    "def": 451,
    "res": 0,
    "cost": 10,
    "blockCnt": 3,
    "bat": 1.5,
    "aspd": 100,
    "respawnTime": 40,
    "spRecovery": 1,
    "hpRecoveryPerSec": 0,
    "moveSpeed": 1,
    "tauntLevel": 0,
    "massLevel": 0,
    "deployLimit": 1,
    "deckStack": 0
  },
  "rangeGrid": [
    [
      0,
      0
    ]
  ],
  "dmgType": "phys",
  "attackKind": "melee",
  "projectile": "none",
  "canHitFly": false,
  "skill": {
    "skillId": "sktok_mcgraf_1",
    "bb": {}
  },
  "deployLimit": 1,
  "count": null,
  "abnormal": [],
  "variants": {
    "char_4230_mcnist@2/1/4/0": {
      "phase": 2,
      "level": 1,
      "stats": {
        "maxHp": 2800,
        "atk": 492,
        "def": 451,
        "res": 0,
        "cost": 10,
        "blockCnt": 3,
        "bat": 1.5,
        "aspd": 100,
        "respawnTime": 40,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          0,
          0
        ]
      ],
      "trait": {
        "desc": "能够阻挡三个敌人",
        "descRaw": "能够阻挡三个敌人",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "skill": {
        "skillId": "sktok_mcgraf_1",
        "iconId": "sktok_mcgraf_1",
        "name": "结构性原理",
        "level": 1,
        "desc": null,
        "descRaw": null,
        "skillType": "PASSIVE",
        "durationType": "NONE",
        "duration": 0,
        "spType": "ON_DEPLOY",
        "spCost": 0,
        "initSp": 0,
        "maxChargeTime": 0,
        "increment": 0,
        "bb": {},
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "sktok_mcgraf",
        "trigger": {
          "rule": "DEFAULT",
          "rawRule": "DEFAULT",
          "customRangeGrid": null
        },
        "index": 0
      },
      "talents": [
        {
          "index": 0,
          "name": "结构性原理",
          "desc": "部署后持续30秒",
          "descRaw": "部署后持续30秒",
          "bb": {
            "skill@duration": 30
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "生命方程",
          "desc": "部署时获得最大生命40%（+10%）的屏障；来自自身的屏障可以抵挡超额的伤害",
          "descRaw": "部署时获得最大生命40%<@ba.talpu>（+10%）</>的<$ba.barrier>屏障</>；来自自身的<$ba.barrier>屏障</>可以抵挡超额的伤害",
          "bb": {
            "hp_ratio": 0.4
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false,
          "potMin": 4,
          "potBelow": {
            "desc": "部署时获得最大生命30%的屏障；来自自身的屏障可以抵挡超额的伤害",
            "descRaw": "部署时获得最大生命30%的<$ba.barrier>屏障</>；来自自身的<$ba.barrier>屏障</>可以抵挡超额的伤害",
            "bb": {
              "hp_ratio": 0.3
            }
          }
        },
        {
          "index": 2,
          "name": null,
          "desc": null,
          "descRaw": null,
          "bb": {
            "atk": -0.5,
            "range_radius": 1.5,
            "interval": 1,
            "atk_interval": 0.025,
            "atk_min": 0
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": true,
          "fromModule": false
        }
      ],
      "count": null,
      "sources": [
        "talent",
        "display"
      ],
      "bySkill": {
        "1": {
          "skill": {
            "skillId": "sktok_mcgraf_2",
            "iconId": "sktok_mcgraf_2",
            "name": "结构性原理",
            "level": 1,
            "desc": null,
            "descRaw": null,
            "skillType": "PASSIVE",
            "durationType": "NONE",
            "duration": 0,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 0,
            "increment": 0,
            "bb": {},
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_mcgraf",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 1
          },
          "count": null,
          "sources": [
            "talent",
            "display"
          ]
        },
        "2": {
          "skill": {
            "skillId": "sktok_mcgraf_3",
            "iconId": "sktok_mcnist_mcgraf",
            "name": "工程学十字星",
            "level": 4,
            "desc": "向前方冲锋，碰到敌人或高台时对范围内所有敌人造成机械师攻击力300%的物理伤害并停下，周围的敌人获得逐渐衰减的50%的虚弱效果",
            "descRaw": "向前方冲锋，碰到敌人或高台时对范围内所有敌人造成机械师攻击力<@ba.vup>300%</>的物理伤害并停下，周围的敌人获得逐渐衰减的50%的<$ba.weaken>虚弱</>效果",
            "skillType": "PASSIVE",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 0,
            "increment": 0,
            "bb": {
              "atk_scale": 3
            },
            "bbStr": {},
            "rangeId": "4-1",
            "rangeGrid": [
              [
                0,
                0
              ],
              [
                0,
                1
              ],
              [
                0,
                2
              ],
              [
                0,
                3
              ],
              [
                0,
                4
              ]
            ],
            "prefabId": "sktok_mcgraf",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 2
          },
          "count": null,
          "sources": [
            "talent",
            "display"
          ]
        }
      }
    },
    "char_4230_mcnist@2/60/7/1": {
      "phase": 2,
      "level": 60,
      "stats": {
        "maxHp": 3264,
        "atk": 564,
        "def": 517,
        "res": 0,
        "cost": 10,
        "blockCnt": 3,
        "bat": 1.5,
        "aspd": 100,
        "respawnTime": 40,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          0,
          0
        ]
      ],
      "trait": {
        "desc": "能够阻挡三个敌人",
        "descRaw": "能够阻挡三个敌人",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "skill": {
        "skillId": "sktok_mcgraf_1",
        "iconId": "sktok_mcgraf_1",
        "name": "结构性原理",
        "level": 1,
        "desc": null,
        "descRaw": null,
        "skillType": "PASSIVE",
        "durationType": "NONE",
        "duration": 0,
        "spType": "ON_DEPLOY",
        "spCost": 0,
        "initSp": 0,
        "maxChargeTime": 0,
        "increment": 0,
        "bb": {},
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "sktok_mcgraf",
        "trigger": {
          "rule": "DEFAULT",
          "rawRule": "DEFAULT",
          "customRangeGrid": null
        },
        "index": 0
      },
      "talents": [
        {
          "index": 0,
          "name": "结构性原理",
          "desc": "部署后持续30秒",
          "descRaw": "部署后持续30秒",
          "bb": {
            "skill@duration": 30
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "生命方程",
          "desc": "部署时获得最大生命40%（+10%）的屏障；来自自身的屏障可以抵挡超额的伤害",
          "descRaw": "部署时获得最大生命40%<@ba.talpu>（+10%）</>的<$ba.barrier>屏障</>；来自自身的<$ba.barrier>屏障</>可以抵挡超额的伤害",
          "bb": {
            "hp_ratio": 0.4
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false,
          "potMin": 4,
          "potBelow": {
            "desc": "部署时获得最大生命30%的屏障；来自自身的屏障可以抵挡超额的伤害",
            "descRaw": "部署时获得最大生命30%的<$ba.barrier>屏障</>；来自自身的<$ba.barrier>屏障</>可以抵挡超额的伤害",
            "bb": {
              "hp_ratio": 0.3
            }
          }
        },
        {
          "index": 2,
          "name": null,
          "desc": null,
          "descRaw": null,
          "bb": {
            "atk": -0.5,
            "range_radius": 1.5,
            "interval": 1,
            "atk_interval": 0.025,
            "atk_min": 0
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": true,
          "fromModule": false
        }
      ],
      "count": null,
      "sources": [
        "talent",
        "display"
      ],
      "bySkill": {
        "1": {
          "skill": {
            "skillId": "sktok_mcgraf_2",
            "iconId": "sktok_mcgraf_2",
            "name": "结构性原理",
            "level": 1,
            "desc": null,
            "descRaw": null,
            "skillType": "PASSIVE",
            "durationType": "NONE",
            "duration": 0,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 0,
            "increment": 0,
            "bb": {},
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_mcgraf",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 1
          },
          "count": null,
          "sources": [
            "talent",
            "display"
          ]
        },
        "2": {
          "skill": {
            "skillId": "sktok_mcgraf_3",
            "iconId": "sktok_mcnist_mcgraf",
            "name": "工程学十字星",
            "level": 7,
            "desc": "向前方冲锋，碰到敌人或高台时对范围内所有敌人造成机械师攻击力300%的物理伤害并停下，周围的敌人获得逐渐衰减的50%的虚弱效果",
            "descRaw": "向前方冲锋，碰到敌人或高台时对范围内所有敌人造成机械师攻击力<@ba.vup>300%</>的物理伤害并停下，周围的敌人获得逐渐衰减的50%的<$ba.weaken>虚弱</>效果",
            "skillType": "PASSIVE",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 0,
            "increment": 0,
            "bb": {
              "atk_scale": 3
            },
            "bbStr": {},
            "rangeId": "4-1",
            "rangeGrid": [
              [
                0,
                0
              ],
              [
                0,
                1
              ],
              [
                0,
                2
              ],
              [
                0,
                3
              ],
              [
                0,
                4
              ]
            ],
            "prefabId": "sktok_mcgraf",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 2
          },
          "count": null,
          "sources": [
            "talent",
            "display"
          ]
        }
      },
      "byModule": {
        "uniequip_002_mcnist": {
          "stats": {
            "maxHp": 3264,
            "atk": 564,
            "def": 517,
            "res": 0,
            "cost": 10,
            "blockCnt": 3,
            "bat": 1.5,
            "aspd": 100,
            "respawnTime": 40,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 1,
            "deckStack": 0
          },
          "immunities": {
            "stun": false,
            "silence": false,
            "sleep": false,
            "frozen": false,
            "levitate": false
          },
          "trait": {
            "desc": "能够阻挡三个敌人",
            "descRaw": "能够阻挡三个敌人",
            "bb": {},
            "bbStr": {}
          },
          "talents": [
            {
              "index": 0,
              "name": "结构性原理",
              "desc": "部署后持续30秒",
              "descRaw": "部署后持续30秒",
              "bb": {
                "skill@duration": 30
              },
              "bbStr": {},
              "rangeGrid": null,
              "tokenKey": null,
              "hidden": false,
              "fromModule": false
            },
            {
              "index": 1,
              "name": "生命方程",
              "desc": "部署时获得最大生命40%（+10%）的屏障；来自自身的屏障可以抵挡超额的伤害",
              "descRaw": "部署时获得最大生命40%<@ba.talpu>（+10%）</>的<$ba.barrier>屏障</>；来自自身的<$ba.barrier>屏障</>可以抵挡超额的伤害",
              "bb": {
                "hp_ratio": 0.4
              },
              "bbStr": {},
              "rangeGrid": null,
              "tokenKey": null,
              "hidden": false,
              "fromModule": false,
              "potMin": 4,
              "potBelow": {
                "desc": "部署时获得最大生命30%的屏障；来自自身的屏障可以抵挡超额的伤害",
                "descRaw": "部署时获得最大生命30%的<$ba.barrier>屏障</>；来自自身的<$ba.barrier>屏障</>可以抵挡超额的伤害",
                "bb": {
                  "hp_ratio": 0.3
                }
              }
            },
            {
              "index": 2,
              "name": null,
              "desc": null,
              "descRaw": null,
              "bb": {
                "atk": -0.5,
                "range_radius": 1.5,
                "interval": 1,
                "atk_interval": 0.025,
                "atk_min": 0
              },
              "bbStr": {},
              "rangeGrid": null,
              "tokenKey": null,
              "hidden": true,
              "fromModule": false
            }
          ]
        }
      }
    },
    "char_4230_mcnist@2/60/7/3": {
      "phase": 2,
      "level": 60,
      "stats": {
        "maxHp": 3264,
        "atk": 564,
        "def": 517,
        "res": 0,
        "cost": 10,
        "blockCnt": 3,
        "bat": 1.5,
        "aspd": 100,
        "respawnTime": 40,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "rangeGrid": [
        [
          0,
          0
        ]
      ],
      "trait": {
        "desc": "能够阻挡三个敌人",
        "descRaw": "能够阻挡三个敌人",
        "bb": {},
        "bbStr": {}
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "skill": {
        "skillId": "sktok_mcgraf_1",
        "iconId": "sktok_mcgraf_1",
        "name": "结构性原理",
        "level": 1,
        "desc": null,
        "descRaw": null,
        "skillType": "PASSIVE",
        "durationType": "NONE",
        "duration": 0,
        "spType": "ON_DEPLOY",
        "spCost": 0,
        "initSp": 0,
        "maxChargeTime": 0,
        "increment": 0,
        "bb": {},
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "sktok_mcgraf",
        "trigger": {
          "rule": "DEFAULT",
          "rawRule": "DEFAULT",
          "customRangeGrid": null
        },
        "index": 0
      },
      "talents": [
        {
          "index": 0,
          "name": "结构性原理",
          "desc": "部署后持续30秒",
          "descRaw": "部署后持续30秒",
          "bb": {
            "skill@duration": 30
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "生命方程",
          "desc": "部署时获得最大生命40%（+10%）的屏障；来自自身的屏障可以抵挡超额的伤害",
          "descRaw": "部署时获得最大生命40%<@ba.talpu>（+10%）</>的<$ba.barrier>屏障</>；来自自身的<$ba.barrier>屏障</>可以抵挡超额的伤害",
          "bb": {
            "hp_ratio": 0.4
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false,
          "potMin": 4,
          "potBelow": {
            "desc": "部署时获得最大生命30%的屏障；来自自身的屏障可以抵挡超额的伤害",
            "descRaw": "部署时获得最大生命30%的<$ba.barrier>屏障</>；来自自身的<$ba.barrier>屏障</>可以抵挡超额的伤害",
            "bb": {
              "hp_ratio": 0.3
            }
          }
        },
        {
          "index": 2,
          "name": null,
          "desc": null,
          "descRaw": null,
          "bb": {
            "atk": -0.5,
            "range_radius": 1.5,
            "interval": 1,
            "atk_interval": 0.025,
            "atk_min": 0
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": true,
          "fromModule": false
        }
      ],
      "count": null,
      "sources": [
        "talent",
        "display"
      ],
      "bySkill": {
        "1": {
          "skill": {
            "skillId": "sktok_mcgraf_2",
            "iconId": "sktok_mcgraf_2",
            "name": "结构性原理",
            "level": 1,
            "desc": null,
            "descRaw": null,
            "skillType": "PASSIVE",
            "durationType": "NONE",
            "duration": 0,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 0,
            "increment": 0,
            "bb": {},
            "bbStr": {},
            "rangeId": null,
            "rangeGrid": null,
            "prefabId": "sktok_mcgraf",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 1
          },
          "count": null,
          "sources": [
            "talent",
            "display"
          ]
        },
        "2": {
          "skill": {
            "skillId": "sktok_mcgraf_3",
            "iconId": "sktok_mcnist_mcgraf",
            "name": "工程学十字星",
            "level": 7,
            "desc": "向前方冲锋，碰到敌人或高台时对范围内所有敌人造成机械师攻击力300%的物理伤害并停下，周围的敌人获得逐渐衰减的50%的虚弱效果",
            "descRaw": "向前方冲锋，碰到敌人或高台时对范围内所有敌人造成机械师攻击力<@ba.vup>300%</>的物理伤害并停下，周围的敌人获得逐渐衰减的50%的<$ba.weaken>虚弱</>效果",
            "skillType": "PASSIVE",
            "durationType": "NONE",
            "duration": -1,
            "spType": "ON_DEPLOY",
            "spCost": 0,
            "initSp": 0,
            "maxChargeTime": 0,
            "increment": 0,
            "bb": {
              "atk_scale": 3
            },
            "bbStr": {},
            "rangeId": "4-1",
            "rangeGrid": [
              [
                0,
                0
              ],
              [
                0,
                1
              ],
              [
                0,
                2
              ],
              [
                0,
                3
              ],
              [
                0,
                4
              ]
            ],
            "prefabId": "sktok_mcgraf",
            "trigger": {
              "rule": "DEFAULT",
              "rawRule": "DEFAULT",
              "customRangeGrid": null
            },
            "index": 2
          },
          "count": null,
          "sources": [
            "talent",
            "display"
          ]
        }
      },
      "byModule": {
        "uniequip_002_mcnist": {
          "stats": {
            "maxHp": 3264,
            "atk": 564,
            "def": 517,
            "res": 0,
            "cost": 10,
            "blockCnt": 3,
            "bat": 1.5,
            "aspd": 100,
            "respawnTime": 40,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 1,
            "deckStack": 0
          },
          "immunities": {
            "stun": false,
            "silence": false,
            "sleep": false,
            "frozen": false,
            "levitate": false
          },
          "trait": {
            "desc": "能够阻挡三个敌人",
            "descRaw": "能够阻挡三个敌人",
            "bb": {},
            "bbStr": {}
          },
          "talents": [
            {
              "index": 0,
              "name": "结构性原理",
              "desc": "持续时间无限",
              "descRaw": "持续时间无限",
              "bb": {
                "skill@duration": -1
              },
              "bbStr": {},
              "rangeGrid": null,
              "tokenKey": null,
              "hidden": false,
              "fromModule": true
            },
            {
              "index": 1,
              "name": "生命方程",
              "desc": "部署时获得最大生命40%（+10%）的屏障；来自自身的屏障可以抵挡超额的伤害",
              "descRaw": "部署时获得最大生命40%<@ba.talpu>（+10%）</>的<$ba.barrier>屏障</>；来自自身的<$ba.barrier>屏障</>可以抵挡超额的伤害",
              "bb": {
                "hp_ratio": 0.4
              },
              "bbStr": {},
              "rangeGrid": null,
              "tokenKey": null,
              "hidden": false,
              "fromModule": false,
              "potMin": 4,
              "potBelow": {
                "desc": "部署时获得最大生命30%的屏障；来自自身的屏障可以抵挡超额的伤害",
                "descRaw": "部署时获得最大生命30%的<$ba.barrier>屏障</>；来自自身的<$ba.barrier>屏障</>可以抵挡超额的伤害",
                "bb": {
                  "hp_ratio": 0.3
                }
              }
            },
            {
              "index": 2,
              "name": null,
              "desc": null,
              "descRaw": null,
              "bb": {
                "atk": -0.5,
                "range_radius": 1.5,
                "interval": 1,
                "atk_interval": 0.025,
                "atk_min": 0
              },
              "bbStr": {},
              "rangeGrid": null,
              "tokenKey": null,
              "hidden": true,
              "fromModule": false
            },
            {
              "index": -2,
              "name": null,
              "desc": null,
              "descRaw": null,
              "bb": {
                "interval": 1,
                "cooldown": 5,
                "hp_ratio": 0.04,
                "hp_ratio_max": 0.2
              },
              "bbStr": {},
              "rangeGrid": null,
              "tokenKey": null,
              "hidden": true,
              "fromModule": true
            }
          ]
        }
      }
    }
  },
  "assets": {
    "avatar": "token_10069_mcnist_mcgraf",
    "spine": "token_10069_mcnist_mcgraf"
  }
}
```

### 新增：白铁™多功能平台 · token_10027_ironmn_pile1

炸惊：不会受到攻击

```json
{
  "tokenId": "token_10027_ironmn_pile1",
  "kind": "summon",
  "name": "白铁™多功能平台",
  "appellation": "Stainless™ Multifunctional platform",
  "desc": "不会受到攻击",
  "descRaw": "不会受到攻击",
  "profession": "TOKEN",
  "subProfessionId": "notchar1",
  "position": "ALL",
  "displayType": "DEFAULT",
  "placeable": true,
  "ownerRange": false,
  "owners": [
    "chess_zj_ironmn_a",
    "chess_zj_ironmn_b"
  ],
  "stats": {
    "maxHp": 100,
    "atk": 0,
    "def": 0,
    "res": 0,
    "cost": 3,
    "blockCnt": 0,
    "bat": 1,
    "aspd": 100,
    "respawnTime": 10,
    "spRecovery": 1,
    "hpRecoveryPerSec": 0,
    "moveSpeed": 1,
    "tauntLevel": 0,
    "massLevel": 0,
    "deployLimit": 2,
    "deckStack": 3
  },
  "rangeGrid": [
    [
      0,
      0
    ],
    [
      0,
      1
    ]
  ],
  "dmgType": "phys",
  "attackKind": "ranged",
  "projectile": "arrow",
  "canHitFly": true,
  "skill": {
    "skillId": "sktok_ironmn_pile1",
    "bb": {
      "talent_scale": 2.5
    }
  },
  "deployLimit": 2,
  "count": null,
  "abnormal": [],
  "assets": {
    "avatar": "token_10027_ironmn_pile1",
    "spine": "token_10027_ironmn_pile1"
  }
}
```

### 新增：白铁™多功能平台 · token_10027_ironmn_pile2

炸惊：不会受到攻击

```json
{
  "tokenId": "token_10027_ironmn_pile2",
  "kind": "summon",
  "name": "白铁™多功能平台",
  "appellation": "Stainless™ Multifunctional platform",
  "desc": "不会受到攻击",
  "descRaw": "不会受到攻击",
  "profession": "TOKEN",
  "subProfessionId": "notchar1",
  "position": "ALL",
  "displayType": "DEFAULT",
  "placeable": true,
  "ownerRange": false,
  "owners": [
    "chess_zj_ironmn_a",
    "chess_zj_ironmn_b"
  ],
  "stats": {
    "maxHp": 2000,
    "atk": 0,
    "def": 0,
    "res": 0,
    "cost": 3,
    "blockCnt": 0,
    "bat": 1,
    "aspd": 100,
    "respawnTime": 10,
    "spRecovery": 1,
    "hpRecoveryPerSec": 0,
    "moveSpeed": 1,
    "tauntLevel": 0,
    "massLevel": 0,
    "deployLimit": 2,
    "deckStack": 3
  },
  "rangeGrid": [
    [
      0,
      0
    ],
    [
      0,
      1
    ]
  ],
  "dmgType": "phys",
  "attackKind": "ranged",
  "projectile": "arrow",
  "canHitFly": true,
  "skill": {
    "skillId": "sktok_ironmn_pile2",
    "bb": {
      "s2.interval": 2.5,
      "s2.hp_ratio": 0.008
    }
  },
  "deployLimit": 2,
  "count": null,
  "abnormal": [],
  "assets": {
    "avatar": "token_10027_ironmn_pile2",
    "spine": "token_10027_ironmn_pile2"
  }
}
```

### 新增：铁钳号·原型机 · token_10027_ironmn_pile3

炸惊：可被我方干员攻击但不受伤害，受到工匠干员攻击时回复生命

```json
{
  "tokenId": "token_10027_ironmn_pile3",
  "kind": "summon",
  "name": "铁钳号·原型机",
  "appellation": "Prototype of Feist's Metal Crab",
  "desc": "可被我方干员攻击但不受伤害，受到工匠干员攻击时回复生命",
  "descRaw": "可被我方干员攻击但不受伤害，受到工匠干员攻击时回复生命",
  "profession": "TOKEN",
  "subProfessionId": "notchar1",
  "position": "MELEE",
  "displayType": "DEFAULT",
  "placeable": true,
  "ownerRange": false,
  "owners": [
    "chess_zj_ironmn_a",
    "chess_zj_ironmn_b"
  ],
  "stats": {
    "maxHp": 6000,
    "atk": 100,
    "def": 2000,
    "res": 0,
    "cost": 10,
    "blockCnt": 0,
    "bat": 1,
    "aspd": 100,
    "respawnTime": 20,
    "spRecovery": 1,
    "hpRecoveryPerSec": 0,
    "moveSpeed": 1,
    "tauntLevel": -2,
    "massLevel": 0,
    "deployLimit": 2,
    "deckStack": 3
  },
  "rangeGrid": [
    [
      1,
      1
    ],
    [
      1,
      2
    ],
    [
      0,
      0
    ],
    [
      0,
      1
    ],
    [
      0,
      2
    ],
    [
      0,
      3
    ],
    [
      -1,
      1
    ],
    [
      -1,
      2
    ]
  ],
  "dmgType": "phys",
  "attackKind": "melee",
  "projectile": "none",
  "canHitFly": false,
  "skill": {
    "skillId": "sktok_ironmn_pile3",
    "bb": {
      "atk_scale": 2.3,
      "atk_scale_2": 1.1,
      "hp_ratio": 0.025
    }
  },
  "deployLimit": 2,
  "count": null,
  "abnormal": [],
  "assets": {
    "avatar": "token_10027_ironmn_pile3",
    "spine": "token_10027_ironmn_pile3"
  }
}
```

## waves

新增 0，删除 0，修改 0。

## stages

新增 2，删除 0，修改 0。

### 新增：联防阵地（1名玩家） · act1autochess_escaped_single

炸惊：（结构或参数变化；见下列完整记录）

```json
{
  "id": "act1autochess_escaped_single",
  "name": "联防阵地（1名玩家）",
  "weight": 0,
  "active": false,
  "kind": "unite",
  "helpers": 1,
  "modes": [],
  "size": [
    19,
    21
  ],
  "rows": [
    "#####################",
    "###I#############I###",
    "##ErrrrrrrSrrrrrrrE##",
    "###rrrrrrfffrrrrrr###",
    "###rrrrrrfffrrrrrr###",
    "###rrrrrrfOfrrrrrr###",
    "#####################",
    "#####################",
    "###########I#########",
    "##ErrrrrrrSrrrrrrrS##",
    "###rrrrrrr#rrrrrrr###",
    "###rrrrrrr#rrrrrrr###",
    "###rrrrrrrSrrrrrrrS##",
    "#####################",
    "#####################",
    "#####################",
    "#####################",
    "#####################",
    "#####################"
  ],
  "tiles": {
    "#": {
      "tileKey": "tile_forbidden",
      "height": "HIGH",
      "buildable": "NONE",
      "passable": "FLY_ONLY",
      "groundPassable": false,
      "flyPassable": true,
      "special": null,
      "bb": {}
    },
    "I": {
      "tileKey": "tile_telin",
      "height": "LOW",
      "buildable": "NONE",
      "passable": "ALL",
      "groundPassable": true,
      "flyPassable": true,
      "special": null,
      "bb": {}
    },
    "E": {
      "tileKey": "tile_end",
      "height": "LOW",
      "buildable": "NONE",
      "passable": "ALL",
      "groundPassable": true,
      "flyPassable": true,
      "special": null,
      "bb": {}
    },
    "r": {
      "tileKey": "tile_road",
      "height": "LOW",
      "buildable": "MELEE",
      "passable": "ALL",
      "groundPassable": true,
      "flyPassable": true,
      "special": null,
      "bb": {}
    },
    "S": {
      "tileKey": "tile_start",
      "height": "LOW",
      "buildable": "NONE",
      "passable": "ALL",
      "groundPassable": true,
      "flyPassable": true,
      "special": null,
      "bb": {}
    },
    "f": {
      "tileKey": "tile_floor",
      "height": "LOW",
      "buildable": "NONE",
      "passable": "ALL",
      "groundPassable": true,
      "flyPassable": true,
      "special": null,
      "bb": {}
    },
    "O": {
      "tileKey": "tile_telout",
      "height": "LOW",
      "buildable": "NONE",
      "passable": "ALL",
      "groundPassable": true,
      "flyPassable": true,
      "special": null,
      "bb": {}
    }
  },
  "devices": [],
  "mapChars": [],
  "special": {},
  "runes": [],
  "globalBuffs": [],
  "deployTiles": {
    "normal": {
      "melee": [
        [
          9,
          3
        ],
        [
          9,
          4
        ],
        [
          9,
          5
        ],
        [
          9,
          6
        ],
        [
          9,
          7
        ],
        [
          9,
          8
        ],
        [
          9,
          9
        ],
        [
          10,
          3
        ],
        [
          10,
          4
        ],
        [
          10,
          5
        ],
        [
          10,
          6
        ],
        [
          10,
          7
        ],
        [
          10,
          8
        ],
        [
          10,
          9
        ],
        [
          11,
          3
        ],
        [
          11,
          4
        ],
        [
          11,
          5
        ],
        [
          11,
          6
        ],
        [
          11,
          7
        ],
        [
          11,
          8
        ],
        [
          11,
          9
        ],
        [
          12,
          3
        ],
        [
          12,
          4
        ],
        [
          12,
          5
        ],
        [
          12,
          6
        ],
        [
          12,
          7
        ],
        [
          12,
          8
        ],
        [
          12,
          9
        ]
      ],
      "rangedOnly": [],
      "changedByDevices": []
    },
    "bossLeft": {
      "melee": [
        [
          2,
          3
        ],
        [
          2,
          4
        ],
        [
          2,
          5
        ],
        [
          2,
          6
        ],
        [
          2,
          7
        ],
        [
          2,
          8
        ],
        [
          2,
          9
        ],
        [
          3,
          3
        ],
        [
          3,
          4
        ],
        [
          3,
          5
        ],
        [
          3,
          6
        ],
        [
          3,
          7
        ],
        [
          3,
          8
        ],
        [
          4,
          3
        ],
        [
          4,
          4
        ],
        [
          4,
          5
        ],
        [
          4,
          6
        ],
        [
          4,
          7
        ],
        [
          4,
          8
        ],
        [
          5,
          3
        ],
        [
          5,
          4
        ],
        [
          5,
          5
        ],
        [
          5,
          6
        ],
        [
          5,
          7
        ],
        [
          5,
          8
        ]
      ],
      "rangedOnly": [],
      "changedByDevices": []
    },
    "bossRight": {
      "melee": [
        [
          2,
          11
        ],
        [
          2,
          12
        ],
        [
          2,
          13
        ],
        [
          2,
          14
        ],
        [
          2,
          15
        ],
        [
          2,
          16
        ],
        [
          2,
          17
        ],
        [
          3,
          12
        ],
        [
          3,
          13
        ],
        [
          3,
          14
        ],
        [
          3,
          15
        ],
        [
          3,
          16
        ],
        [
          3,
          17
        ],
        [
          4,
          12
        ],
        [
          4,
          13
        ],
        [
          4,
          14
        ],
        [
          4,
          15
        ],
        [
          4,
          16
        ],
        [
          4,
          17
        ],
        [
          5,
          12
        ],
        [
          5,
          13
        ],
        [
          5,
          14
        ],
        [
          5,
          15
        ],
        [
          5,
          16
        ],
        [
          5,
          17
        ]
      ],
      "rangedOnly": [],
      "changedByDevices": []
    }
  },
  "groundPaths": {
    "9,10->9,2": [
      [
        9,
        10
      ],
      [
        9,
        9
      ],
      [
        9,
        8
      ],
      [
        9,
        7
      ],
      [
        9,
        6
      ],
      [
        9,
        5
      ],
      [
        9,
        4
      ],
      [
        9,
        3
      ],
      [
        9,
        2
      ]
    ],
    "12,10->9,2": [
      [
        12,
        10
      ],
      [
        12,
        9
      ],
      [
        11,
        8
      ],
      [
        11,
        7
      ],
      [
        11,
        6
      ],
      [
        10,
        5
      ],
      [
        10,
        4
      ],
      [
        9,
        3
      ],
      [
        9,
        2
      ]
    ],
    "9,18->9,2": [
      [
        9,
        18
      ],
      [
        9,
        17
      ],
      [
        9,
        16
      ],
      [
        9,
        15
      ],
      [
        9,
        14
      ],
      [
        9,
        13
      ],
      [
        9,
        12
      ],
      [
        9,
        11
      ],
      [
        9,
        10
      ],
      [
        9,
        9
      ],
      [
        9,
        8
      ],
      [
        9,
        7
      ],
      [
        9,
        6
      ],
      [
        9,
        5
      ],
      [
        9,
        4
      ],
      [
        9,
        3
      ],
      [
        9,
        2
      ]
    ],
    "12,18->9,2": [
      [
        12,
        18
      ],
      [
        12,
        17
      ],
      [
        12,
        16
      ],
      [
        12,
        15
      ],
      [
        12,
        14
      ],
      [
        12,
        13
      ],
      [
        12,
        12
      ],
      [
        12,
        11
      ],
      [
        12,
        10
      ],
      [
        12,
        9
      ],
      [
        11,
        8
      ],
      [
        11,
        7
      ],
      [
        11,
        6
      ],
      [
        10,
        5
      ],
      [
        10,
        4
      ],
      [
        9,
        3
      ],
      [
        9,
        2
      ]
    ],
    "2,10->2,2": [
      [
        2,
        10
      ],
      [
        2,
        9
      ],
      [
        2,
        8
      ],
      [
        2,
        7
      ],
      [
        2,
        6
      ],
      [
        2,
        5
      ],
      [
        2,
        4
      ],
      [
        2,
        3
      ],
      [
        2,
        2
      ]
    ],
    "5,10->2,2": [
      [
        5,
        10
      ],
      [
        5,
        9
      ],
      [
        5,
        8
      ],
      [
        4,
        7
      ],
      [
        4,
        6
      ],
      [
        3,
        5
      ],
      [
        3,
        4
      ],
      [
        2,
        3
      ],
      [
        2,
        2
      ]
    ],
    "2,10->1,3": [
      [
        2,
        10
      ],
      [
        2,
        9
      ],
      [
        2,
        8
      ],
      [
        2,
        7
      ],
      [
        2,
        6
      ],
      [
        2,
        5
      ],
      [
        2,
        4
      ],
      [
        2,
        3
      ],
      [
        1,
        3
      ]
    ],
    "5,10->1,3": [
      [
        5,
        10
      ],
      [
        5,
        9
      ],
      [
        5,
        8
      ],
      [
        5,
        7
      ],
      [
        5,
        6
      ],
      [
        5,
        5
      ],
      [
        5,
        4
      ],
      [
        4,
        4
      ],
      [
        3,
        4
      ],
      [
        2,
        3
      ],
      [
        1,
        3
      ]
    ],
    "2,10->2,18": [
      [
        2,
        10
      ],
      [
        2,
        11
      ],
      [
        2,
        12
      ],
      [
        2,
        13
      ],
      [
        2,
        14
      ],
      [
        2,
        15
      ],
      [
        2,
        16
      ],
      [
        2,
        17
      ],
      [
        2,
        18
      ]
    ],
    "5,10->2,18": [
      [
        5,
        10
      ],
      [
        5,
        11
      ],
      [
        5,
        12
      ],
      [
        5,
        13
      ],
      [
        4,
        14
      ],
      [
        4,
        15
      ],
      [
        4,
        16
      ],
      [
        4,
        17
      ],
      [
        3,
        17
      ],
      [
        2,
        17
      ],
      [
        2,
        18
      ]
    ],
    "2,10->1,17": [
      [
        2,
        10
      ],
      [
        2,
        11
      ],
      [
        2,
        12
      ],
      [
        2,
        13
      ],
      [
        2,
        14
      ],
      [
        2,
        15
      ],
      [
        2,
        16
      ],
      [
        2,
        17
      ],
      [
        1,
        17
      ]
    ],
    "5,10->1,17": [
      [
        5,
        10
      ],
      [
        5,
        11
      ],
      [
        5,
        12
      ],
      [
        5,
        13
      ],
      [
        4,
        14
      ],
      [
        4,
        15
      ],
      [
        4,
        16
      ],
      [
        4,
        17
      ],
      [
        3,
        17
      ],
      [
        2,
        17
      ],
      [
        1,
        17
      ]
    ]
  },
  "groundPathsWithDevices": {
    "9,10->9,2": [
      [
        9,
        10
      ],
      [
        9,
        9
      ],
      [
        9,
        8
      ],
      [
        9,
        7
      ],
      [
        9,
        6
      ],
      [
        9,
        5
      ],
      [
        9,
        4
      ],
      [
        9,
        3
      ],
      [
        9,
        2
      ]
    ],
    "12,10->9,2": [
      [
        12,
        10
      ],
      [
        12,
        9
      ],
      [
        11,
        8
      ],
      [
        11,
        7
      ],
      [
        11,
        6
      ],
      [
        10,
        5
      ],
      [
        10,
        4
      ],
      [
        9,
        3
      ],
      [
        9,
        2
      ]
    ],
    "9,18->9,2": [
      [
        9,
        18
      ],
      [
        9,
        17
      ],
      [
        9,
        16
      ],
      [
        9,
        15
      ],
      [
        9,
        14
      ],
      [
        9,
        13
      ],
      [
        9,
        12
      ],
      [
        9,
        11
      ],
      [
        9,
        10
      ],
      [
        9,
        9
      ],
      [
        9,
        8
      ],
      [
        9,
        7
      ],
      [
        9,
        6
      ],
      [
        9,
        5
      ],
      [
        9,
        4
      ],
      [
        9,
        3
      ],
      [
        9,
        2
      ]
    ],
    "12,18->9,2": [
      [
        12,
        18
      ],
      [
        12,
        17
      ],
      [
        12,
        16
      ],
      [
        12,
        15
      ],
      [
        12,
        14
      ],
      [
        12,
        13
      ],
      [
        12,
        12
      ],
      [
        12,
        11
      ],
      [
        12,
        10
      ],
      [
        12,
        9
      ],
      [
        11,
        8
      ],
      [
        11,
        7
      ],
      [
        11,
        6
      ],
      [
        10,
        5
      ],
      [
        10,
        4
      ],
      [
        9,
        3
      ],
      [
        9,
        2
      ]
    ],
    "2,10->2,2": [
      [
        2,
        10
      ],
      [
        2,
        9
      ],
      [
        2,
        8
      ],
      [
        2,
        7
      ],
      [
        2,
        6
      ],
      [
        2,
        5
      ],
      [
        2,
        4
      ],
      [
        2,
        3
      ],
      [
        2,
        2
      ]
    ],
    "5,10->2,2": [
      [
        5,
        10
      ],
      [
        5,
        9
      ],
      [
        5,
        8
      ],
      [
        4,
        7
      ],
      [
        4,
        6
      ],
      [
        3,
        5
      ],
      [
        3,
        4
      ],
      [
        2,
        3
      ],
      [
        2,
        2
      ]
    ],
    "2,10->1,3": [
      [
        2,
        10
      ],
      [
        2,
        9
      ],
      [
        2,
        8
      ],
      [
        2,
        7
      ],
      [
        2,
        6
      ],
      [
        2,
        5
      ],
      [
        2,
        4
      ],
      [
        2,
        3
      ],
      [
        1,
        3
      ]
    ],
    "5,10->1,3": [
      [
        5,
        10
      ],
      [
        5,
        9
      ],
      [
        5,
        8
      ],
      [
        5,
        7
      ],
      [
        5,
        6
      ],
      [
        5,
        5
      ],
      [
        5,
        4
      ],
      [
        4,
        4
      ],
      [
        3,
        4
      ],
      [
        2,
        3
      ],
      [
        1,
        3
      ]
    ],
    "2,10->2,18": [
      [
        2,
        10
      ],
      [
        2,
        11
      ],
      [
        2,
        12
      ],
      [
        2,
        13
      ],
      [
        2,
        14
      ],
      [
        2,
        15
      ],
      [
        2,
        16
      ],
      [
        2,
        17
      ],
      [
        2,
        18
      ]
    ],
    "5,10->2,18": [
      [
        5,
        10
      ],
      [
        5,
        11
      ],
      [
        5,
        12
      ],
      [
        5,
        13
      ],
      [
        4,
        14
      ],
      [
        4,
        15
      ],
      [
        4,
        16
      ],
      [
        4,
        17
      ],
      [
        3,
        17
      ],
      [
        2,
        17
      ],
      [
        2,
        18
      ]
    ],
    "2,10->1,17": [
      [
        2,
        10
      ],
      [
        2,
        11
      ],
      [
        2,
        12
      ],
      [
        2,
        13
      ],
      [
        2,
        14
      ],
      [
        2,
        15
      ],
      [
        2,
        16
      ],
      [
        2,
        17
      ],
      [
        1,
        17
      ]
    ],
    "5,10->1,17": [
      [
        5,
        10
      ],
      [
        5,
        11
      ],
      [
        5,
        12
      ],
      [
        5,
        13
      ],
      [
        4,
        14
      ],
      [
        4,
        15
      ],
      [
        4,
        16
      ],
      [
        4,
        17
      ],
      [
        3,
        17
      ],
      [
        2,
        17
      ],
      [
        1,
        17
      ]
    ]
  },
  "options": {
    "characterLimit": 8,
    "moveMultiplier": 0.5
  },
  "config": {}
}
```

### 新增：联防阵地（2名玩家） · act1autochess_escaped_multi

炸惊：（结构或参数变化；见下列完整记录）

```json
{
  "id": "act1autochess_escaped_multi",
  "name": "联防阵地（2名玩家）",
  "weight": 0,
  "active": false,
  "kind": "unite",
  "helpers": 2,
  "modes": [],
  "size": [
    19,
    21
  ],
  "rows": [
    "#####################",
    "###I#############I###",
    "##ErrrrrrrSrrrrrrrE##",
    "###rrrrrrfffrrrrrr###",
    "###rrrrrrfffrrrrrr###",
    "###rrrrrrfOfrrrrrr###",
    "#####################",
    "#####################",
    "###########I#########",
    "##ErrrrrrrSrrrrrrrS##",
    "###rrrrrrr#rrrrrrr###",
    "###rrrrrrr#rrrrrrr###",
    "###rrrrrrrSrrrrrrrS##",
    "#####################",
    "#####################",
    "#####################",
    "#####################",
    "#####################",
    "#####################"
  ],
  "tiles": {
    "#": {
      "tileKey": "tile_forbidden",
      "height": "HIGH",
      "buildable": "NONE",
      "passable": "FLY_ONLY",
      "groundPassable": false,
      "flyPassable": true,
      "special": null,
      "bb": {}
    },
    "I": {
      "tileKey": "tile_telin",
      "height": "LOW",
      "buildable": "NONE",
      "passable": "ALL",
      "groundPassable": true,
      "flyPassable": true,
      "special": null,
      "bb": {}
    },
    "E": {
      "tileKey": "tile_end",
      "height": "LOW",
      "buildable": "NONE",
      "passable": "ALL",
      "groundPassable": true,
      "flyPassable": true,
      "special": null,
      "bb": {}
    },
    "r": {
      "tileKey": "tile_road",
      "height": "LOW",
      "buildable": "MELEE",
      "passable": "ALL",
      "groundPassable": true,
      "flyPassable": true,
      "special": null,
      "bb": {}
    },
    "S": {
      "tileKey": "tile_start",
      "height": "LOW",
      "buildable": "NONE",
      "passable": "ALL",
      "groundPassable": true,
      "flyPassable": true,
      "special": null,
      "bb": {}
    },
    "f": {
      "tileKey": "tile_floor",
      "height": "LOW",
      "buildable": "NONE",
      "passable": "ALL",
      "groundPassable": true,
      "flyPassable": true,
      "special": null,
      "bb": {}
    },
    "O": {
      "tileKey": "tile_telout",
      "height": "LOW",
      "buildable": "NONE",
      "passable": "ALL",
      "groundPassable": true,
      "flyPassable": true,
      "special": null,
      "bb": {}
    }
  },
  "devices": [],
  "mapChars": [],
  "special": {},
  "runes": [],
  "globalBuffs": [],
  "deployTiles": {
    "normal": {
      "melee": [
        [
          9,
          3
        ],
        [
          9,
          4
        ],
        [
          9,
          5
        ],
        [
          9,
          6
        ],
        [
          9,
          7
        ],
        [
          9,
          8
        ],
        [
          9,
          9
        ],
        [
          10,
          3
        ],
        [
          10,
          4
        ],
        [
          10,
          5
        ],
        [
          10,
          6
        ],
        [
          10,
          7
        ],
        [
          10,
          8
        ],
        [
          10,
          9
        ],
        [
          11,
          3
        ],
        [
          11,
          4
        ],
        [
          11,
          5
        ],
        [
          11,
          6
        ],
        [
          11,
          7
        ],
        [
          11,
          8
        ],
        [
          11,
          9
        ],
        [
          12,
          3
        ],
        [
          12,
          4
        ],
        [
          12,
          5
        ],
        [
          12,
          6
        ],
        [
          12,
          7
        ],
        [
          12,
          8
        ],
        [
          12,
          9
        ]
      ],
      "rangedOnly": [],
      "changedByDevices": []
    },
    "bossLeft": {
      "melee": [
        [
          2,
          3
        ],
        [
          2,
          4
        ],
        [
          2,
          5
        ],
        [
          2,
          6
        ],
        [
          2,
          7
        ],
        [
          2,
          8
        ],
        [
          2,
          9
        ],
        [
          3,
          3
        ],
        [
          3,
          4
        ],
        [
          3,
          5
        ],
        [
          3,
          6
        ],
        [
          3,
          7
        ],
        [
          3,
          8
        ],
        [
          4,
          3
        ],
        [
          4,
          4
        ],
        [
          4,
          5
        ],
        [
          4,
          6
        ],
        [
          4,
          7
        ],
        [
          4,
          8
        ],
        [
          5,
          3
        ],
        [
          5,
          4
        ],
        [
          5,
          5
        ],
        [
          5,
          6
        ],
        [
          5,
          7
        ],
        [
          5,
          8
        ]
      ],
      "rangedOnly": [],
      "changedByDevices": []
    },
    "bossRight": {
      "melee": [
        [
          2,
          11
        ],
        [
          2,
          12
        ],
        [
          2,
          13
        ],
        [
          2,
          14
        ],
        [
          2,
          15
        ],
        [
          2,
          16
        ],
        [
          2,
          17
        ],
        [
          3,
          12
        ],
        [
          3,
          13
        ],
        [
          3,
          14
        ],
        [
          3,
          15
        ],
        [
          3,
          16
        ],
        [
          3,
          17
        ],
        [
          4,
          12
        ],
        [
          4,
          13
        ],
        [
          4,
          14
        ],
        [
          4,
          15
        ],
        [
          4,
          16
        ],
        [
          4,
          17
        ],
        [
          5,
          12
        ],
        [
          5,
          13
        ],
        [
          5,
          14
        ],
        [
          5,
          15
        ],
        [
          5,
          16
        ],
        [
          5,
          17
        ]
      ],
      "rangedOnly": [],
      "changedByDevices": []
    }
  },
  "groundPaths": {
    "9,10->9,2": [
      [
        9,
        10
      ],
      [
        9,
        9
      ],
      [
        9,
        8
      ],
      [
        9,
        7
      ],
      [
        9,
        6
      ],
      [
        9,
        5
      ],
      [
        9,
        4
      ],
      [
        9,
        3
      ],
      [
        9,
        2
      ]
    ],
    "12,10->9,2": [
      [
        12,
        10
      ],
      [
        12,
        9
      ],
      [
        11,
        8
      ],
      [
        11,
        7
      ],
      [
        11,
        6
      ],
      [
        10,
        5
      ],
      [
        10,
        4
      ],
      [
        9,
        3
      ],
      [
        9,
        2
      ]
    ],
    "9,18->9,2": [
      [
        9,
        18
      ],
      [
        9,
        17
      ],
      [
        9,
        16
      ],
      [
        9,
        15
      ],
      [
        9,
        14
      ],
      [
        9,
        13
      ],
      [
        9,
        12
      ],
      [
        9,
        11
      ],
      [
        9,
        10
      ],
      [
        9,
        9
      ],
      [
        9,
        8
      ],
      [
        9,
        7
      ],
      [
        9,
        6
      ],
      [
        9,
        5
      ],
      [
        9,
        4
      ],
      [
        9,
        3
      ],
      [
        9,
        2
      ]
    ],
    "12,18->9,2": [
      [
        12,
        18
      ],
      [
        12,
        17
      ],
      [
        12,
        16
      ],
      [
        12,
        15
      ],
      [
        12,
        14
      ],
      [
        12,
        13
      ],
      [
        12,
        12
      ],
      [
        12,
        11
      ],
      [
        12,
        10
      ],
      [
        12,
        9
      ],
      [
        11,
        8
      ],
      [
        11,
        7
      ],
      [
        11,
        6
      ],
      [
        10,
        5
      ],
      [
        10,
        4
      ],
      [
        9,
        3
      ],
      [
        9,
        2
      ]
    ],
    "2,10->2,2": [
      [
        2,
        10
      ],
      [
        2,
        9
      ],
      [
        2,
        8
      ],
      [
        2,
        7
      ],
      [
        2,
        6
      ],
      [
        2,
        5
      ],
      [
        2,
        4
      ],
      [
        2,
        3
      ],
      [
        2,
        2
      ]
    ],
    "5,10->2,2": [
      [
        5,
        10
      ],
      [
        5,
        9
      ],
      [
        5,
        8
      ],
      [
        4,
        7
      ],
      [
        4,
        6
      ],
      [
        3,
        5
      ],
      [
        3,
        4
      ],
      [
        2,
        3
      ],
      [
        2,
        2
      ]
    ],
    "2,10->1,3": [
      [
        2,
        10
      ],
      [
        2,
        9
      ],
      [
        2,
        8
      ],
      [
        2,
        7
      ],
      [
        2,
        6
      ],
      [
        2,
        5
      ],
      [
        2,
        4
      ],
      [
        2,
        3
      ],
      [
        1,
        3
      ]
    ],
    "5,10->1,3": [
      [
        5,
        10
      ],
      [
        5,
        9
      ],
      [
        5,
        8
      ],
      [
        5,
        7
      ],
      [
        5,
        6
      ],
      [
        5,
        5
      ],
      [
        5,
        4
      ],
      [
        4,
        4
      ],
      [
        3,
        4
      ],
      [
        2,
        3
      ],
      [
        1,
        3
      ]
    ],
    "2,10->2,18": [
      [
        2,
        10
      ],
      [
        2,
        11
      ],
      [
        2,
        12
      ],
      [
        2,
        13
      ],
      [
        2,
        14
      ],
      [
        2,
        15
      ],
      [
        2,
        16
      ],
      [
        2,
        17
      ],
      [
        2,
        18
      ]
    ],
    "5,10->2,18": [
      [
        5,
        10
      ],
      [
        5,
        11
      ],
      [
        5,
        12
      ],
      [
        5,
        13
      ],
      [
        4,
        14
      ],
      [
        4,
        15
      ],
      [
        4,
        16
      ],
      [
        4,
        17
      ],
      [
        3,
        17
      ],
      [
        2,
        17
      ],
      [
        2,
        18
      ]
    ],
    "2,10->1,17": [
      [
        2,
        10
      ],
      [
        2,
        11
      ],
      [
        2,
        12
      ],
      [
        2,
        13
      ],
      [
        2,
        14
      ],
      [
        2,
        15
      ],
      [
        2,
        16
      ],
      [
        2,
        17
      ],
      [
        1,
        17
      ]
    ],
    "5,10->1,17": [
      [
        5,
        10
      ],
      [
        5,
        11
      ],
      [
        5,
        12
      ],
      [
        5,
        13
      ],
      [
        4,
        14
      ],
      [
        4,
        15
      ],
      [
        4,
        16
      ],
      [
        4,
        17
      ],
      [
        3,
        17
      ],
      [
        2,
        17
      ],
      [
        1,
        17
      ]
    ]
  },
  "groundPathsWithDevices": {
    "9,10->9,2": [
      [
        9,
        10
      ],
      [
        9,
        9
      ],
      [
        9,
        8
      ],
      [
        9,
        7
      ],
      [
        9,
        6
      ],
      [
        9,
        5
      ],
      [
        9,
        4
      ],
      [
        9,
        3
      ],
      [
        9,
        2
      ]
    ],
    "12,10->9,2": [
      [
        12,
        10
      ],
      [
        12,
        9
      ],
      [
        11,
        8
      ],
      [
        11,
        7
      ],
      [
        11,
        6
      ],
      [
        10,
        5
      ],
      [
        10,
        4
      ],
      [
        9,
        3
      ],
      [
        9,
        2
      ]
    ],
    "9,18->9,2": [
      [
        9,
        18
      ],
      [
        9,
        17
      ],
      [
        9,
        16
      ],
      [
        9,
        15
      ],
      [
        9,
        14
      ],
      [
        9,
        13
      ],
      [
        9,
        12
      ],
      [
        9,
        11
      ],
      [
        9,
        10
      ],
      [
        9,
        9
      ],
      [
        9,
        8
      ],
      [
        9,
        7
      ],
      [
        9,
        6
      ],
      [
        9,
        5
      ],
      [
        9,
        4
      ],
      [
        9,
        3
      ],
      [
        9,
        2
      ]
    ],
    "12,18->9,2": [
      [
        12,
        18
      ],
      [
        12,
        17
      ],
      [
        12,
        16
      ],
      [
        12,
        15
      ],
      [
        12,
        14
      ],
      [
        12,
        13
      ],
      [
        12,
        12
      ],
      [
        12,
        11
      ],
      [
        12,
        10
      ],
      [
        12,
        9
      ],
      [
        11,
        8
      ],
      [
        11,
        7
      ],
      [
        11,
        6
      ],
      [
        10,
        5
      ],
      [
        10,
        4
      ],
      [
        9,
        3
      ],
      [
        9,
        2
      ]
    ],
    "2,10->2,2": [
      [
        2,
        10
      ],
      [
        2,
        9
      ],
      [
        2,
        8
      ],
      [
        2,
        7
      ],
      [
        2,
        6
      ],
      [
        2,
        5
      ],
      [
        2,
        4
      ],
      [
        2,
        3
      ],
      [
        2,
        2
      ]
    ],
    "5,10->2,2": [
      [
        5,
        10
      ],
      [
        5,
        9
      ],
      [
        5,
        8
      ],
      [
        4,
        7
      ],
      [
        4,
        6
      ],
      [
        3,
        5
      ],
      [
        3,
        4
      ],
      [
        2,
        3
      ],
      [
        2,
        2
      ]
    ],
    "2,10->1,3": [
      [
        2,
        10
      ],
      [
        2,
        9
      ],
      [
        2,
        8
      ],
      [
        2,
        7
      ],
      [
        2,
        6
      ],
      [
        2,
        5
      ],
      [
        2,
        4
      ],
      [
        2,
        3
      ],
      [
        1,
        3
      ]
    ],
    "5,10->1,3": [
      [
        5,
        10
      ],
      [
        5,
        9
      ],
      [
        5,
        8
      ],
      [
        5,
        7
      ],
      [
        5,
        6
      ],
      [
        5,
        5
      ],
      [
        5,
        4
      ],
      [
        4,
        4
      ],
      [
        3,
        4
      ],
      [
        2,
        3
      ],
      [
        1,
        3
      ]
    ],
    "2,10->2,18": [
      [
        2,
        10
      ],
      [
        2,
        11
      ],
      [
        2,
        12
      ],
      [
        2,
        13
      ],
      [
        2,
        14
      ],
      [
        2,
        15
      ],
      [
        2,
        16
      ],
      [
        2,
        17
      ],
      [
        2,
        18
      ]
    ],
    "5,10->2,18": [
      [
        5,
        10
      ],
      [
        5,
        11
      ],
      [
        5,
        12
      ],
      [
        5,
        13
      ],
      [
        4,
        14
      ],
      [
        4,
        15
      ],
      [
        4,
        16
      ],
      [
        4,
        17
      ],
      [
        3,
        17
      ],
      [
        2,
        17
      ],
      [
        2,
        18
      ]
    ],
    "2,10->1,17": [
      [
        2,
        10
      ],
      [
        2,
        11
      ],
      [
        2,
        12
      ],
      [
        2,
        13
      ],
      [
        2,
        14
      ],
      [
        2,
        15
      ],
      [
        2,
        16
      ],
      [
        2,
        17
      ],
      [
        1,
        17
      ]
    ],
    "5,10->1,17": [
      [
        5,
        10
      ],
      [
        5,
        11
      ],
      [
        5,
        12
      ],
      [
        5,
        13
      ],
      [
        4,
        14
      ],
      [
        4,
        15
      ],
      [
        4,
        16
      ],
      [
        4,
        17
      ],
      [
        3,
        17
      ],
      [
        2,
        17
      ],
      [
        1,
        17
      ]
    ]
  },
  "options": {
    "characterLimit": 20,
    "moveMultiplier": 0.5
  },
  "config": {}
}
```

