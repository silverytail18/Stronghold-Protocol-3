// Generated from pinned original tables and expansion-spec.json.
export const EXPANSION_OVERLAY = {
  "id": "arknights-expansion-v1",
  "version": "expansion-test-16",
  "chess": {
    "chess_exp_nian_a": {
      "chessId": "chess_exp_nian_a",
      "baseId": "chess_exp_nian_a",
      "goldenId": "chess_exp_nian_b",
      "isGolden": false,
      "tier": 3,
      "identifier": 10003,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1003,
      "charId": "char_2014_nian",
      "name": "年",
      "appellation": "Nian",
      "rarity": "TIER_6",
      "profession": "TANK",
      "subProfessionId": "protector",
      "subProfessionName": "铁卫",
      "position": "MELEE",
      "nationId": "yan",
      "bonds": [
        "yanShip",
        "steadShip",
        "suiShip"
      ],
      "garrisonIds": [
        "exp_nian_growth_a"
      ],
      "price": 3,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_exp_nian_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 2737,
        "atk": 513,
        "def": 529,
        "res": 0,
        "cost": 23,
        "blockCnt": 3,
        "bat": 1.5,
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
      "statsBase": {
        "maxHp": 2737,
        "atk": 513,
        "def": 529,
        "res": 0,
        "cost": 23,
        "blockCnt": 3,
        "bat": 1.5,
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
      "rangeId": "1-1",
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
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "trait": {
        "desc": "能够阻挡三个敌人",
        "descRaw": "能够阻挡三个敌人",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "能够阻挡三个敌人",
        "descRaw": "能够阻挡三个敌人",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "积甲成山",
          "desc": "编入队伍时，所有【重装】职业干员的生命上限+16%",
          "descRaw": "编入队伍时，所有【重装】职业干员的生命上限+16%",
          "bb": {
            "max_hp": 0.16
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "干明可鉴",
          "desc": "部署后立即获得3层护盾",
          "descRaw": "部署后立即获得3层<$ba.shield>护盾</>",
          "bb": {
            "times": 3
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "积甲成山",
          "desc": "编入队伍时，所有【重装】职业干员的生命上限+16%",
          "descRaw": "编入队伍时，所有【重装】职业干员的生命上限+16%",
          "bb": {
            "max_hp": 0.16
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "干明可鉴",
          "desc": "部署后立即获得3层护盾",
          "descRaw": "部署后立即获得3层<$ba.shield>护盾</>",
          "bb": {
            "times": 3
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_nian_1",
        "iconId": "skchr_nian_1",
        "name": "锡灼",
        "level": 4,
        "desc": "防御力+40%，攻击力+20%，普通攻击造成法术伤害",
        "descRaw": "防御力<@ba.vup>+{def:0%}</>，攻击力<@ba.vup>+{atk:0%}</>，普通攻击造成<@ba.vup>法术</>伤害",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 23,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 30,
        "initSp": 10,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk": 0.2,
          "def": 0.4
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_nian_1",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 0,
        "isDefault": true,
        "overrideTokenKey": null
      },
      "skills": [
        {
          "skillId": "skchr_nian_1",
          "iconId": "skchr_nian_1",
          "name": "锡灼",
          "level": 4,
          "desc": "防御力+40%，攻击力+20%，普通攻击造成法术伤害",
          "descRaw": "防御力<@ba.vup>+{def:0%}</>，攻击力<@ba.vup>+{atk:0%}</>，普通攻击造成<@ba.vup>法术</>伤害",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 23,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 30,
          "initSp": 10,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.2,
            "def": 0.4
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_nian_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": true,
          "overrideTokenKey": null
        },
        {
          "skillId": "skchr_nian_2",
          "iconId": "skchr_nian_2",
          "name": "铜印",
          "level": 4,
          "desc": "停止攻击；防御力+80%，阻挡数+1，每次受到攻击时对目标造成相当于年攻击力60%的法术伤害并使其失去特殊能力3秒",
          "descRaw": "<@ba.vdown>停止攻击</>；防御力<@ba.vup>+{def:0%}</>，阻挡数<@ba.vup>+{block_cnt}</>，每次受到攻击时对目标造成相当于年攻击力<@ba.vup>{atk_scale:0%}</>的法术伤害并使其失去特殊能力<@ba.vup>{silence}</>秒",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 31,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 50,
          "initSp": 28,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "def": 0.8,
            "block_cnt": 1,
            "atk_scale": 0.6,
            "silence": 3
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_nian_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false,
          "overrideTokenKey": null
        },
        {
          "skillId": "skchr_nian_3",
          "iconId": "skchr_nian_3",
          "name": "铁御",
          "level": 4,
          "desc": "攻击力+65%；周围其他友方干员的防御力+40%，阻挡数+1，并获得抵抗",
          "descRaw": "攻击力<@ba.vup>+{nian_s_3[self].atk:0%}</>；周围其他友方干员的防御力<@ba.vup>+{nian_s_3[ally].def:0%}</>，阻挡数<@ba.vup>+1</>，并获得<$ba.buffres>抵抗</>",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 40,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 85,
          "initSp": 48,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "nian_s_3[self].block_cnt": 0,
            "nian_s_3[ally].block_cnt": 1,
            "nian_s_3[ally].def": 0.4,
            "one_minus_status_resistance": -0.5,
            "nian_s_3[self].atk": 0.65
          },
          "bbStr": {},
          "rangeId": "x-2",
          "rangeGrid": [
            [
              2,
              -1
            ],
            [
              2,
              0
            ],
            [
              2,
              1
            ],
            [
              1,
              -2
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
              1,
              2
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
              -2
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
              -1,
              2
            ],
            [
              -2,
              -1
            ],
            [
              -2,
              0
            ],
            [
              -2,
              1
            ]
          ],
          "prefabId": "skchr_nian_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": false,
          "overrideTokenKey": null
        }
      ],
      "module": {
        "id": "uniequip_002_nian",
        "name": "混沌阵列",
        "type": "PRO-X",
        "level": 0,
        "active": false
      },
      "assets": {
        "avatar": "char_2014_nian",
        "portrait": "char_2014_nian_1",
        "spine": "char_2014_nian",
        "skillIcon": "skchr_nian_1",
        "subProfIcon": "sub_protector_icon"
      },
      "expansionBatch": "arknights-expansion-v1"
    },
    "chess_exp_nian_b": {
      "chessId": "chess_exp_nian_b",
      "baseId": "chess_exp_nian_a",
      "goldenId": "chess_exp_nian_b",
      "isGolden": true,
      "tier": 3,
      "identifier": 10003,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1003,
      "charId": "char_2014_nian",
      "name": "年",
      "appellation": "Nian",
      "rarity": "TIER_6",
      "profession": "TANK",
      "subProfessionId": "protector",
      "subProfessionName": "铁卫",
      "position": "MELEE",
      "nationId": "yan",
      "bonds": [
        "yanShip",
        "steadShip",
        "suiShip"
      ],
      "garrisonIds": [
        "exp_nian_growth_b"
      ],
      "price": 3,
      "sellPrice": 3,
      "upgradeNum": 3,
      "upgradeChessId": null,
      "status": {
        "phase": 2,
        "level": 60,
        "skillLevel": 7,
        "equipLevel": 1
      },
      "stats": {
        "maxHp": 3575,
        "atk": 583,
        "def": 720,
        "res": 0,
        "cost": 23,
        "blockCnt": 3,
        "bat": 1.5,
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
      "statsBase": {
        "maxHp": 3375,
        "atk": 583,
        "def": 660,
        "res": 0,
        "cost": 23,
        "blockCnt": 3,
        "bat": 1.5,
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
      "rangeId": "1-1",
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
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "trait": {
        "desc": "能够阻挡三个敌人",
        "descRaw": "能够阻挡三个敌人",
        "bb": {
          "def": 0.2
        },
        "bbStr": {},
        "rangeGrid": null,
        "moduleDesc": "阻挡敌人时防御力+20%"
      },
      "traitBase": {
        "desc": "能够阻挡三个敌人",
        "descRaw": "能够阻挡三个敌人",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "积甲成山",
          "desc": "编入队伍时，所有【重装】职业干员的生命上限+16%",
          "descRaw": "编入队伍时，所有【重装】职业干员的生命上限+16%",
          "bb": {
            "max_hp": 0.16
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "干明可鉴",
          "desc": "部署后立即获得3层护盾",
          "descRaw": "部署后立即获得3层<$ba.shield>护盾</>",
          "bb": {
            "times": 3
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "积甲成山",
          "desc": "编入队伍时，所有【重装】职业干员的生命上限+16%",
          "descRaw": "编入队伍时，所有【重装】职业干员的生命上限+16%",
          "bb": {
            "max_hp": 0.16
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "干明可鉴",
          "desc": "部署后立即获得3层护盾",
          "descRaw": "部署后立即获得3层<$ba.shield>护盾</>",
          "bb": {
            "times": 3
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_nian_1",
        "iconId": "skchr_nian_1",
        "name": "锡灼",
        "level": 7,
        "desc": "防御力+55%，攻击力+30%，普通攻击造成法术伤害",
        "descRaw": "防御力<@ba.vup>+{def:0%}</>，攻击力<@ba.vup>+{atk:0%}</>，普通攻击造成<@ba.vup>法术</>伤害",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 26,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 30,
        "initSp": 10,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk": 0.3,
          "def": 0.55
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_nian_1",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 0,
        "isDefault": true,
        "overrideTokenKey": null
      },
      "skills": [
        {
          "skillId": "skchr_nian_1",
          "iconId": "skchr_nian_1",
          "name": "锡灼",
          "level": 7,
          "desc": "防御力+55%，攻击力+30%，普通攻击造成法术伤害",
          "descRaw": "防御力<@ba.vup>+{def:0%}</>，攻击力<@ba.vup>+{atk:0%}</>，普通攻击造成<@ba.vup>法术</>伤害",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 26,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 30,
          "initSp": 10,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.3,
            "def": 0.55
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_nian_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": true,
          "overrideTokenKey": null
        },
        {
          "skillId": "skchr_nian_2",
          "iconId": "skchr_nian_2",
          "name": "铜印",
          "level": 7,
          "desc": "停止攻击；防御力+100%，阻挡数+1，每次受到攻击时对目标造成相当于年攻击力70%的法术伤害并使其失去特殊能力3秒",
          "descRaw": "<@ba.vdown>停止攻击</>；防御力<@ba.vup>+{def:0%}</>，阻挡数<@ba.vup>+{block_cnt}</>，每次受到攻击时对目标造成相当于年攻击力<@ba.vup>{atk_scale:0%}</>的法术伤害并使其失去特殊能力<@ba.vup>{silence}</>秒",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 32,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 50,
          "initSp": 31,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "def": 1,
            "block_cnt": 1,
            "atk_scale": 0.7,
            "silence": 3
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_nian_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false,
          "overrideTokenKey": null
        },
        {
          "skillId": "skchr_nian_3",
          "iconId": "skchr_nian_3",
          "name": "铁御",
          "level": 7,
          "desc": "攻击力+80%；周围其他友方干员的防御力+50%，阻挡数+1，并获得抵抗",
          "descRaw": "攻击力<@ba.vup>+{nian_s_3[self].atk:0%}</>；周围其他友方干员的防御力<@ba.vup>+{nian_s_3[ally].def:0%}</>，阻挡数<@ba.vup>+1</>，并获得<$ba.buffres>抵抗</>",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 40,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 85,
          "initSp": 56,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "nian_s_3[self].block_cnt": 0,
            "nian_s_3[ally].block_cnt": 1,
            "nian_s_3[ally].def": 0.5,
            "one_minus_status_resistance": -0.5,
            "nian_s_3[self].atk": 0.8
          },
          "bbStr": {},
          "rangeId": "x-2",
          "rangeGrid": [
            [
              2,
              -1
            ],
            [
              2,
              0
            ],
            [
              2,
              1
            ],
            [
              1,
              -2
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
              1,
              2
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
              -2
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
              -1,
              2
            ],
            [
              -2,
              -1
            ],
            [
              -2,
              0
            ],
            [
              -2,
              1
            ]
          ],
          "prefabId": "skchr_nian_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": false,
          "overrideTokenKey": null
        }
      ],
      "module": {
        "id": "uniequip_002_nian",
        "name": "混沌阵列",
        "type": "PRO-X",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_nian",
          "name": "混沌阵列",
          "typeName": "PRO-X",
          "isDefault": true,
          "level": 1,
          "attr": {
            "maxHp": 200,
            "def": 60
          },
          "traitOverride": {
            "desc": "能够阻挡三个敌人",
            "descRaw": "能够阻挡三个敌人",
            "bb": {
              "def": 0.2
            },
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "阻挡敌人时防御力+20%"
          },
          "talentChanges": []
        },
        {
          "uniEquipId": "uniequip_003_nian",
          "name": "“请勿叩门”",
          "typeName": "PRO-Y",
          "isDefault": false,
          "level": 1,
          "attr": {
            "maxHp": 320,
            "atk": 35,
            "def": 21,
            "blockCnt": 1
          },
          "traitOverride": {
            "desc": "能够阻挡四个敌人",
            "descRaw": "能够阻挡四个敌人",
            "bb": {},
            "bbStr": {},
            "rangeGrid": null
          },
          "talentChanges": []
        }
      ],
      "assets": {
        "avatar": "char_2014_nian_2",
        "portrait": "char_2014_nian_2",
        "spine": "char_2014_nian",
        "skillIcon": "skchr_nian_1",
        "subProfIcon": "sub_protector_icon"
      },
      "expansionBatch": "arknights-expansion-v1"
    },
    "chess_exp_ling_a": {
      "chessId": "chess_exp_ling_a",
      "baseId": "chess_exp_ling_a",
      "goldenId": "chess_exp_ling_b",
      "isGolden": false,
      "tier": 4,
      "identifier": 10004,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1004,
      "charId": "char_2023_ling",
      "name": "令",
      "appellation": "Ling",
      "rarity": "TIER_6",
      "profession": "SUPPORT",
      "subProfessionId": "summoner",
      "subProfessionName": "召唤师",
      "position": "RANGED",
      "nationId": "yan",
      "bonds": [
        "yanShip",
        "skillfulShip",
        "suiShip"
      ],
      "garrisonIds": [
        "exp_ling_growth_a"
      ],
      "price": 3,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_exp_ling_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 852,
        "atk": 406,
        "def": 114,
        "res": 20,
        "cost": 12,
        "blockCnt": 1,
        "bat": 1.6,
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
      "statsBase": {
        "maxHp": 852,
        "atk": 406,
        "def": 114,
        "res": 20,
        "cost": 12,
        "blockCnt": 1,
        "bat": 1.6,
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
      "rangeId": "3-1",
      "rangeGrid": [
        [
          1,
          0
        ],
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
          0
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
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "dmgType": "arts",
      "attackKind": "ranged",
      "projectile": "bolt",
      "canHitFly": true,
      "targetPriority": null,
      "trait": {
        "desc": "攻击造成法术伤害\n可以使用召唤物协助作战",
        "descRaw": "攻击造成<@ba.kw>法术伤害</>\\n可以使用<@ba.kw>召唤物</>协助作战",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "攻击造成法术伤害\n可以使用召唤物协助作战",
        "descRaw": "攻击造成<@ba.kw>法术伤害</>\\n可以使用<@ba.kw>召唤物</>协助作战",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "挑灯问梦",
          "desc": "可以使用5个召唤物（最多同时部署3个），功能随技能选择而改变",
          "descRaw": "可以使用5个召唤物（最多同时部署3个），功能随技能选择而改变",
          "bb": {
            "cnt": 5
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "随付笺咏醉屠苏",
          "desc": "召唤物被击倒/吸收/回收时令额外获得3点技力、攻击力+3%（攻击力加成最多叠加5层）",
          "descRaw": "召唤物被击倒/吸收/回收时令额外获得3点技力、攻击力+3%（攻击力加成最多叠加5层）",
          "bb": {
            "max_stack_cnt": 5,
            "sp": 3,
            "atk": 0.03
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "挑灯问梦",
          "desc": "可以使用5个召唤物（最多同时部署3个），功能随技能选择而改变",
          "descRaw": "可以使用5个召唤物（最多同时部署3个），功能随技能选择而改变",
          "bb": {
            "cnt": 5
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "随付笺咏醉屠苏",
          "desc": "召唤物被击倒/吸收/回收时令额外获得3点技力、攻击力+3%（攻击力加成最多叠加5层）",
          "descRaw": "召唤物被击倒/吸收/回收时令额外获得3点技力、攻击力+3%（攻击力加成最多叠加5层）",
          "bb": {
            "max_stack_cnt": 5,
            "sp": 3,
            "atk": 0.03
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "tokens": [
        "token_10020_ling_soul1",
        "token_10020_ling_soul2",
        "token_10020_ling_soul3"
      ],
      "skill": {
        "skillId": "skchr_ling_2",
        "iconId": "skchr_ling_2",
        "name": "笑鸣瑟",
        "level": 4,
        "desc": "被动：召唤物可部署在远程位，攻击造成法术伤害\n开启：令与召唤物对攻击范围内两名敌人造成310%攻击力的法术伤害并束缚2秒\n技能结束时回收生命值低于一半的召唤物。可充能2次",
        "descRaw": "被动：召唤物可部署在远程位，攻击造成<@ba.vup>法术</>伤害\\n开启：令与召唤物对攻击范围内<@ba.vup>两名</>敌人造成<@ba.vup>{atk_scale:0%}</>攻击力的法术伤害并<$ba.root>束缚</><@ba.vup>{ling_s2_unmovable.duration}</>秒\\n<@ba.rem>技能结束时回收生命值低于一半的召唤物。可充能{value}次</>",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": -1,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 17,
        "initSp": 0,
        "maxChargeTime": 2,
        "increment": 1,
        "bb": {
          "atk_scale": 3.1,
          "cnt": 1,
          "ling_s2_unmovable.duration": 2,
          "value": 2,
          "hp_ratio": 0.5
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_ling_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true,
        "overrideTokenKey": "token_10020_ling_soul2"
      },
      "skills": [
        {
          "skillId": "skchr_ling_1",
          "iconId": "skchr_ling_1",
          "name": "重进酒",
          "level": 4,
          "desc": "被动：召唤物可部署在近战位\n开启：自身与召唤物攻击力+29%，攻击速度+29，召唤物伤害类型变为法术\n技能开启时获得1个召唤物",
          "descRaw": "被动：召唤物可部署在近战位\\n开启：自身与召唤物攻击力<@ba.vup>+{atk:0%}</>，攻击速度<@ba.vup>+{attack_speed}</>，召唤物伤害类型变为<@ba.vup>法术</>\\n<@ba.rem>技能开启时获得1个召唤物</>",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 25,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 35,
          "initSp": 10,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.29,
            "attack_speed": 29,
            "cnt": 1
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_ling_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false,
          "overrideTokenKey": "token_10020_ling_soul1"
        },
        {
          "skillId": "skchr_ling_2",
          "iconId": "skchr_ling_2",
          "name": "笑鸣瑟",
          "level": 4,
          "desc": "被动：召唤物可部署在远程位，攻击造成法术伤害\n开启：令与召唤物对攻击范围内两名敌人造成310%攻击力的法术伤害并束缚2秒\n技能结束时回收生命值低于一半的召唤物。可充能2次",
          "descRaw": "被动：召唤物可部署在远程位，攻击造成<@ba.vup>法术</>伤害\\n开启：令与召唤物对攻击范围内<@ba.vup>两名</>敌人造成<@ba.vup>{atk_scale:0%}</>攻击力的法术伤害并<$ba.root>束缚</><@ba.vup>{ling_s2_unmovable.duration}</>秒\\n<@ba.rem>技能结束时回收生命值低于一半的召唤物。可充能{value}次</>",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": -1,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 17,
          "initSp": 0,
          "maxChargeTime": 2,
          "increment": 1,
          "bb": {
            "atk_scale": 3.1,
            "cnt": 1,
            "ling_s2_unmovable.duration": 2,
            "value": 2,
            "hp_ratio": 0.5
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_ling_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true,
          "overrideTokenKey": "token_10020_ling_soul2"
        },
        {
          "skillId": "skchr_ling_3",
          "iconId": "skchr_ling_3",
          "name": "宁作吾",
          "level": 4,
          "desc": "被动：召唤物可部署在近战位且攻击范围内存在其他召唤物时与其合并为高级形态\n开启：自身与召唤物攻击力+55%，防御力+50%，召唤物每0.5秒对周围四格敌人造成20%令攻击力的法术伤害\n技能结束时获得1个召唤物",
          "descRaw": "被动：召唤物可部署在近战位且攻击范围内存在其他召唤物时与其合并为<@ba.vup>高级</>形态\\n开启：自身与召唤物攻击力<@ba.vup>+{atk:0%}</>，防御力<@ba.vup>+{def:0%}</>，召唤物每<@ba.vup>{interval}</>秒对周围四格敌人造成<@ba.vup>{atk_scale:0%}</>令攻击力的法术伤害\\n<@ba.rem>技能结束时获得1个召唤物</>",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 25,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 50,
          "initSp": 12,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.55,
            "def": 0.5,
            "atk_scale": 0.2,
            "interval": 0.5,
            "cnt": 1
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_ling_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": false,
          "overrideTokenKey": "token_10020_ling_soul3"
        }
      ],
      "module": {
        "id": "uniequip_002_ling",
        "name": "诗短梦长",
        "type": "SUM-Y",
        "level": 0,
        "active": false
      },
      "assets": {
        "avatar": "char_2023_ling",
        "portrait": "char_2023_ling_1",
        "spine": "char_2023_ling",
        "skillIcon": "skchr_ling_2",
        "subProfIcon": "sub_summoner_icon"
      },
      "expansionBatch": "arknights-expansion-v1"
    },
    "chess_exp_ling_b": {
      "chessId": "chess_exp_ling_b",
      "baseId": "chess_exp_ling_a",
      "goldenId": "chess_exp_ling_b",
      "isGolden": true,
      "tier": 4,
      "identifier": 10004,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1004,
      "charId": "char_2023_ling",
      "name": "令",
      "appellation": "Ling",
      "rarity": "TIER_6",
      "profession": "SUPPORT",
      "subProfessionId": "summoner",
      "subProfessionName": "召唤师",
      "position": "RANGED",
      "nationId": "yan",
      "bonds": [
        "yanShip",
        "skillfulShip",
        "suiShip"
      ],
      "garrisonIds": [
        "exp_ling_growth_b"
      ],
      "price": 3,
      "sellPrice": 3,
      "upgradeNum": 3,
      "upgradeChessId": null,
      "status": {
        "phase": 2,
        "level": 60,
        "skillLevel": 7,
        "equipLevel": 1
      },
      "stats": {
        "maxHp": 1102,
        "atk": 480,
        "def": 130,
        "res": 20,
        "cost": 12,
        "blockCnt": 1,
        "bat": 1.6,
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
      "statsBase": {
        "maxHp": 1002,
        "atk": 450,
        "def": 130,
        "res": 20,
        "cost": 12,
        "blockCnt": 1,
        "bat": 1.6,
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
      "rangeId": "3-1",
      "rangeGrid": [
        [
          1,
          0
        ],
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
          0
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
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "dmgType": "arts",
      "attackKind": "ranged",
      "projectile": "bolt",
      "canHitFly": true,
      "targetPriority": null,
      "trait": {
        "desc": "攻击造成法术伤害\n可以使用召唤物协助作战",
        "descRaw": "攻击造成<@ba.kw>法术伤害</>\\n可以使用<@ba.kw>召唤物</>协助作战",
        "bb": {
          "cnt": 3
        },
        "bbStr": {},
        "rangeGrid": null,
        "moduleDesc": "召唤物持有上限+{cnt}，召唤物部署费用减少"
      },
      "traitBase": {
        "desc": "攻击造成法术伤害\n可以使用召唤物协助作战",
        "descRaw": "攻击造成<@ba.kw>法术伤害</>\\n可以使用<@ba.kw>召唤物</>协助作战",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "挑灯问梦",
          "desc": "可以使用5个召唤物（最多同时部署3个），功能随技能选择而改变",
          "descRaw": "可以使用5个召唤物（最多同时部署3个），功能随技能选择而改变",
          "bb": {
            "cnt": 5
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "随付笺咏醉屠苏",
          "desc": "召唤物被击倒/吸收/回收时令额外获得3点技力、攻击力+3%（攻击力加成最多叠加5层）",
          "descRaw": "召唤物被击倒/吸收/回收时令额外获得3点技力、攻击力+3%（攻击力加成最多叠加5层）",
          "bb": {
            "max_stack_cnt": 5,
            "sp": 3,
            "atk": 0.03
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "挑灯问梦",
          "desc": "可以使用5个召唤物（最多同时部署3个），功能随技能选择而改变",
          "descRaw": "可以使用5个召唤物（最多同时部署3个），功能随技能选择而改变",
          "bb": {
            "cnt": 5
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "随付笺咏醉屠苏",
          "desc": "召唤物被击倒/吸收/回收时令额外获得3点技力、攻击力+3%（攻击力加成最多叠加5层）",
          "descRaw": "召唤物被击倒/吸收/回收时令额外获得3点技力、攻击力+3%（攻击力加成最多叠加5层）",
          "bb": {
            "max_stack_cnt": 5,
            "sp": 3,
            "atk": 0.03
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "tokens": [
        "token_10020_ling_soul1",
        "token_10020_ling_soul2",
        "token_10020_ling_soul3"
      ],
      "skill": {
        "skillId": "skchr_ling_2",
        "iconId": "skchr_ling_2",
        "name": "笑鸣瑟",
        "level": 7,
        "desc": "被动：召唤物可部署在远程位，攻击造成法术伤害\n开启：令与召唤物对攻击范围内两名敌人造成370%攻击力的法术伤害并束缚2.5秒\n技能结束时回收生命值低于一半的召唤物。可充能2次",
        "descRaw": "被动：召唤物可部署在远程位，攻击造成<@ba.vup>法术</>伤害\\n开启：令与召唤物对攻击范围内<@ba.vup>两名</>敌人造成<@ba.vup>{atk_scale:0%}</>攻击力的法术伤害并<$ba.root>束缚</><@ba.vup>{ling_s2_unmovable.duration}</>秒\\n<@ba.rem>技能结束时回收生命值低于一半的召唤物。可充能{value}次</>",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": -1,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 16,
        "initSp": 5,
        "maxChargeTime": 2,
        "increment": 1,
        "bb": {
          "atk_scale": 3.7,
          "cnt": 1,
          "ling_s2_unmovable.duration": 2.5,
          "value": 2,
          "hp_ratio": 0.5
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_ling_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true,
        "overrideTokenKey": "token_10020_ling_soul2"
      },
      "skills": [
        {
          "skillId": "skchr_ling_1",
          "iconId": "skchr_ling_1",
          "name": "重进酒",
          "level": 7,
          "desc": "被动：召唤物可部署在近战位\n开启：自身与召唤物攻击力+38%，攻击速度+38，召唤物伤害类型变为法术\n技能开启时获得1个召唤物",
          "descRaw": "被动：召唤物可部署在近战位\\n开启：自身与召唤物攻击力<@ba.vup>+{atk:0%}</>，攻击速度<@ba.vup>+{attack_speed}</>，召唤物伤害类型变为<@ba.vup>法术</>\\n<@ba.rem>技能开启时获得1个召唤物</>",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 25,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 30,
          "initSp": 10,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.38,
            "attack_speed": 38,
            "cnt": 1
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_ling_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false,
          "overrideTokenKey": "token_10020_ling_soul1"
        },
        {
          "skillId": "skchr_ling_2",
          "iconId": "skchr_ling_2",
          "name": "笑鸣瑟",
          "level": 7,
          "desc": "被动：召唤物可部署在远程位，攻击造成法术伤害\n开启：令与召唤物对攻击范围内两名敌人造成370%攻击力的法术伤害并束缚2.5秒\n技能结束时回收生命值低于一半的召唤物。可充能2次",
          "descRaw": "被动：召唤物可部署在远程位，攻击造成<@ba.vup>法术</>伤害\\n开启：令与召唤物对攻击范围内<@ba.vup>两名</>敌人造成<@ba.vup>{atk_scale:0%}</>攻击力的法术伤害并<$ba.root>束缚</><@ba.vup>{ling_s2_unmovable.duration}</>秒\\n<@ba.rem>技能结束时回收生命值低于一半的召唤物。可充能{value}次</>",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": -1,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 16,
          "initSp": 5,
          "maxChargeTime": 2,
          "increment": 1,
          "bb": {
            "atk_scale": 3.7,
            "cnt": 1,
            "ling_s2_unmovable.duration": 2.5,
            "value": 2,
            "hp_ratio": 0.5
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_ling_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true,
          "overrideTokenKey": "token_10020_ling_soul2"
        },
        {
          "skillId": "skchr_ling_3",
          "iconId": "skchr_ling_3",
          "name": "宁作吾",
          "level": 7,
          "desc": "被动：召唤物可部署在近战位且攻击范围内存在其他召唤物时与其合并为高级形态\n开启：自身与召唤物攻击力+70%，防御力+60%，召唤物每0.5秒对周围四格敌人造成20%令攻击力的法术伤害\n技能结束时获得1个召唤物",
          "descRaw": "被动：召唤物可部署在近战位且攻击范围内存在其他召唤物时与其合并为<@ba.vup>高级</>形态\\n开启：自身与召唤物攻击力<@ba.vup>+{atk:0%}</>，防御力<@ba.vup>+{def:0%}</>，召唤物每<@ba.vup>{interval}</>秒对周围四格敌人造成<@ba.vup>{atk_scale:0%}</>令攻击力的法术伤害\\n<@ba.rem>技能结束时获得1个召唤物</>",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 30,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 45,
          "initSp": 15,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.7,
            "def": 0.6,
            "atk_scale": 0.2,
            "interval": 0.5,
            "cnt": 1
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_ling_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": false,
          "overrideTokenKey": "token_10020_ling_soul3"
        }
      ],
      "module": {
        "id": "uniequip_002_ling",
        "name": "诗短梦长",
        "type": "SUM-Y",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_ling",
          "name": "诗短梦长",
          "typeName": "SUM-Y",
          "isDefault": true,
          "level": 1,
          "attr": {
            "maxHp": 100,
            "atk": 30
          },
          "traitOverride": {
            "desc": "攻击造成法术伤害\n可以使用召唤物协助作战",
            "descRaw": "攻击造成<@ba.kw>法术伤害</>\\n可以使用<@ba.kw>召唤物</>协助作战",
            "bb": {
              "cnt": 3
            },
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "召唤物持有上限+{cnt}，召唤物部署费用减少"
          },
          "talentChanges": []
        }
      ],
      "assets": {
        "avatar": "char_2023_ling_2",
        "portrait": "char_2023_ling_2",
        "spine": "char_2023_ling",
        "skillIcon": "skchr_ling_2",
        "subProfIcon": "sub_summoner_icon"
      },
      "expansionBatch": "arknights-expansion-v1"
    },
    "chess_exp_shu_a": {
      "chessId": "chess_exp_shu_a",
      "baseId": "chess_exp_shu_a",
      "goldenId": "chess_exp_shu_b",
      "isGolden": false,
      "tier": 5,
      "identifier": 10005,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1005,
      "charId": "char_2025_shu",
      "name": "黍",
      "appellation": "Shu",
      "rarity": "TIER_6",
      "profession": "TANK",
      "subProfessionId": "guardian",
      "subProfessionName": "守护者",
      "position": "MELEE",
      "nationId": "yan",
      "bonds": [
        "yanShip",
        "steadShip",
        "suiShip"
      ],
      "garrisonIds": [
        "exp_shu_growth_a"
      ],
      "price": 4,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_exp_shu_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 2313,
        "atk": 392,
        "def": 493,
        "res": 10,
        "cost": 22,
        "blockCnt": 3,
        "bat": 1.2,
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
      "statsBase": {
        "maxHp": 2313,
        "atk": 392,
        "def": 493,
        "res": 10,
        "cost": 22,
        "blockCnt": 3,
        "bat": 1.2,
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
      "rangeId": "0-1",
      "rangeGrid": [
        [
          0,
          0
        ]
      ],
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "trait": {
        "desc": "技能可以治疗友方单位",
        "descRaw": "技能可以治疗友方单位",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "技能可以治疗友方单位",
        "descRaw": "技能可以治疗友方单位",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "百谷长青",
          "desc": "治疗干员时对其与周围四格地块进行播种施加如下效果：每秒恢复70生命、获得10%庇护",
          "descRaw": "治疗干员时对其与周围四格地块进行播种施加如下效果：每秒恢复70生命、获得10%<$ba.protect>庇护</>",
          "bb": {
            "hp_recovery_per_sec": 70,
            "damage_resistance": 0.1
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "天有四时",
          "desc": "场上有三名不同职业干员时所有干员生命上限+12%、三名相同职业干员时所有干员攻击速度+12，编队中有四名【岁】干员时所有干员攻击力+12%且4秒获得1点技力",
          "descRaw": "场上有三名不同职业干员时所有干员生命上限+12%、三名相同职业干员时所有干员攻击速度+12，编队中有四名【岁】干员时所有干员攻击力+12%且4秒获得1点技力",
          "bb": {
            "max_hp": 0.12,
            "attack_speed": 12,
            "atk": 0.12,
            "interval": 4,
            "sp": 1
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "百谷长青",
          "desc": "治疗干员时对其与周围四格地块进行播种施加如下效果：每秒恢复70生命、获得10%庇护",
          "descRaw": "治疗干员时对其与周围四格地块进行播种施加如下效果：每秒恢复70生命、获得10%<$ba.protect>庇护</>",
          "bb": {
            "hp_recovery_per_sec": 70,
            "damage_resistance": 0.1
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "天有四时",
          "desc": "场上有三名不同职业干员时所有干员生命上限+12%、三名相同职业干员时所有干员攻击速度+12，编队中有四名【岁】干员时所有干员攻击力+12%且4秒获得1点技力",
          "descRaw": "场上有三名不同职业干员时所有干员生命上限+12%、三名相同职业干员时所有干员攻击速度+12，编队中有四名【岁】干员时所有干员攻击力+12%且4秒获得1点技力",
          "bb": {
            "max_hp": 0.12,
            "attack_speed": 12,
            "atk": 0.12,
            "interval": 4,
            "sp": 1
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_shu_3",
        "iconId": "skchr_shu_3",
        "name": "离离枯荣",
        "level": 4,
        "desc": "治疗范围扩大，攻击同时可治疗我方干员，攻击力+22%，有地面敌人处于播种地块时技能范围内的我方单位攻击力+15%、攻击速度+15，敌人经过播种地块时获得如下效果：当远离该地块超过4格时被传送回该地块",
        "descRaw": "治疗范围<@ba.vup>扩大</>，攻击同时可治疗我方干员，攻击力<@ba.vup>+{atk:0%}</>，有地面敌人处于播种地块时技能范围内的我方单位攻击力<@ba.vup>+{e_atk:0%}</>、攻击速度<@ba.vup>+{e_attack_speed}</>，敌人经过播种地块时获得如下效果：当远离该地块超过<@ba.vup>{max_distance}</>格时被传送回该地块",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 30,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 55,
        "initSp": 25,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk": 0.22,
          "e_atk": 0.15,
          "e_attack_speed": 15,
          "e_max_stack_cnt": 1,
          "max_distance": 4
        },
        "bbStr": {},
        "rangeId": "x-2",
        "rangeGrid": [
          [
            2,
            -1
          ],
          [
            2,
            0
          ],
          [
            2,
            1
          ],
          [
            1,
            -2
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
            1,
            2
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
            -2
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
            -1,
            2
          ],
          [
            -2,
            -1
          ],
          [
            -2,
            0
          ],
          [
            -2,
            1
          ]
        ],
        "prefabId": "skchr_shu_3",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 2,
        "isDefault": true,
        "overrideTokenKey": null
      },
      "skills": [
        {
          "skillId": "skchr_shu_1",
          "iconId": "skchr_shu_1",
          "name": "化被草木",
          "level": 4,
          "desc": "下一次攻击会为周围血量不足一半的一名友方单位恢复相当于攻击力130%的生命\n可充能1次",
          "descRaw": "下一次攻击会为周围血量不足一半的一名友方单位恢复相当于攻击力<@ba.vup>{heal_scale:0%}</>的生命\\n<@ba.rem>可充能{ct}次</>",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 5,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "heal_scale": 1.3,
            "ct": 1
          },
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
          "prefabId": "skchr_shu_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false,
          "overrideTokenKey": null
        },
        {
          "skillId": "skchr_shu_2",
          "iconId": "skchr_shu_2",
          "name": "嘉禾盈仓",
          "level": 4,
          "desc": "停止攻击专注治疗范围内至多两名我方单位，攻击力+60%，阻挡数+1，第一天赋效果提升至1.3倍\n治疗拥有特殊间隔",
          "descRaw": "<@ba.vdown>停止</>攻击专注治疗范围内至多<@ba.vup>两名</>我方单位，攻击力<@ba.vup>+{atk:0%}</>，阻挡数<@ba.vup>+{block_cnt}</>，第一天赋效果提升至<@ba.vup>{extra_extend_scale}</>倍\\n<@ba.rem>治疗拥有特殊间隔</>",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 25,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 35,
          "initSp": 15,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.6,
            "extra_extend_scale": 1.3,
            "block_cnt": 1,
            "attack@max_target": 2,
            "base_attack_time": 1.3
          },
          "bbStr": {},
          "rangeId": "x-1",
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
          "prefabId": "skchr_shu_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false,
          "overrideTokenKey": null
        },
        {
          "skillId": "skchr_shu_3",
          "iconId": "skchr_shu_3",
          "name": "离离枯荣",
          "level": 4,
          "desc": "治疗范围扩大，攻击同时可治疗我方干员，攻击力+22%，有地面敌人处于播种地块时技能范围内的我方单位攻击力+15%、攻击速度+15，敌人经过播种地块时获得如下效果：当远离该地块超过4格时被传送回该地块",
          "descRaw": "治疗范围<@ba.vup>扩大</>，攻击同时可治疗我方干员，攻击力<@ba.vup>+{atk:0%}</>，有地面敌人处于播种地块时技能范围内的我方单位攻击力<@ba.vup>+{e_atk:0%}</>、攻击速度<@ba.vup>+{e_attack_speed}</>，敌人经过播种地块时获得如下效果：当远离该地块超过<@ba.vup>{max_distance}</>格时被传送回该地块",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 30,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 55,
          "initSp": 25,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.22,
            "e_atk": 0.15,
            "e_attack_speed": 15,
            "e_max_stack_cnt": 1,
            "max_distance": 4
          },
          "bbStr": {},
          "rangeId": "x-2",
          "rangeGrid": [
            [
              2,
              -1
            ],
            [
              2,
              0
            ],
            [
              2,
              1
            ],
            [
              1,
              -2
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
              1,
              2
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
              -2
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
              -1,
              2
            ],
            [
              -2,
              -1
            ],
            [
              -2,
              0
            ],
            [
              -2,
              1
            ]
          ],
          "prefabId": "skchr_shu_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": true,
          "overrideTokenKey": null
        }
      ],
      "module": {
        "id": "uniequip_002_shu",
        "name": "“钦天司时”",
        "type": "GUA-X",
        "level": 0,
        "active": false
      },
      "assets": {
        "avatar": "char_2025_shu",
        "portrait": "char_2025_shu_1",
        "spine": "char_2025_shu",
        "skillIcon": "skchr_shu_3",
        "subProfIcon": "sub_guardian_icon"
      },
      "expansionBatch": "arknights-expansion-v1"
    },
    "chess_exp_shu_b": {
      "chessId": "chess_exp_shu_b",
      "baseId": "chess_exp_shu_a",
      "goldenId": "chess_exp_shu_b",
      "isGolden": true,
      "tier": 5,
      "identifier": 10005,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1005,
      "charId": "char_2025_shu",
      "name": "黍",
      "appellation": "Shu",
      "rarity": "TIER_6",
      "profession": "TANK",
      "subProfessionId": "guardian",
      "subProfessionName": "守护者",
      "position": "MELEE",
      "nationId": "yan",
      "bonds": [
        "yanShip",
        "steadShip",
        "suiShip"
      ],
      "garrisonIds": [
        "exp_shu_growth_b"
      ],
      "price": 4,
      "sellPrice": 4,
      "upgradeNum": 3,
      "upgradeChessId": null,
      "status": {
        "phase": 2,
        "level": 60,
        "skillLevel": 7,
        "equipLevel": 1
      },
      "stats": {
        "maxHp": 3070,
        "atk": 480,
        "def": 595,
        "res": 10,
        "cost": 22,
        "blockCnt": 3,
        "bat": 1.2,
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
      "statsBase": {
        "maxHp": 2910,
        "atk": 450,
        "def": 565,
        "res": 10,
        "cost": 22,
        "blockCnt": 3,
        "bat": 1.2,
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
      "rangeId": "0-1",
      "rangeGrid": [
        [
          0,
          0
        ]
      ],
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "trait": {
        "desc": "技能可以治疗友方单位",
        "descRaw": "技能可以治疗友方单位",
        "bb": {
          "heal_scale": 1.15,
          "hp_ratio": 0.5
        },
        "bbStr": {},
        "rangeGrid": null,
        "moduleDesc": "治疗生命值低于50%的友方单位时治疗量提升15%"
      },
      "traitBase": {
        "desc": "技能可以治疗友方单位",
        "descRaw": "技能可以治疗友方单位",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "百谷长青",
          "desc": "治疗干员时对其与周围四格地块进行播种施加如下效果：每秒恢复70生命、获得10%庇护",
          "descRaw": "治疗干员时对其与周围四格地块进行播种施加如下效果：每秒恢复70生命、获得10%<$ba.protect>庇护</>",
          "bb": {
            "hp_recovery_per_sec": 70,
            "damage_resistance": 0.1
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "天有四时",
          "desc": "场上有三名不同职业干员时所有干员生命上限+12%、三名相同职业干员时所有干员攻击速度+12，编队中有四名【岁】干员时所有干员攻击力+12%且4秒获得1点技力",
          "descRaw": "场上有三名不同职业干员时所有干员生命上限+12%、三名相同职业干员时所有干员攻击速度+12，编队中有四名【岁】干员时所有干员攻击力+12%且4秒获得1点技力",
          "bb": {
            "max_hp": 0.12,
            "attack_speed": 12,
            "atk": 0.12,
            "interval": 4,
            "sp": 1
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "百谷长青",
          "desc": "治疗干员时对其与周围四格地块进行播种施加如下效果：每秒恢复70生命、获得10%庇护",
          "descRaw": "治疗干员时对其与周围四格地块进行播种施加如下效果：每秒恢复70生命、获得10%<$ba.protect>庇护</>",
          "bb": {
            "hp_recovery_per_sec": 70,
            "damage_resistance": 0.1
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "天有四时",
          "desc": "场上有三名不同职业干员时所有干员生命上限+12%、三名相同职业干员时所有干员攻击速度+12，编队中有四名【岁】干员时所有干员攻击力+12%且4秒获得1点技力",
          "descRaw": "场上有三名不同职业干员时所有干员生命上限+12%、三名相同职业干员时所有干员攻击速度+12，编队中有四名【岁】干员时所有干员攻击力+12%且4秒获得1点技力",
          "bb": {
            "max_hp": 0.12,
            "attack_speed": 12,
            "atk": 0.12,
            "interval": 4,
            "sp": 1
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_shu_3",
        "iconId": "skchr_shu_3",
        "name": "离离枯荣",
        "level": 7,
        "desc": "治疗范围扩大，攻击同时可治疗我方干员，攻击力+34%，有地面敌人处于播种地块时技能范围内的我方单位攻击力+20%、攻击速度+20，敌人经过播种地块时获得如下效果：当远离该地块超过3格时被传送回该地块",
        "descRaw": "治疗范围<@ba.vup>扩大</>，攻击同时可治疗我方干员，攻击力<@ba.vup>+{atk:0%}</>，有地面敌人处于播种地块时技能范围内的我方单位攻击力<@ba.vup>+{e_atk:0%}</>、攻击速度<@ba.vup>+{e_attack_speed}</>，敌人经过播种地块时获得如下效果：当远离该地块超过<@ba.vup>{max_distance}</>格时被传送回该地块",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 30,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 50,
        "initSp": 30,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk": 0.34,
          "e_atk": 0.2,
          "e_attack_speed": 20,
          "e_max_stack_cnt": 1,
          "max_distance": 3
        },
        "bbStr": {},
        "rangeId": "x-2",
        "rangeGrid": [
          [
            2,
            -1
          ],
          [
            2,
            0
          ],
          [
            2,
            1
          ],
          [
            1,
            -2
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
            1,
            2
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
            -2
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
            -1,
            2
          ],
          [
            -2,
            -1
          ],
          [
            -2,
            0
          ],
          [
            -2,
            1
          ]
        ],
        "prefabId": "skchr_shu_3",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 2,
        "isDefault": true,
        "overrideTokenKey": null
      },
      "skills": [
        {
          "skillId": "skchr_shu_1",
          "iconId": "skchr_shu_1",
          "name": "化被草木",
          "level": 7,
          "desc": "下一次攻击会为周围血量不足一半的一名友方单位恢复相当于攻击力150%的生命\n可充能2次",
          "descRaw": "下一次攻击会为周围血量不足一半的一名友方单位恢复相当于攻击力<@ba.vup>{heal_scale:0%}</>的生命\\n<@ba.rem>可充能{ct}次</>",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 5,
          "initSp": 0,
          "maxChargeTime": 2,
          "increment": 1,
          "bb": {
            "heal_scale": 1.5,
            "ct": 2
          },
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
          "prefabId": "skchr_shu_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false,
          "overrideTokenKey": null
        },
        {
          "skillId": "skchr_shu_2",
          "iconId": "skchr_shu_2",
          "name": "嘉禾盈仓",
          "level": 7,
          "desc": "停止攻击专注治疗范围内至多两名我方单位，攻击力+90%，阻挡数+1，第一天赋效果提升至1.4倍\n治疗拥有特殊间隔",
          "descRaw": "<@ba.vdown>停止</>攻击专注治疗范围内至多<@ba.vup>两名</>我方单位，攻击力<@ba.vup>+{atk:0%}</>，阻挡数<@ba.vup>+{block_cnt}</>，第一天赋效果提升至<@ba.vup>{extra_extend_scale}</>倍\\n<@ba.rem>治疗拥有特殊间隔</>",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 25,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 30,
          "initSp": 20,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.9,
            "extra_extend_scale": 1.4,
            "block_cnt": 1,
            "attack@max_target": 2,
            "base_attack_time": 1.3
          },
          "bbStr": {},
          "rangeId": "x-1",
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
          "prefabId": "skchr_shu_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false,
          "overrideTokenKey": null
        },
        {
          "skillId": "skchr_shu_3",
          "iconId": "skchr_shu_3",
          "name": "离离枯荣",
          "level": 7,
          "desc": "治疗范围扩大，攻击同时可治疗我方干员，攻击力+34%，有地面敌人处于播种地块时技能范围内的我方单位攻击力+20%、攻击速度+20，敌人经过播种地块时获得如下效果：当远离该地块超过3格时被传送回该地块",
          "descRaw": "治疗范围<@ba.vup>扩大</>，攻击同时可治疗我方干员，攻击力<@ba.vup>+{atk:0%}</>，有地面敌人处于播种地块时技能范围内的我方单位攻击力<@ba.vup>+{e_atk:0%}</>、攻击速度<@ba.vup>+{e_attack_speed}</>，敌人经过播种地块时获得如下效果：当远离该地块超过<@ba.vup>{max_distance}</>格时被传送回该地块",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 30,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 50,
          "initSp": 30,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.34,
            "e_atk": 0.2,
            "e_attack_speed": 20,
            "e_max_stack_cnt": 1,
            "max_distance": 3
          },
          "bbStr": {},
          "rangeId": "x-2",
          "rangeGrid": [
            [
              2,
              -1
            ],
            [
              2,
              0
            ],
            [
              2,
              1
            ],
            [
              1,
              -2
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
              1,
              2
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
              -2
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
              -1,
              2
            ],
            [
              -2,
              -1
            ],
            [
              -2,
              0
            ],
            [
              -2,
              1
            ]
          ],
          "prefabId": "skchr_shu_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": true,
          "overrideTokenKey": null
        }
      ],
      "module": {
        "id": "uniequip_002_shu",
        "name": "“钦天司时”",
        "type": "GUA-X",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_shu",
          "name": "“钦天司时”",
          "typeName": "GUA-X",
          "isDefault": true,
          "level": 1,
          "attr": {
            "maxHp": 160,
            "atk": 30,
            "def": 30
          },
          "traitOverride": {
            "desc": "技能可以治疗友方单位",
            "descRaw": "技能可以治疗友方单位",
            "bb": {
              "heal_scale": 1.15,
              "hp_ratio": 0.5
            },
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "治疗生命值低于50%的友方单位时治疗量提升15%"
          },
          "talentChanges": []
        }
      ],
      "assets": {
        "avatar": "char_2025_shu_2",
        "portrait": "char_2025_shu_2",
        "spine": "char_2025_shu",
        "skillIcon": "skchr_shu_3",
        "subProfIcon": "sub_guardian_icon"
      },
      "expansionBatch": "arknights-expansion-v1"
    },
    "chess_exp_aglna2_a": {
      "chessId": "chess_exp_aglna2_a",
      "baseId": "chess_exp_aglna2_a",
      "goldenId": "chess_exp_aglna2_b",
      "isGolden": false,
      "tier": 6,
      "identifier": 10006,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1006,
      "charId": "char_1015_aglna2",
      "name": "予愿安洁莉娜",
      "appellation": "Angelina the Mellow Wish",
      "rarity": "TIER_6",
      "profession": "SPECIAL",
      "subProfessionId": "skywalker",
      "subProfessionName": "巡空者",
      "position": "MELEE",
      "nationId": "rhodes",
      "bonds": [
        "siracusaShip",
        "skillfulShip"
      ],
      "garrisonIds": [
        "exp_aglna2_growth_a"
      ],
      "price": 4,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_exp_aglna2_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 1884,
        "atk": 628,
        "def": 410,
        "res": 0,
        "cost": 18,
        "blockCnt": 2,
        "bat": 1.5,
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
      "statsBase": {
        "maxHp": 1884,
        "atk": 628,
        "def": 410,
        "res": 0,
        "cost": 18,
        "blockCnt": 2,
        "bat": 1.5,
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
      "rangeId": "2-2",
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
        ]
      ],
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": true,
      "targetPriority": null,
      "trait": {
        "desc": "起飞后能够阻挡2个飞行敌人",
        "descRaw": "<$ba.liftoff>起飞</>后能够阻挡2个飞行敌人",
        "bb": {
          "height_offset": 0.8
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "起飞后能够阻挡2个飞行敌人",
        "descRaw": "<$ba.liftoff>起飞</>后能够阻挡2个飞行敌人",
        "bb": {
          "height_offset": 0.8
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "飘浮大地之上",
          "desc": "予愿安洁莉娜攻击额外造成相当于攻击力25%的法术伤害，攻击重量较轻（小于等于3）的敌人时则额外造成相当于攻击力35%的法术伤害；处于起飞状态时使攻击范围内的敌人失重",
          "descRaw": "予愿安洁莉娜攻击额外造成相当于攻击力25%的法术伤害，攻击重量较轻（小于等于3）的敌人时则额外造成相当于攻击力35%的法术伤害；处于<$ba.liftoff>起飞</>状态时使攻击范围内的敌人<$ba.weightless>失重</>",
          "bb": {
            "atk_scale_hi": 0.35,
            "atk_scale_lo": 0.25,
            "mass_level": 3
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "天穹间的舞步",
          "desc": "在场时，所有处于起飞状态的友方干员攻击力+13%且阻挡时每秒回复8%的最大生命值",
          "descRaw": "在场时，所有处于<$ba.liftoff>起飞</>状态的友方干员攻击力+13%且阻挡时每秒回复8%的最大生命值",
          "bb": {
            "atk": 0.13,
            "hp_recovery_per_sec_by_max_hp_ratio": 0.08
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "飘浮大地之上",
          "desc": "予愿安洁莉娜攻击额外造成相当于攻击力25%的法术伤害，攻击重量较轻（小于等于3）的敌人时则额外造成相当于攻击力35%的法术伤害；处于起飞状态时使攻击范围内的敌人失重",
          "descRaw": "予愿安洁莉娜攻击额外造成相当于攻击力25%的法术伤害，攻击重量较轻（小于等于3）的敌人时则额外造成相当于攻击力35%的法术伤害；处于<$ba.liftoff>起飞</>状态时使攻击范围内的敌人<$ba.weightless>失重</>",
          "bb": {
            "atk_scale_hi": 0.35,
            "atk_scale_lo": 0.25,
            "mass_level": 3
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "天穹间的舞步",
          "desc": "在场时，所有处于起飞状态的友方干员攻击力+13%且阻挡时每秒回复8%的最大生命值",
          "descRaw": "在场时，所有处于<$ba.liftoff>起飞</>状态的友方干员攻击力+13%且阻挡时每秒回复8%的最大生命值",
          "bb": {
            "atk": 0.13,
            "hp_recovery_per_sec_by_max_hp_ratio": 0.08
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_aglna2_1",
        "iconId": "skchr_aglna2_1",
        "name": "极速送达",
        "level": 4,
        "desc": "部署后立刻起飞，攻击范围扩大，攻击力+75%，同时攻击两个目标",
        "descRaw": "部署后立刻<$ba.liftoff>起飞</>，攻击范围<@ba.vup>扩大</>，攻击力<@ba.vup>+{atk:0%}</>，同时攻击两个目标",
        "skillType": "PASSIVE",
        "durationType": "NONE",
        "duration": 56,
        "spType": 8,
        "spCost": 0,
        "initSp": 0,
        "maxChargeTime": 0,
        "increment": 0,
        "bb": {
          "atk": 0.75,
          "attack@max_target": 2
        },
        "bbStr": {},
        "rangeId": "3-6",
        "rangeGrid": [
          [
            1,
            0
          ],
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
            -1,
            0
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
        "prefabId": "skchr_aglna2_1",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 0,
        "isDefault": true,
        "overrideTokenKey": null
      },
      "skills": [
        {
          "skillId": "skchr_aglna2_1",
          "iconId": "skchr_aglna2_1",
          "name": "极速送达",
          "level": 4,
          "desc": "部署后立刻起飞，攻击范围扩大，攻击力+75%，同时攻击两个目标",
          "descRaw": "部署后立刻<$ba.liftoff>起飞</>，攻击范围<@ba.vup>扩大</>，攻击力<@ba.vup>+{atk:0%}</>，同时攻击两个目标",
          "skillType": "PASSIVE",
          "durationType": "NONE",
          "duration": 56,
          "spType": 8,
          "spCost": 0,
          "initSp": 0,
          "maxChargeTime": 0,
          "increment": 0,
          "bb": {
            "atk": 0.75,
            "attack@max_target": 2
          },
          "bbStr": {},
          "rangeId": "3-6",
          "rangeGrid": [
            [
              1,
              0
            ],
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
              -1,
              0
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
          "prefabId": "skchr_aglna2_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": true,
          "overrideTokenKey": null
        },
        {
          "skillId": "skchr_aglna2_2",
          "iconId": "skchr_aglna2_2",
          "name": "重力自定义",
          "level": 4,
          "desc": "攻击范围扩大并向前方滑翔起飞，使掠过的攻击范围内的地面敌人浮空10秒、飞行敌人缚地20秒，随后攻击间隔缩短，攻击力+105%，攻击变为法术伤害且同时攻击4个目标",
          "descRaw": "攻击范围<@ba.vup>扩大</>并向前方滑翔<$ba.liftoff>起飞</>，使掠过的攻击范围内的地面敌人<$ba.levitate>浮空</><@ba.vup>{buff_duration_levitate}</>秒、飞行敌人<$ba.groundbind>缚地</><@ba.vup>{buff_duration_ground_bound}</>秒，随后攻击间隔<@ba.vup>缩短</>，攻击力<@ba.vup>+{atk:0%}</>，攻击变为法术伤害且同时攻击<@ba.vup>{attack@max_target}</>个目标",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 22,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 32,
          "initSp": 17,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 1.05,
            "base_attack_time": -0.6,
            "attack@max_target": 4,
            "chant_duration": 2.5,
            "mass_level": 10,
            "buff_duration_ground_bound": 20,
            "buff_duration_levitate": 10
          },
          "bbStr": {},
          "rangeId": "3-10",
          "rangeGrid": [
            [
              1,
              0
            ],
            [
              1,
              1
            ],
            [
              1,
              2
            ],
            [
              1,
              3
            ],
            [
              1,
              4
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
              0,
              4
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
              -1,
              2
            ],
            [
              -1,
              3
            ],
            [
              -1,
              4
            ]
          ],
          "prefabId": "skchr_aglna2_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false,
          "overrideTokenKey": null
        },
        {
          "skillId": "skchr_aglna2_3",
          "iconId": "skchr_aglna2_3",
          "name": "酸橙的心事",
          "level": 4,
          "desc": "立刻起飞，攻击力+20%，获得55%的对空庇护，攻击范围扩大，且周围8格视作予愿安洁莉娜的额外攻击范围，攻击对3个敌人造成攻击力275%的物理伤害且额外攻击1个飞行敌人；范围内飞行敌人移动速度-40%，原技能范围内有未被阻挡的可阻挡飞行敌人，且自身未阻挡时，移动至该敌人所在格\n攻击装有30发弹药，打完后技能结束（期间可随时停止技能）",
          "descRaw": "立刻<$ba.liftoff>起飞</>，攻击力<@ba.vup>+{atk:0%}</>，获得<@ba.vup>{damage_resistance:0%}</>的<$ba.airprotect>对空庇护</>，攻击范围<@ba.vup>扩大</>，且周围8格视作予愿安洁莉娜的额外攻击范围，攻击对<@ba.vup>{attack@max_walk_target}</>个敌人造成攻击力<@ba.vup>{attack@atk_scale:0%}</>的物理伤害且额外攻击1个飞行敌人；范围内飞行敌人移动速度<@ba.vup>{move_speed:0%}</>，<@ba.vup>原技能范围</>内有未被阻挡的可阻挡飞行敌人，且自身未阻挡时，<$ba.addash>移动</>至该敌人所在格\\n<@ba.rem>攻击装有{attack@trigger_time}发弹药，打完后技能结束（期间可随时停止技能）</>",
          "skillType": "MANUAL",
          "durationType": "AMMO",
          "duration": -1,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 42,
          "initSp": 19,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "attack@atk_scale": 2.75,
            "attack@max_target": 4,
            "move_speed": -0.4,
            "aglna2_s_3[unblocked].attack_speed": 0,
            "aglna2_s_3[blocked].attack_speed": 0,
            "atk": 0.2,
            "damage_resistance": 0.55,
            "attack@attack_range_id": 0,
            "attack@max_walk_target": 3,
            "attack@trigger_time": 30
          },
          "bbStr": {
            "attack@attack_range_id": "x-4"
          },
          "rangeId": "3-9",
          "rangeGrid": [
            [
              2,
              0
            ],
            [
              2,
              1
            ],
            [
              2,
              2
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
              1,
              2
            ],
            [
              1,
              3
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
              0,
              4
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
              -1,
              2
            ],
            [
              -1,
              3
            ],
            [
              -2,
              0
            ],
            [
              -2,
              1
            ],
            [
              -2,
              2
            ]
          ],
          "prefabId": "skchr_aglna2_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": false,
          "overrideTokenKey": "token_10071_aglna2_agairp"
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_1015_aglna2",
        "portrait": "char_1015_aglna2_1",
        "spine": "char_1015_aglna2",
        "skillIcon": "skchr_aglna2_1",
        "subProfIcon": "sub_skywalker_icon"
      },
      "expansionBatch": "arknights-expansion-v1"
    },
    "chess_exp_aglna2_b": {
      "chessId": "chess_exp_aglna2_b",
      "baseId": "chess_exp_aglna2_a",
      "goldenId": "chess_exp_aglna2_b",
      "isGolden": true,
      "tier": 6,
      "identifier": 10006,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1006,
      "charId": "char_1015_aglna2",
      "name": "予愿安洁莉娜",
      "appellation": "Angelina the Mellow Wish",
      "rarity": "TIER_6",
      "profession": "SPECIAL",
      "subProfessionId": "skywalker",
      "subProfessionName": "巡空者",
      "position": "MELEE",
      "nationId": "rhodes",
      "bonds": [
        "siracusaShip",
        "skillfulShip"
      ],
      "garrisonIds": [
        "exp_aglna2_growth_b"
      ],
      "price": 4,
      "sellPrice": 4,
      "upgradeNum": 3,
      "upgradeChessId": null,
      "status": {
        "phase": 2,
        "level": 60,
        "skillLevel": 7,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 2216,
        "atk": 739,
        "def": 483,
        "res": 0,
        "cost": 18,
        "blockCnt": 2,
        "bat": 1.5,
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
      "statsBase": {
        "maxHp": 2216,
        "atk": 739,
        "def": 483,
        "res": 0,
        "cost": 18,
        "blockCnt": 2,
        "bat": 1.5,
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
      "rangeId": "2-2",
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
        ]
      ],
      "immunities": {
        "stun": false,
        "silence": false,
        "sleep": false,
        "frozen": false,
        "levitate": false
      },
      "dmgType": "phys",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": true,
      "targetPriority": null,
      "trait": {
        "desc": "起飞后能够阻挡2个飞行敌人",
        "descRaw": "<$ba.liftoff>起飞</>后能够阻挡2个飞行敌人",
        "bb": {
          "height_offset": 0.8
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "起飞后能够阻挡2个飞行敌人",
        "descRaw": "<$ba.liftoff>起飞</>后能够阻挡2个飞行敌人",
        "bb": {
          "height_offset": 0.8
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "飘浮大地之上",
          "desc": "予愿安洁莉娜攻击额外造成相当于攻击力25%的法术伤害，攻击重量较轻（小于等于3）的敌人时则额外造成相当于攻击力35%的法术伤害；处于起飞状态时使攻击范围内的敌人失重",
          "descRaw": "予愿安洁莉娜攻击额外造成相当于攻击力25%的法术伤害，攻击重量较轻（小于等于3）的敌人时则额外造成相当于攻击力35%的法术伤害；处于<$ba.liftoff>起飞</>状态时使攻击范围内的敌人<$ba.weightless>失重</>",
          "bb": {
            "atk_scale_hi": 0.35,
            "atk_scale_lo": 0.25,
            "mass_level": 3
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "天穹间的舞步",
          "desc": "在场时，所有处于起飞状态的友方干员攻击力+13%且阻挡时每秒回复8%的最大生命值",
          "descRaw": "在场时，所有处于<$ba.liftoff>起飞</>状态的友方干员攻击力+13%且阻挡时每秒回复8%的最大生命值",
          "bb": {
            "atk": 0.13,
            "hp_recovery_per_sec_by_max_hp_ratio": 0.08
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "飘浮大地之上",
          "desc": "予愿安洁莉娜攻击额外造成相当于攻击力25%的法术伤害，攻击重量较轻（小于等于3）的敌人时则额外造成相当于攻击力35%的法术伤害；处于起飞状态时使攻击范围内的敌人失重",
          "descRaw": "予愿安洁莉娜攻击额外造成相当于攻击力25%的法术伤害，攻击重量较轻（小于等于3）的敌人时则额外造成相当于攻击力35%的法术伤害；处于<$ba.liftoff>起飞</>状态时使攻击范围内的敌人<$ba.weightless>失重</>",
          "bb": {
            "atk_scale_hi": 0.35,
            "atk_scale_lo": 0.25,
            "mass_level": 3
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "天穹间的舞步",
          "desc": "在场时，所有处于起飞状态的友方干员攻击力+13%且阻挡时每秒回复8%的最大生命值",
          "descRaw": "在场时，所有处于<$ba.liftoff>起飞</>状态的友方干员攻击力+13%且阻挡时每秒回复8%的最大生命值",
          "bb": {
            "atk": 0.13,
            "hp_recovery_per_sec_by_max_hp_ratio": 0.08
          },
          "bbStr": {},
          "rangeGrid": null,
          "tokenKey": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_aglna2_1",
        "iconId": "skchr_aglna2_1",
        "name": "极速送达",
        "level": 7,
        "desc": "部署后立刻起飞，攻击范围扩大，攻击力+100%，同时攻击两个目标",
        "descRaw": "部署后立刻<$ba.liftoff>起飞</>，攻击范围<@ba.vup>扩大</>，攻击力<@ba.vup>+{atk:0%}</>，同时攻击两个目标",
        "skillType": "PASSIVE",
        "durationType": "NONE",
        "duration": 56,
        "spType": 8,
        "spCost": 0,
        "initSp": 0,
        "maxChargeTime": 0,
        "increment": 0,
        "bb": {
          "atk": 1,
          "attack@max_target": 2
        },
        "bbStr": {},
        "rangeId": "3-6",
        "rangeGrid": [
          [
            1,
            0
          ],
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
            -1,
            0
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
        "prefabId": "skchr_aglna2_1",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 0,
        "isDefault": true,
        "overrideTokenKey": null
      },
      "skills": [
        {
          "skillId": "skchr_aglna2_1",
          "iconId": "skchr_aglna2_1",
          "name": "极速送达",
          "level": 7,
          "desc": "部署后立刻起飞，攻击范围扩大，攻击力+100%，同时攻击两个目标",
          "descRaw": "部署后立刻<$ba.liftoff>起飞</>，攻击范围<@ba.vup>扩大</>，攻击力<@ba.vup>+{atk:0%}</>，同时攻击两个目标",
          "skillType": "PASSIVE",
          "durationType": "NONE",
          "duration": 56,
          "spType": 8,
          "spCost": 0,
          "initSp": 0,
          "maxChargeTime": 0,
          "increment": 0,
          "bb": {
            "atk": 1,
            "attack@max_target": 2
          },
          "bbStr": {},
          "rangeId": "3-6",
          "rangeGrid": [
            [
              1,
              0
            ],
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
              -1,
              0
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
          "prefabId": "skchr_aglna2_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": true,
          "overrideTokenKey": null
        },
        {
          "skillId": "skchr_aglna2_2",
          "iconId": "skchr_aglna2_2",
          "name": "重力自定义",
          "level": 7,
          "desc": "攻击范围扩大并向前方滑翔起飞，使掠过的攻击范围内的地面敌人浮空12秒、飞行敌人缚地22秒，随后攻击间隔较大幅缩短，攻击力+135%，攻击变为法术伤害且同时攻击5个目标",
          "descRaw": "攻击范围<@ba.vup>扩大</>并向前方滑翔<$ba.liftoff>起飞</>，使掠过的攻击范围内的地面敌人<$ba.levitate>浮空</><@ba.vup>{buff_duration_levitate}</>秒、飞行敌人<$ba.groundbind>缚地</><@ba.vup>{buff_duration_ground_bound}</>秒，随后攻击间隔<@ba.vup>较大幅缩短</>，攻击力<@ba.vup>+{atk:0%}</>，攻击变为法术伤害且同时攻击<@ba.vup>{attack@max_target}</>个目标",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 22,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 29,
          "initSp": 20,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 1.35,
            "base_attack_time": -0.8,
            "attack@max_target": 5,
            "chant_duration": 2.5,
            "mass_level": 10,
            "buff_duration_ground_bound": 22,
            "buff_duration_levitate": 12
          },
          "bbStr": {},
          "rangeId": "3-10",
          "rangeGrid": [
            [
              1,
              0
            ],
            [
              1,
              1
            ],
            [
              1,
              2
            ],
            [
              1,
              3
            ],
            [
              1,
              4
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
              0,
              4
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
              -1,
              2
            ],
            [
              -1,
              3
            ],
            [
              -1,
              4
            ]
          ],
          "prefabId": "skchr_aglna2_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false,
          "overrideTokenKey": null
        },
        {
          "skillId": "skchr_aglna2_3",
          "iconId": "skchr_aglna2_3",
          "name": "酸橙的心事",
          "level": 7,
          "desc": "立刻起飞，攻击力+30%，获得60%的对空庇护，攻击范围扩大，且周围8格视作予愿安洁莉娜的额外攻击范围，攻击对3个敌人造成攻击力305%的物理伤害且额外攻击1个飞行敌人；范围内飞行敌人移动速度-40%，原技能范围内有未被阻挡的可阻挡飞行敌人，且自身未阻挡时，移动至该敌人所在格\n攻击装有31发弹药，打完后技能结束（期间可随时停止技能）",
          "descRaw": "立刻<$ba.liftoff>起飞</>，攻击力<@ba.vup>+{atk:0%}</>，获得<@ba.vup>{damage_resistance:0%}</>的<$ba.airprotect>对空庇护</>，攻击范围<@ba.vup>扩大</>，且周围8格视作予愿安洁莉娜的额外攻击范围，攻击对<@ba.vup>{attack@max_walk_target}</>个敌人造成攻击力<@ba.vup>{attack@atk_scale:0%}</>的物理伤害且额外攻击1个飞行敌人；范围内飞行敌人移动速度<@ba.vup>{move_speed:0%}</>，<@ba.vup>原技能范围</>内有未被阻挡的可阻挡飞行敌人，且自身未阻挡时，<$ba.addash>移动</>至该敌人所在格\\n<@ba.rem>攻击装有{attack@trigger_time}发弹药，打完后技能结束（期间可随时停止技能）</>",
          "skillType": "MANUAL",
          "durationType": "AMMO",
          "duration": -1,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 36,
          "initSp": 22,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "attack@atk_scale": 3.05,
            "attack@max_target": 4,
            "move_speed": -0.4,
            "aglna2_s_3[unblocked].attack_speed": 0,
            "aglna2_s_3[blocked].attack_speed": 0,
            "atk": 0.3,
            "damage_resistance": 0.6,
            "attack@attack_range_id": 0,
            "attack@max_walk_target": 3,
            "attack@trigger_time": 31
          },
          "bbStr": {
            "attack@attack_range_id": "x-4"
          },
          "rangeId": "3-9",
          "rangeGrid": [
            [
              2,
              0
            ],
            [
              2,
              1
            ],
            [
              2,
              2
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
              1,
              2
            ],
            [
              1,
              3
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
              0,
              4
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
              -1,
              2
            ],
            [
              -1,
              3
            ],
            [
              -2,
              0
            ],
            [
              -2,
              1
            ],
            [
              -2,
              2
            ]
          ],
          "prefabId": "skchr_aglna2_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": false,
          "overrideTokenKey": "token_10071_aglna2_agairp"
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_1015_aglna2_2",
        "portrait": "char_1015_aglna2_2",
        "spine": "char_1015_aglna2",
        "skillIcon": "skchr_aglna2_1",
        "subProfIcon": "sub_skywalker_icon"
      },
      "expansionBatch": "arknights-expansion-v1"
    }
  },
  "garrisons": {
    "exp_nian_growth_a": {
      "garrisonId": "exp_nian_growth_a",
      "name": "铸成新局",
      "eventType": "SERVER_PREP_FIN",
      "effectKey": "exp_nian_growth",
      "desc": "本轮年在作战区时首次完成真实精锐合成取得资格；休整结束，岁激活则岁＋3／6，否则坚守激活则坚守＋2／4，每家族每轮一次。",
      "bb": {},
      "bbStr": {
        "conditionkey": "character_target_inboard"
      },
      "owners": [
        "chess_exp_nian_a"
      ]
    },
    "exp_nian_growth_b": {
      "garrisonId": "exp_nian_growth_b",
      "name": "铸成新局",
      "eventType": "SERVER_PREP_FIN",
      "effectKey": "exp_nian_growth",
      "desc": "本轮年在作战区时首次完成真实精锐合成取得资格；休整结束，岁激活则岁＋3／6，否则坚守激活则坚守＋2／4，每家族每轮一次。",
      "bb": {},
      "bbStr": {
        "conditionkey": "character_target_inboard"
      },
      "owners": [
        "chess_exp_nian_b"
      ]
    },
    "exp_ling_growth_a": {
      "garrisonId": "exp_ling_growth_a",
      "name": "随梦成章",
      "eventType": "SERVER_PREP_FIN",
      "effectKey": "exp_ling_growth",
      "desc": "休整结束，岁已激活，按不同岁成员数n获得min(n−1,4)／min(2(n−1),8)岁；每家族每轮一次。",
      "bb": {},
      "bbStr": {
        "conditionkey": "character_target_inboard"
      },
      "owners": [
        "chess_exp_ling_a"
      ]
    },
    "exp_ling_growth_b": {
      "garrisonId": "exp_ling_growth_b",
      "name": "随梦成章",
      "eventType": "SERVER_PREP_FIN",
      "effectKey": "exp_ling_growth",
      "desc": "休整结束，岁已激活，按不同岁成员数n获得min(n−1,4)／min(2(n−1),8)岁；每家族每轮一次。",
      "bb": {},
      "bbStr": {
        "conditionkey": "character_target_inboard"
      },
      "owners": [
        "chess_exp_ling_b"
      ]
    },
    "exp_shu_growth_a": {
      "garrisonId": "exp_shu_growth_a",
      "name": "四时成序",
      "eventType": "SERVER_PREP_FIN",
      "effectKey": "exp_shu_growth",
      "desc": "休整结束，三种不同职业且岁激活则岁＋2／4；三名不同重装且坚守激活则坚守＋1／2；每家族每轮一次。",
      "bb": {},
      "bbStr": {
        "conditionkey": "character_target_inboard"
      },
      "owners": [
        "chess_exp_shu_a"
      ]
    },
    "exp_shu_growth_b": {
      "garrisonId": "exp_shu_growth_b",
      "name": "四时成序",
      "eventType": "SERVER_PREP_FIN",
      "effectKey": "exp_shu_growth",
      "desc": "休整结束，三种不同职业且岁激活则岁＋2／4；三名不同重装且坚守激活则坚守＋1／2；每家族每轮一次。",
      "bb": {},
      "bbStr": {
        "conditionkey": "character_target_inboard"
      },
      "owners": [
        "chess_exp_shu_b"
      ]
    },
    "exp_aglna2_growth_a": {
      "garrisonId": "exp_aglna2_growth_a",
      "name": "远路同行",
      "eventType": "SERVER_PREP_FIN",
      "effectKey": "exp_aglna2_growth",
      "desc": "休整结束，至少三名不同叙拉古跨三种职业且叙激活则叙＋2／4；四邻不同灵巧且灵巧激活则灵巧＋1／2；每家族每轮一次。",
      "bb": {},
      "bbStr": {
        "conditionkey": "character_target_inboard"
      },
      "owners": [
        "chess_exp_aglna2_a"
      ]
    },
    "exp_aglna2_growth_b": {
      "garrisonId": "exp_aglna2_growth_b",
      "name": "远路同行",
      "eventType": "SERVER_PREP_FIN",
      "effectKey": "exp_aglna2_growth",
      "desc": "休整结束，至少三名不同叙拉古跨三种职业且叙激活则叙＋2／4；四邻不同灵巧且灵巧激活则灵巧＋1／2；每家族每轮一次。",
      "bb": {},
      "bbStr": {
        "conditionkey": "character_target_inboard"
      },
      "owners": [
        "chess_exp_aglna2_b"
      ]
    }
  },
  "tokens": {
    "token_10020_ling_soul1": {
      "tokenId": "token_10020_ling_soul1",
      "kind": "summon",
      "name": "“清平”",
      "appellation": "Tranquility",
      "desc": "能够阻挡一个敌人",
      "profession": "TOKEN",
      "subProfessionId": "notchar1",
      "position": "MELEE",
      "placeable": true,
      "ownerRange": false,
      "owners": [
        "chess_exp_ling_a",
        "chess_exp_ling_b"
      ],
      "stats": {
        "maxHp": 2225,
        "atk": 489,
        "def": 312,
        "res": 0,
        "cost": 12,
        "blockCnt": 1,
        "bat": 1.25,
        "aspd": 100,
        "respawnTime": 10,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 3,
        "deckStack": 5
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
      "canHitFly": false,
      "projectile": "none",
      "deployLimit": 3,
      "count": 5,
      "abnormal": [
        "healFree"
      ],
      "variants": {
        "chess_exp_ling_a": {
          "phase": 2,
          "level": 1,
          "stats": {
            "maxHp": 2225,
            "atk": 489,
            "def": 312,
            "res": 0,
            "cost": 12,
            "blockCnt": 1,
            "bat": 1.25,
            "aspd": 100,
            "respawnTime": 10,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 3,
            "deckStack": 5
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
            "desc": "能够阻挡一个敌人",
            "bb": {}
          },
          "talents": [],
          "dmgType": "phys",
          "attackKind": "melee",
          "projectile": "none",
          "canHitFly": false,
          "immunities": {},
          "skill": null,
          "count": 5,
          "sources": [],
          "bySkill": {
            "0": {
              "count": 5,
              "sources": [
                "talent",
                "skill"
              ]
            },
            "1": {
              "count": 0,
              "sources": []
            },
            "2": {
              "count": 0,
              "sources": []
            }
          },
          "byModule": {
            "none": {
              "stats": {
                "maxHp": 2225,
                "atk": 489,
                "def": 312,
                "res": 0,
                "cost": 12,
                "blockCnt": 1,
                "bat": 1.25,
                "aspd": 100,
                "respawnTime": 10,
                "spRecovery": 1,
                "hpRecoveryPerSec": 0,
                "moveSpeed": 1,
                "tauntLevel": 0,
                "massLevel": 0,
                "deployLimit": 3,
                "deckStack": 5
              },
              "count": 5
            }
          }
        },
        "chess_exp_ling_b": {
          "phase": 2,
          "level": 60,
          "stats": {
            "maxHp": 2407,
            "atk": 529,
            "def": 338,
            "res": 0,
            "cost": 9,
            "blockCnt": 1,
            "bat": 1.25,
            "aspd": 100,
            "respawnTime": 10,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 3,
            "deckStack": 8
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
            "desc": "能够阻挡一个敌人",
            "bb": {}
          },
          "talents": [],
          "dmgType": "phys",
          "attackKind": "melee",
          "projectile": "none",
          "canHitFly": false,
          "immunities": {},
          "skill": null,
          "count": 8,
          "sources": [],
          "bySkill": {
            "0": {
              "count": 8,
              "sources": [
                "talent",
                "skill"
              ]
            },
            "1": {
              "count": 0,
              "sources": []
            },
            "2": {
              "count": 0,
              "sources": []
            }
          },
          "byModule": {
            "none": {
              "stats": {
                "maxHp": 2407,
                "atk": 529,
                "def": 338,
                "res": 0,
                "cost": 12,
                "blockCnt": 1,
                "bat": 1.25,
                "aspd": 100,
                "respawnTime": 10,
                "spRecovery": 1,
                "hpRecoveryPerSec": 0,
                "moveSpeed": 1,
                "tauntLevel": 0,
                "massLevel": 0,
                "deployLimit": 3,
                "deckStack": 5
              },
              "count": 5
            }
          }
        }
      },
      "assets": {
        "avatar": "token_10020_ling_soul1",
        "spine": "token_10020_ling_soul1"
      },
      "expansionBatch": "arknights-expansion-v1"
    },
    "token_10020_ling_soul2": {
      "tokenId": "token_10020_ling_soul2",
      "kind": "summon",
      "name": "“逍遥”",
      "appellation": "Peripateticism",
      "desc": "攻击造成法术伤害",
      "profession": "TOKEN",
      "subProfessionId": "notchar1",
      "position": "RANGED",
      "placeable": true,
      "ownerRange": false,
      "owners": [
        "chess_exp_ling_a",
        "chess_exp_ling_b"
      ],
      "stats": {
        "maxHp": 1083,
        "atk": 361,
        "def": 110,
        "res": 20,
        "cost": 9,
        "blockCnt": 1,
        "bat": 1.6,
        "aspd": 100,
        "respawnTime": 10,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 3,
        "deckStack": 5
      },
      "rangeGrid": [
        [
          1,
          0
        ],
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
          0
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
      "dmgType": "arts",
      "attackKind": "ranged",
      "canHitFly": true,
      "projectile": "bolt",
      "deployLimit": 3,
      "count": 5,
      "abnormal": [
        "healFree"
      ],
      "variants": {
        "chess_exp_ling_a": {
          "phase": 2,
          "level": 1,
          "stats": {
            "maxHp": 1083,
            "atk": 361,
            "def": 110,
            "res": 20,
            "cost": 9,
            "blockCnt": 1,
            "bat": 1.6,
            "aspd": 100,
            "respawnTime": 10,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 3,
            "deckStack": 5
          },
          "rangeGrid": [
            [
              1,
              0
            ],
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
              0
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
          "trait": {
            "desc": "攻击造成法术伤害",
            "bb": {}
          },
          "talents": [],
          "dmgType": "arts",
          "attackKind": "ranged",
          "projectile": "bolt",
          "canHitFly": true,
          "immunities": {},
          "skill": null,
          "count": 5,
          "sources": [
            "talent",
            "skill"
          ],
          "bySkill": {
            "0": {
              "count": 0,
              "sources": []
            },
            "1": {
              "count": 5,
              "sources": [
                "talent",
                "skill"
              ]
            },
            "2": {
              "count": 0,
              "sources": []
            }
          },
          "byModule": {
            "none": {
              "stats": {
                "maxHp": 1083,
                "atk": 361,
                "def": 110,
                "res": 20,
                "cost": 9,
                "blockCnt": 1,
                "bat": 1.6,
                "aspd": 100,
                "respawnTime": 10,
                "spRecovery": 1,
                "hpRecoveryPerSec": 0,
                "moveSpeed": 1,
                "tauntLevel": 0,
                "massLevel": 0,
                "deployLimit": 3,
                "deckStack": 5
              },
              "count": 5
            }
          }
        },
        "chess_exp_ling_b": {
          "phase": 2,
          "level": 60,
          "stats": {
            "maxHp": 1172,
            "atk": 391,
            "def": 119,
            "res": 20,
            "cost": 6,
            "blockCnt": 1,
            "bat": 1.6,
            "aspd": 100,
            "respawnTime": 10,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 3,
            "deckStack": 8
          },
          "rangeGrid": [
            [
              1,
              0
            ],
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
              0
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
          "trait": {
            "desc": "攻击造成法术伤害",
            "bb": {}
          },
          "talents": [],
          "dmgType": "arts",
          "attackKind": "ranged",
          "projectile": "bolt",
          "canHitFly": true,
          "immunities": {},
          "skill": null,
          "count": 8,
          "sources": [
            "talent",
            "skill"
          ],
          "bySkill": {
            "0": {
              "count": 0,
              "sources": []
            },
            "1": {
              "count": 8,
              "sources": [
                "talent",
                "skill"
              ]
            },
            "2": {
              "count": 0,
              "sources": []
            }
          },
          "byModule": {
            "none": {
              "stats": {
                "maxHp": 1172,
                "atk": 391,
                "def": 119,
                "res": 20,
                "cost": 9,
                "blockCnt": 1,
                "bat": 1.6,
                "aspd": 100,
                "respawnTime": 10,
                "spRecovery": 1,
                "hpRecoveryPerSec": 0,
                "moveSpeed": 1,
                "tauntLevel": 0,
                "massLevel": 0,
                "deployLimit": 3,
                "deckStack": 5
              },
              "count": 5
            }
          }
        }
      },
      "assets": {
        "avatar": "token_10020_ling_soul2",
        "spine": "token_10020_ling_soul2"
      },
      "expansionBatch": "arknights-expansion-v1"
    },
    "token_10020_ling_soul3": {
      "tokenId": "token_10020_ling_soul3",
      "kind": "summon",
      "name": "“弦惊”",
      "appellation": "Thunderer",
      "desc": "攻击阻挡的所有敌人",
      "profession": "TOKEN",
      "subProfessionId": "notchar1",
      "position": "MELEE",
      "placeable": true,
      "ownerRange": false,
      "owners": [
        "chess_exp_ling_a",
        "chess_exp_ling_b"
      ],
      "stats": {
        "maxHp": 3210,
        "atk": 732,
        "def": 376,
        "res": 10,
        "cost": 23,
        "blockCnt": 2,
        "bat": 1.5,
        "aspd": 100,
        "respawnTime": 20,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 3,
        "deckStack": 5
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
      "canHitFly": false,
      "projectile": "none",
      "deployLimit": 3,
      "count": 5,
      "abnormal": [
        "healFree"
      ],
      "variants": {
        "chess_exp_ling_a": {
          "phase": 2,
          "level": 1,
          "stats": {
            "maxHp": 3210,
            "atk": 732,
            "def": 376,
            "res": 10,
            "cost": 23,
            "blockCnt": 2,
            "bat": 1.5,
            "aspd": 100,
            "respawnTime": 20,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 3,
            "deckStack": 5
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
            "desc": "攻击阻挡的所有敌人",
            "bb": {}
          },
          "talents": [],
          "dmgType": "phys",
          "attackKind": "melee",
          "projectile": "none",
          "canHitFly": false,
          "immunities": {},
          "skill": null,
          "count": 5,
          "sources": [],
          "bySkill": {
            "0": {
              "count": 0,
              "sources": []
            },
            "1": {
              "count": 0,
              "sources": []
            },
            "2": {
              "count": 5,
              "sources": [
                "talent",
                "skill"
              ]
            }
          },
          "byModule": {
            "none": {
              "stats": {
                "maxHp": 3210,
                "atk": 732,
                "def": 376,
                "res": 10,
                "cost": 23,
                "blockCnt": 2,
                "bat": 1.5,
                "aspd": 100,
                "respawnTime": 20,
                "spRecovery": 1,
                "hpRecoveryPerSec": 0,
                "moveSpeed": 1,
                "tauntLevel": 0,
                "massLevel": 0,
                "deployLimit": 3,
                "deckStack": 5
              },
              "count": 5
            }
          }
        },
        "chess_exp_ling_b": {
          "phase": 2,
          "level": 60,
          "stats": {
            "maxHp": 3473,
            "atk": 792,
            "def": 407,
            "res": 10,
            "cost": 18,
            "blockCnt": 2,
            "bat": 1.5,
            "aspd": 100,
            "respawnTime": 20,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 3,
            "deckStack": 8
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
            "desc": "攻击阻挡的所有敌人",
            "bb": {}
          },
          "talents": [],
          "dmgType": "phys",
          "attackKind": "melee",
          "projectile": "none",
          "canHitFly": false,
          "immunities": {},
          "skill": null,
          "count": 8,
          "sources": [],
          "bySkill": {
            "0": {
              "count": 0,
              "sources": []
            },
            "1": {
              "count": 0,
              "sources": []
            },
            "2": {
              "count": 8,
              "sources": [
                "talent",
                "skill"
              ]
            }
          },
          "byModule": {
            "none": {
              "stats": {
                "maxHp": 3473,
                "atk": 792,
                "def": 407,
                "res": 10,
                "cost": 23,
                "blockCnt": 2,
                "bat": 1.5,
                "aspd": 100,
                "respawnTime": 20,
                "spRecovery": 1,
                "hpRecoveryPerSec": 0,
                "moveSpeed": 1,
                "tauntLevel": 0,
                "massLevel": 0,
                "deployLimit": 3,
                "deckStack": 5
              },
              "count": 5
            }
          }
        }
      },
      "assets": {
        "avatar": "token_10020_ling_soul3",
        "spine": "token_10020_ling_soul3"
      },
      "expansionBatch": "arknights-expansion-v1"
    },
    "token_10020_ling_soul3_advanced": {
      "tokenId": "token_10020_ling_soul3_advanced",
      "kind": "summon",
      "name": "“弦惊”高级形态",
      "appellation": "Thunderer",
      "desc": "由两个基础弦惊合体，消耗两份令召唤额度，攻击阻挡的所有敌人并造成法术伤害。",
      "profession": "TOKEN",
      "subProfessionId": "notchar1",
      "position": "MELEE",
      "placeable": false,
      "ownerRange": false,
      "owners": [
        "chess_exp_ling_a",
        "chess_exp_ling_b"
      ],
      "stats": {
        "maxHp": 6420,
        "atk": 1318,
        "def": 677,
        "res": 20,
        "cost": 23,
        "blockCnt": 4,
        "bat": 2.3,
        "aspd": 100,
        "respawnTime": 20,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 3,
        "deckStack": 5
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
      "dmgType": "arts",
      "attackKind": "melee",
      "canHitFly": false,
      "projectile": "none",
      "deployLimit": 3,
      "count": 5,
      "abnormal": [
        "healFree"
      ],
      "variants": {
        "chess_exp_ling_a": {
          "phase": 2,
          "level": 1,
          "stats": {
            "maxHp": 6420,
            "atk": 1318,
            "def": 677,
            "res": 20,
            "cost": 23,
            "blockCnt": 4,
            "bat": 2.3,
            "aspd": 100,
            "respawnTime": 20,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 3,
            "deckStack": 5
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
            "desc": "攻击阻挡的所有敌人",
            "bb": {}
          },
          "talents": [],
          "dmgType": "arts",
          "attackKind": "melee",
          "projectile": "none",
          "canHitFly": false,
          "immunities": {},
          "skill": null,
          "count": 5,
          "sources": [],
          "bySkill": {
            "0": {
              "count": 0,
              "sources": []
            },
            "1": {
              "count": 0,
              "sources": []
            },
            "2": {
              "count": 0,
              "sources": []
            }
          },
          "byModule": {
            "none": {
              "stats": {
                "maxHp": 6420,
                "atk": 1318,
                "def": 677,
                "res": 20,
                "cost": 23,
                "blockCnt": 4,
                "bat": 2.3,
                "aspd": 100,
                "respawnTime": 20,
                "spRecovery": 1,
                "hpRecoveryPerSec": 0,
                "moveSpeed": 1,
                "tauntLevel": 0,
                "massLevel": 0,
                "deployLimit": 3,
                "deckStack": 5
              },
              "count": 5
            }
          }
        },
        "chess_exp_ling_b": {
          "phase": 2,
          "level": 60,
          "stats": {
            "maxHp": 6946,
            "atk": 1426,
            "def": 733,
            "res": 20,
            "cost": 18,
            "blockCnt": 4,
            "bat": 2.3,
            "aspd": 100,
            "respawnTime": 20,
            "spRecovery": 1,
            "hpRecoveryPerSec": 0,
            "moveSpeed": 1,
            "tauntLevel": 0,
            "massLevel": 0,
            "deployLimit": 3,
            "deckStack": 8
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
            "desc": "攻击阻挡的所有敌人",
            "bb": {}
          },
          "talents": [],
          "dmgType": "arts",
          "attackKind": "melee",
          "projectile": "none",
          "canHitFly": false,
          "immunities": {},
          "skill": null,
          "count": 8,
          "sources": [],
          "bySkill": {
            "0": {
              "count": 0,
              "sources": []
            },
            "1": {
              "count": 0,
              "sources": []
            },
            "2": {
              "count": 0,
              "sources": []
            }
          },
          "byModule": {
            "none": {
              "stats": {
                "maxHp": 6946,
                "atk": 1426,
                "def": 733,
                "res": 20,
                "cost": 23,
                "blockCnt": 4,
                "bat": 2.3,
                "aspd": 100,
                "respawnTime": 20,
                "spRecovery": 1,
                "hpRecoveryPerSec": 0,
                "moveSpeed": 1,
                "tauntLevel": 0,
                "massLevel": 0,
                "deployLimit": 3,
                "deckStack": 5
              },
              "count": 5
            }
          }
        }
      },
      "assets": {
        "avatar": "token_10020_ling_soul3",
        "spine": "token_10020_ling_soul3_advanced"
      },
      "expansionBatch": "arknights-expansion-v1"
    }
  },
  "bands": {
    "band_exp_nian": {
      "bandId": "band_exp_nian",
      "sortId": 100,
      "name": "年 · 锻造筹备",
      "iconId": "icon_band_exp_nian",
      "modeTypeList": [
        "LOCAL",
        "SINGLE",
        "MULTI"
      ],
      "totalHp": 27,
      "effectId": "effect_band_exp_nian",
      "effectName": "锻造筹备",
      "desc": "每轮首次主动刷新优先出现商店等级内未售空的岁成员，无可用岁则炎；每轮首次普通到精锐合成增加2岁，整局最多6次。",
      "descRaw": "每轮首次主动刷新优先出现商店等级内未售空的岁成员，无可用岁则炎；每轮首次普通到精锐合成增加2岁，整局最多6次。",
      "buffs": [],
      "params": {},
      "victorCount": 3,
      "rewardModulus": 1,
      "unlockDesc": null,
      "bondIds": [
        "suiShip"
      ],
      "expansionBatch": "arknights-expansion-v1"
    },
    "band_exp_bison": {
      "bandId": "band_exp_bison",
      "sortId": 101,
      "name": "拜松 · 护送排班",
      "iconId": "icon_band_exp_bison",
      "modeTypeList": [
        "LOCAL",
        "SINGLE",
        "MULTI"
      ],
      "totalHp": 26,
      "effectId": "effect_band_exp_bison",
      "effectName": "护送排班",
      "desc": "真实消费累计12／24且商店达到2／3级，分别获得普通可颂／空，各一次；从共享池取，无法获得时合法企鹅替代，仍无则一次免费刷新。",
      "descRaw": "真实消费累计12／24且商店达到2／3级，分别获得普通可颂／空，各一次；从共享池取，无法获得时合法企鹅替代，仍无则一次免费刷新。",
      "buffs": [],
      "params": {},
      "victorCount": 3,
      "rewardModulus": 1,
      "unlockDesc": null,
      "bondIds": [
        "penguinShip"
      ],
      "expansionBatch": "arknights-expansion-v1"
    },
    "band_exp_liangxun": {
      "bandId": "band_exp_liangxun",
      "sortId": 102,
      "name": "梁洵 · 统筹诸职",
      "iconId": "icon_band_exp_liangxun",
      "modeTypeList": [
        "LOCAL",
        "SINGLE",
        "MULTI"
      ],
      "totalHp": 28,
      "effectId": "effect_band_exp_liangxun",
      "effectName": "统筹诸职",
      "desc": "休整结束，三种不同职业下轮加1资金，三名不同同职业下轮加1免费刷新；两分支各最多4次，无下一轮不结算。",
      "descRaw": "休整结束，三种不同职业下轮加1资金，三名不同同职业下轮加1免费刷新；两分支各最多4次，无下一轮不结算。",
      "buffs": [],
      "params": {},
      "victorCount": 3,
      "rewardModulus": 1,
      "unlockDesc": null,
      "bondIds": [],
      "expansionBatch": "arknights-expansion-v1"
    }
  },
  "bonds": {
    "suiShip": {
      "bondId": "suiShip",
      "name": "岁",
      "identifier": 10002,
      "isCore": false,
      "bondType": "REGULAR",
      "bondOrder": 101,
      "iconId": "icon_suiShip",
      "activeCount": 2,
      "thresholds": [
        2,
        4
      ],
      "countMode": "BOARD",
      "countsHand": false,
      "countsGoldenOnly": false,
      "activeType": "BATTLE",
      "isActiveInDeck": false,
      "noStack": false,
      "weight": 0,
      "maxInactiveBondCount": -1,
      "desc": "不同真实岁成员在三秒窗口以有效攻击或直接治疗参与；两人后合击，八秒冷却；有效层数最多80。主目标法伤A×(2.2＋0.015L)，次目标60%；四岁额外主目标物伤A×(1.2＋0.01L)，次目标由2增至4。",
      "buffs": [],
      "bb": {
        "window": 3,
        "cooldown": 8,
        "layerCap": 80
      },
      "members": [],
      "visibleMembers": [],
      "expansionBatch": "arknights-expansion-v1"
    }
  },
  "oldSuiMembers": [
    "char_2015_dusk",
    "char_2026_yu"
  ],
  "oldPenguinMembers": [
    "char_102_texas",
    "char_103_angel",
    "char_213_mostma",
    "char_1041_angel2"
  ]
};
