// Generated from original GameData by tools/build-ursus.mjs.
export const OVERLAY = {
  "id": "ursus-expansion-v1",
  "version": "ursus-test-11",
  "chess": {
    "chess_ursus_brownb_a": {
      "chessId": "chess_ursus_brownb_a",
      "baseId": "chess_ursus_brownb_a",
      "goldenId": "chess_ursus_brownb_b",
      "isGolden": false,
      "tier": 1,
      "identifier": 15001,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1501,
      "charId": "char_137_brownb",
      "name": "猎蜂",
      "appellation": "Beehunter",
      "rarity": "TIER_4",
      "profession": "WARRIOR",
      "subProfessionId": "fighter",
      "subProfessionName": "斗士",
      "position": "MELEE",
      "nationId": "ursus",
      "teamId": null,
      "bonds": [
        "ursusShip",
        "swiftShip"
      ],
      "garrisonIds": [],
      "price": 2,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_ursus_brownb_b",
      "status": {
        "phase": 1,
        "level": 55,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 1959,
        "atk": 406,
        "def": 256,
        "res": 0,
        "cost": 9,
        "blockCnt": 1,
        "bat": 0.78,
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
        "maxHp": 1959,
        "atk": 406,
        "def": 256,
        "res": 0,
        "cost": 9,
        "blockCnt": 1,
        "bat": 0.78,
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
        "desc": "能够阻挡一个敌人",
        "descRaw": "能够阻挡一个敌人",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "能够阻挡一个敌人",
        "descRaw": "能够阻挡一个敌人",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "竞技专注",
          "desc": "攻击相同目标时每次攻击可提高自身攻击力3%，最多可叠加5层。更换目标会失去之前叠加的效果",
          "descRaw": "攻击相同目标时每次攻击可提高自身攻击力3%，最多可叠加5层。更换目标会失去之前叠加的效果",
          "bb": {
            "max_stack_cnt": 5,
            "atk": 0.03
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "竞技专注",
          "desc": "攻击相同目标时每次攻击可提高自身攻击力3%，最多可叠加5层。更换目标会失去之前叠加的效果",
          "descRaw": "攻击相同目标时每次攻击可提高自身攻击力3%，最多可叠加5层。更换目标会失去之前叠加的效果",
          "bb": {
            "max_stack_cnt": 5,
            "atk": 0.03
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_brownb_2",
        "iconId": "skchr_brownb_2",
        "name": "急速拳",
        "level": 4,
        "desc": "攻击间隔较大幅度减小",
        "descRaw": "攻击间隔较大幅度减小",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 10,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 35,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "base_attack_time": -0.55
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_brownb_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_brownb_1",
          "iconId": "skchr_brownb_1",
          "name": "高机动",
          "level": 4,
          "desc": "获得30%的物理闪避",
          "descRaw": "获得30%的物理闪避",
          "skillType": "PASSIVE",
          "durationType": "NONE",
          "duration": 0,
          "spType": 8,
          "spCost": 0,
          "initSp": 0,
          "maxChargeTime": 0,
          "increment": 0,
          "bb": {
            "prob": 0.3
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_brownb_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_brownb_2",
          "iconId": "skchr_brownb_2",
          "name": "急速拳",
          "level": 4,
          "desc": "攻击间隔较大幅度减小",
          "descRaw": "攻击间隔较大幅度减小",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 10,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 35,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "base_attack_time": -0.55
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_brownb_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_137_brownb",
        "portrait": "char_137_brownb_1",
        "spine": "char_137_brownb",
        "skillIcon": "skchr_brownb_2",
        "subProfIcon": "sub_fighter_icon"
      },
      "expansionBatch": "ursus-expansion-v1"
    },
    "chess_ursus_brownb_b": {
      "chessId": "chess_ursus_brownb_b",
      "baseId": "chess_ursus_brownb_a",
      "goldenId": "chess_ursus_brownb_b",
      "isGolden": true,
      "tier": 1,
      "identifier": 15001,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1501,
      "charId": "char_137_brownb",
      "name": "猎蜂",
      "appellation": "Beehunter",
      "rarity": "TIER_4",
      "profession": "WARRIOR",
      "subProfessionId": "fighter",
      "subProfessionName": "斗士",
      "position": "MELEE",
      "nationId": "ursus",
      "teamId": null,
      "bonds": [
        "ursusShip",
        "swiftShip"
      ],
      "garrisonIds": [],
      "price": 2,
      "sellPrice": 2,
      "upgradeNum": 3,
      "upgradeChessId": null,
      "status": {
        "phase": 2,
        "level": 50,
        "skillLevel": 7,
        "equipLevel": 1
      },
      "stats": {
        "maxHp": 2428,
        "atk": 515,
        "def": 298,
        "res": 0,
        "cost": 9,
        "blockCnt": 1,
        "bat": 0.78,
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
        "maxHp": 2308,
        "atk": 485,
        "def": 298,
        "res": 0,
        "cost": 9,
        "blockCnt": 1,
        "bat": 0.78,
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
        "desc": "能够阻挡一个敌人，生命值高于50%时攻击速度+10",
        "descRaw": "能够阻挡一个敌人",
        "bb": {
          "attack_speed": 10
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "能够阻挡一个敌人",
        "descRaw": "能够阻挡一个敌人",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "竞技专注",
          "desc": "攻击相同目标时每次攻击可提高自身攻击力5%，最多可叠加5层。更换目标会失去之前叠加的效果",
          "descRaw": "攻击相同目标时每次攻击可提高自身攻击力5%，最多可叠加5层。更换目标会失去之前叠加的效果",
          "bb": {
            "max_stack_cnt": 5,
            "atk": 0.05
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "竞技专注",
          "desc": "攻击相同目标时每次攻击可提高自身攻击力5%，最多可叠加5层。更换目标会失去之前叠加的效果",
          "descRaw": "攻击相同目标时每次攻击可提高自身攻击力5%，最多可叠加5层。更换目标会失去之前叠加的效果",
          "bb": {
            "max_stack_cnt": 5,
            "atk": 0.05
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_brownb_2",
        "iconId": "skchr_brownb_2",
        "name": "急速拳",
        "level": 7,
        "desc": "攻击间隔较大幅度减小",
        "descRaw": "攻击间隔较大幅度减小",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 10,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 30,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "base_attack_time": -0.55
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_brownb_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_brownb_1",
          "iconId": "skchr_brownb_1",
          "name": "高机动",
          "level": 7,
          "desc": "获得40%的物理闪避",
          "descRaw": "获得40%的物理闪避",
          "skillType": "PASSIVE",
          "durationType": "NONE",
          "duration": 0,
          "spType": 8,
          "spCost": 0,
          "initSp": 0,
          "maxChargeTime": 0,
          "increment": 0,
          "bb": {
            "prob": 0.4
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_brownb_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_brownb_2",
          "iconId": "skchr_brownb_2",
          "name": "急速拳",
          "level": 7,
          "desc": "攻击间隔较大幅度减小",
          "descRaw": "攻击间隔较大幅度减小",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 10,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 30,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "base_attack_time": -0.55
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_brownb_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        }
      ],
      "module": {
        "id": "uniequip_002_brownb",
        "name": "咬紧牙关",
        "type": "FGT-Y",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_brownb",
          "name": "咬紧牙关",
          "typeName": "FGT-Y",
          "isDefault": true,
          "level": 1,
          "attr": {
            "maxHp": 120,
            "atk": 30
          },
          "traitOverride": {
            "desc": "能够阻挡一个敌人，生命值高于50%时攻击速度+10",
            "descRaw": "能够阻挡一个敌人",
            "bb": {
              "attack_speed": 10
            },
            "bbStr": {},
            "rangeGrid": null
          },
          "talentChanges": []
        }
      ],
      "assets": {
        "avatar": "char_137_brownb_2",
        "portrait": "char_137_brownb_2",
        "spine": "char_137_brownb",
        "skillIcon": "skchr_brownb_2",
        "subProfIcon": "sub_fighter_icon"
      },
      "expansionBatch": "ursus-expansion-v1"
    },
    "chess_ursus_headbr_a": {
      "chessId": "chess_ursus_headbr_a",
      "baseId": "chess_ursus_headbr_a",
      "goldenId": "chess_ursus_headbr_b",
      "isGolden": false,
      "tier": 2,
      "identifier": 15002,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1502,
      "charId": "char_115_headbr",
      "name": "凛冬",
      "appellation": "Зима",
      "rarity": "TIER_5",
      "profession": "PIONEER",
      "subProfessionId": "pioneer",
      "subProfessionName": "尖兵",
      "position": "MELEE",
      "nationId": "ursus",
      "teamId": "student",
      "bonds": [
        "ursusShip",
        "indomShip",
        "ursusStudentShip"
      ],
      "garrisonIds": [],
      "price": 3,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_ursus_headbr_b",
      "status": {
        "phase": 1,
        "level": 60,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 1450,
        "atk": 361,
        "def": 279,
        "res": 0,
        "cost": 13,
        "blockCnt": 2,
        "bat": 1.05,
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
        "maxHp": 1450,
        "atk": 361,
        "def": 279,
        "res": 0,
        "cost": 13,
        "blockCnt": 2,
        "bat": 1.05,
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
        "desc": "能够阻挡两个敌人",
        "descRaw": "能够阻挡两个敌人",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "能够阻挡两个敌人",
        "descRaw": "能够阻挡两个敌人",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "冲锋领袖",
          "desc": "自身部署费用-1",
          "descRaw": "自身部署费用-1",
          "bb": {
            "cost": -1
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "冲锋领袖",
          "desc": "自身部署费用-1",
          "descRaw": "自身部署费用-1",
          "bb": {
            "cost": -1
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_headbr_2",
        "iconId": "skchr_headbr_2",
        "name": "乌萨斯战吼",
        "level": 4,
        "desc": "技能持续时间内逐渐获得10点部署费用\n所有先锋干员攻击力和防御力+35%，并在击杀敌人时额外获得1点部署费用",
        "descRaw": "技能持续时间内逐渐获得10点部署费用\n所有先锋干员攻击力和防御力+35%，并在击杀敌人时额外获得1点部署费用",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 10,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 42,
        "initSp": 12,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "value": 10,
          "atk": 0.35,
          "def": 0.35,
          "interval": 1,
          "cost": 1
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_headbr_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skcom_charge_cost[3]",
          "iconId": "skcom_charge_cost[3]",
          "name": "冲锋号令·γ型",
          "level": 4,
          "desc": "立即获得12点部署费用",
          "descRaw": "立即获得12点部署费用",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 41,
          "initSp": 12,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "cost": 12
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skcom_charge_cost",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_headbr_2",
          "iconId": "skchr_headbr_2",
          "name": "乌萨斯战吼",
          "level": 4,
          "desc": "技能持续时间内逐渐获得10点部署费用\n所有先锋干员攻击力和防御力+35%，并在击杀敌人时额外获得1点部署费用",
          "descRaw": "技能持续时间内逐渐获得10点部署费用\n所有先锋干员攻击力和防御力+35%，并在击杀敌人时额外获得1点部署费用",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 10,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 42,
          "initSp": 12,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "value": 10,
            "atk": 0.35,
            "def": 0.35,
            "interval": 1,
            "cost": 1
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_headbr_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_115_headbr",
        "portrait": "char_115_headbr_1",
        "spine": "char_115_headbr",
        "skillIcon": "skchr_headbr_2",
        "subProfIcon": "sub_pioneer_icon"
      },
      "expansionBatch": "ursus-expansion-v1"
    },
    "chess_ursus_headbr_b": {
      "chessId": "chess_ursus_headbr_b",
      "baseId": "chess_ursus_headbr_a",
      "goldenId": "chess_ursus_headbr_b",
      "isGolden": true,
      "tier": 2,
      "identifier": 15002,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1502,
      "charId": "char_115_headbr",
      "name": "凛冬",
      "appellation": "Зима",
      "rarity": "TIER_5",
      "profession": "PIONEER",
      "subProfessionId": "pioneer",
      "subProfessionName": "尖兵",
      "position": "MELEE",
      "nationId": "ursus",
      "teamId": "student",
      "bonds": [
        "ursusShip",
        "indomShip",
        "ursusStudentShip"
      ],
      "garrisonIds": [],
      "price": 3,
      "sellPrice": 3,
      "upgradeNum": 3,
      "upgradeChessId": null,
      "status": {
        "phase": 2,
        "level": 55,
        "skillLevel": 7,
        "equipLevel": 1
      },
      "stats": {
        "maxHp": 2126,
        "atk": 440,
        "def": 363,
        "res": 0,
        "cost": 13,
        "blockCnt": 2,
        "bat": 1.05,
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
        "maxHp": 1946,
        "atk": 440,
        "def": 331,
        "res": 0,
        "cost": 13,
        "blockCnt": 2,
        "bat": 1.05,
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
        "desc": "能够阻挡两个敌人，阻挡敌人时攻击力和防御力各+8％",
        "descRaw": "能够阻挡两个敌人",
        "bb": {
          "atk": 0.08,
          "def": 0.08
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "能够阻挡两个敌人",
        "descRaw": "能够阻挡两个敌人",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "冲锋领袖",
          "desc": "编入队伍时所有【先锋】职业干员的部署费用-1",
          "descRaw": "编入队伍时所有【先锋】职业干员的部署费用-1",
          "bb": {
            "cost": -1
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "冲锋领袖",
          "desc": "编入队伍时所有【先锋】职业干员的部署费用-1",
          "descRaw": "编入队伍时所有【先锋】职业干员的部署费用-1",
          "bb": {
            "cost": -1
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_headbr_2",
        "iconId": "skchr_headbr_2",
        "name": "乌萨斯战吼",
        "level": 7,
        "desc": "技能持续时间内逐渐获得11点部署费用\n所有先锋干员攻击力和防御力+45%，并在击杀敌人时额外获得1点部署费用",
        "descRaw": "技能持续时间内逐渐获得11点部署费用\n所有先锋干员攻击力和防御力+45%，并在击杀敌人时额外获得1点部署费用",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 10,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 39,
        "initSp": 14,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "value": 11,
          "atk": 0.45,
          "def": 0.45,
          "interval": 0.905,
          "cost": 1
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_headbr_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skcom_charge_cost[3]",
          "iconId": "skcom_charge_cost[3]",
          "name": "冲锋号令·γ型",
          "level": 7,
          "desc": "立即获得12点部署费用",
          "descRaw": "立即获得12点部署费用",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 38,
          "initSp": 14,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "cost": 12
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skcom_charge_cost",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_headbr_2",
          "iconId": "skchr_headbr_2",
          "name": "乌萨斯战吼",
          "level": 7,
          "desc": "技能持续时间内逐渐获得11点部署费用\n所有先锋干员攻击力和防御力+45%，并在击杀敌人时额外获得1点部署费用",
          "descRaw": "技能持续时间内逐渐获得11点部署费用\n所有先锋干员攻击力和防御力+45%，并在击杀敌人时额外获得1点部署费用",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 10,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 39,
          "initSp": 14,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "value": 11,
            "atk": 0.45,
            "def": 0.45,
            "interval": 0.905,
            "cost": 1
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_headbr_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        }
      ],
      "module": {
        "id": "uniequip_002_headbr",
        "name": "冬将军的毕业礼物",
        "type": "SOL-X",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_headbr",
          "name": "冬将军的毕业礼物",
          "typeName": "SOL-X",
          "isDefault": true,
          "level": 1,
          "attr": {
            "maxHp": 180,
            "def": 32
          },
          "traitOverride": {
            "desc": "能够阻挡两个敌人，阻挡敌人时攻击力和防御力各+8％",
            "descRaw": "能够阻挡两个敌人",
            "bb": {
              "atk": 0.08,
              "def": 0.08
            },
            "bbStr": {},
            "rangeGrid": null
          },
          "talentChanges": []
        }
      ],
      "assets": {
        "avatar": "char_115_headbr_2",
        "portrait": "char_115_headbr_2",
        "spine": "char_115_headbr",
        "skillIcon": "skchr_headbr_2",
        "subProfIcon": "sub_pioneer_icon"
      },
      "expansionBatch": "ursus-expansion-v1"
    },
    "chess_ursus_wintim_a": {
      "chessId": "chess_ursus_wintim_a",
      "baseId": "chess_ursus_wintim_a",
      "goldenId": "chess_ursus_wintim_b",
      "isGolden": false,
      "tier": 2,
      "identifier": 15003,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1502,
      "charId": "char_4208_wintim",
      "name": "冬时",
      "appellation": "Снегурочка",
      "rarity": "TIER_4",
      "profession": "PIONEER",
      "subProfessionId": "agent",
      "subProfessionName": "情报官",
      "position": "MELEE",
      "nationId": "ursus",
      "teamId": null,
      "bonds": [
        "ursusShip",
        "skillfulShip"
      ],
      "garrisonIds": [],
      "price": 3,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_ursus_wintim_b",
      "status": {
        "phase": 1,
        "level": 60,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 1200,
        "atk": 451,
        "def": 195,
        "res": 0,
        "cost": 9,
        "blockCnt": 1,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 35,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "statsBase": {
        "maxHp": 1200,
        "atk": 451,
        "def": 195,
        "res": 0,
        "cost": 9,
        "blockCnt": 1,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 35,
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
      "attackKind": "ranged",
      "projectile": "bolt",
      "canHitFly": true,
      "targetPriority": null,
      "trait": {
        "desc": "再部署时间减少，可使用远程攻击",
        "descRaw": "再部署时间减少，可使用远程攻击",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "再部署时间减少，可使用远程攻击",
        "descRaw": "再部署时间减少，可使用远程攻击",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "疾笔撰录",
          "desc": "攻击速度+5，自身受到伤害后失去该效果",
          "descRaw": "攻击速度+5，自身受到伤害后失去该效果",
          "bb": {
            "attack_speed": 5
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "疾笔撰录",
          "desc": "攻击速度+5，自身受到伤害后失去该效果",
          "descRaw": "攻击速度+5，自身受到伤害后失去该效果",
          "bb": {
            "attack_speed": 5
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_wintim_2",
        "iconId": "skchr_wintim_2",
        "name": "循理归因",
        "level": 4,
        "desc": "攻击速度+16，每次攻击获得1点部署费用，并使目标停顿1秒",
        "descRaw": "攻击速度+16，每次攻击获得1点部署费用，并使目标停顿1秒",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 9,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 36,
        "initSp": 16,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "attack_speed": 16,
          "attack@sluggish": 1,
          "cost": 1
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_wintim_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_wintim_1",
          "iconId": "skchr_wintim_1",
          "name": "数据分析",
          "level": 4,
          "desc": "下次攻击造成相当于攻击力180%的物理伤害，并获得3点部署费用",
          "descRaw": "下次攻击造成相当于攻击力180%的物理伤害，并获得3点部署费用",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 8,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "cost": 3,
            "atk_scale": 1.8
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_wintim_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_wintim_2",
          "iconId": "skchr_wintim_2",
          "name": "循理归因",
          "level": 4,
          "desc": "攻击速度+16，每次攻击获得1点部署费用，并使目标停顿1秒",
          "descRaw": "攻击速度+16，每次攻击获得1点部署费用，并使目标停顿1秒",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 9,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 36,
          "initSp": 16,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "attack_speed": 16,
            "attack@sluggish": 1,
            "cost": 1
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_wintim_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_4208_wintim",
        "portrait": "char_4208_wintim_1",
        "spine": "char_4208_wintim",
        "skillIcon": "skchr_wintim_2",
        "subProfIcon": "sub_agent_icon"
      },
      "expansionBatch": "ursus-expansion-v1"
    },
    "chess_ursus_wintim_b": {
      "chessId": "chess_ursus_wintim_b",
      "baseId": "chess_ursus_wintim_a",
      "goldenId": "chess_ursus_wintim_b",
      "isGolden": true,
      "tier": 2,
      "identifier": 15003,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1502,
      "charId": "char_4208_wintim",
      "name": "冬时",
      "appellation": "Снегурочка",
      "rarity": "TIER_4",
      "profession": "PIONEER",
      "subProfessionId": "agent",
      "subProfessionName": "情报官",
      "position": "MELEE",
      "nationId": "ursus",
      "teamId": null,
      "bonds": [
        "ursusShip",
        "skillfulShip"
      ],
      "garrisonIds": [],
      "price": 3,
      "sellPrice": 3,
      "upgradeNum": 3,
      "upgradeChessId": null,
      "status": {
        "phase": 2,
        "level": 55,
        "skillLevel": 7,
        "equipLevel": 1
      },
      "stats": {
        "maxHp": 1698,
        "atk": 518,
        "def": 242,
        "res": 0,
        "cost": 9,
        "blockCnt": 1,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 35,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "statsBase": {
        "maxHp": 1548,
        "atk": 518,
        "def": 222,
        "res": 0,
        "cost": 9,
        "blockCnt": 1,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 35,
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
      "attackKind": "ranged",
      "projectile": "bolt",
      "canHitFly": true,
      "targetPriority": null,
      "trait": {
        "desc": "再部署时间减少，可使用远程攻击",
        "descRaw": "再部署时间减少，可使用远程攻击",
        "bb": {
          "taunt_level": -1
        },
        "bbStr": {},
        "rangeGrid": null,
        "moduleDesc": "不容易受到敌方攻击"
      },
      "traitBase": {
        "desc": "再部署时间减少，可使用远程攻击",
        "descRaw": "再部署时间减少，可使用远程攻击",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "疾笔撰录",
          "desc": "攻击速度+10，自身受到伤害后失去该效果",
          "descRaw": "攻击速度+10，自身受到伤害后失去该效果",
          "bb": {
            "attack_speed": 10
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "疾笔撰录",
          "desc": "攻击速度+10，自身受到伤害后失去该效果",
          "descRaw": "攻击速度+10，自身受到伤害后失去该效果",
          "bb": {
            "attack_speed": 10
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_wintim_2",
        "iconId": "skchr_wintim_2",
        "name": "循理归因",
        "level": 7,
        "desc": "攻击速度+25，每次攻击获得1点部署费用，并使目标停顿1秒",
        "descRaw": "攻击速度+25，每次攻击获得1点部署费用，并使目标停顿1秒",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 9,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 33,
        "initSp": 17,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "attack_speed": 25,
          "attack@sluggish": 1,
          "cost": 1
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_wintim_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_wintim_1",
          "iconId": "skchr_wintim_1",
          "name": "数据分析",
          "level": 7,
          "desc": "下次攻击造成相当于攻击力210%的物理伤害，并获得3点部署费用",
          "descRaw": "下次攻击造成相当于攻击力210%的物理伤害，并获得3点部署费用",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 7,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "cost": 3,
            "atk_scale": 2.1
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_wintim_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_wintim_2",
          "iconId": "skchr_wintim_2",
          "name": "循理归因",
          "level": 7,
          "desc": "攻击速度+25，每次攻击获得1点部署费用，并使目标停顿1秒",
          "descRaw": "攻击速度+25，每次攻击获得1点部署费用，并使目标停顿1秒",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 9,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 33,
          "initSp": 17,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "attack_speed": 25,
            "attack@sluggish": 1,
            "cost": 1
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_wintim_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        }
      ],
      "module": {
        "id": "uniequip_002_wintim",
        "name": "缺角的权限",
        "type": "AGE-X",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_wintim",
          "name": "缺角的权限",
          "typeName": "AGE-X",
          "isDefault": true,
          "level": 1,
          "attr": {
            "maxHp": 150,
            "def": 20
          },
          "traitOverride": {
            "desc": "再部署时间减少，可使用远程攻击",
            "descRaw": "再部署时间减少，可使用远程攻击",
            "bb": {
              "taunt_level": -1
            },
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "不容易受到敌方攻击"
          },
          "talentChanges": []
        }
      ],
      "assets": {
        "avatar": "char_4208_wintim_2",
        "portrait": "char_4208_wintim_2",
        "spine": "char_4208_wintim",
        "skillIcon": "skchr_wintim_2",
        "subProfIcon": "sub_agent_icon"
      },
      "expansionBatch": "ursus-expansion-v1"
    },
    "chess_ursus_glassb_a": {
      "chessId": "chess_ursus_glassb_a",
      "baseId": "chess_ursus_glassb_a",
      "goldenId": "chess_ursus_glassb_b",
      "isGolden": false,
      "tier": 3,
      "identifier": 15004,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1503,
      "charId": "char_195_glassb",
      "name": "真理",
      "appellation": "Истина",
      "rarity": "TIER_5",
      "profession": "SUPPORT",
      "subProfessionId": "slower",
      "subProfessionName": "凝滞师",
      "position": "RANGED",
      "nationId": "ursus",
      "teamId": "student",
      "bonds": [
        "ursusShip",
        "arcaneShip",
        "ursusStudentShip"
      ],
      "garrisonIds": [],
      "price": 3,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_ursus_glassb_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 1024,
        "atk": 429,
        "def": 87,
        "res": 20,
        "cost": 15,
        "blockCnt": 1,
        "bat": 1.9,
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
        "maxHp": 1024,
        "atk": 429,
        "def": 87,
        "res": 20,
        "cost": 15,
        "blockCnt": 1,
        "bat": 1.9,
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
      "rangeId": "y-2",
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
          1,
          2
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
        "desc": "攻击造成法术伤害，并对敌人造成短暂的停顿",
        "descRaw": "攻击造成法术伤害，并对敌人造成短暂的停顿",
        "bb": {
          "sluggish": 0.8
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "攻击造成法术伤害，并对敌人造成短暂的停顿",
        "descRaw": "攻击造成法术伤害，并对敌人造成短暂的停顿",
        "bb": {
          "sluggish": 0.8
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "探知者",
          "desc": "防御力-35%，但攻击速度+18",
          "descRaw": "防御力-35%，但攻击速度+18",
          "bb": {
            "def": -0.35,
            "attack_speed": 18
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "探知者",
          "desc": "防御力-35%，但攻击速度+18",
          "descRaw": "防御力-35%，但攻击速度+18",
          "bb": {
            "def": -0.35,
            "attack_speed": 18
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_glassb_2",
        "iconId": "skchr_glassb_2",
        "name": "文学风暴",
        "level": 4,
        "desc": "攻击力+25%，攻击范围扩大，额外攻击两个目标",
        "descRaw": "攻击力+25%，攻击范围扩大，额外攻击两个目标",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 22,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 50,
        "initSp": 10,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk": 0.25,
          "attack@max_target": 3
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
        "prefabId": "skchr_glassb_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_glassb_1",
          "iconId": "skchr_glassb_1",
          "name": "专心致志",
          "level": 4,
          "desc": "攻击间隔较大幅度缩短",
          "descRaw": "攻击间隔较大幅度缩短",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 23,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 47,
          "initSp": 20,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "base_attack_time": -0.9
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_glassb_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_glassb_2",
          "iconId": "skchr_glassb_2",
          "name": "文学风暴",
          "level": 4,
          "desc": "攻击力+25%，攻击范围扩大，额外攻击两个目标",
          "descRaw": "攻击力+25%，攻击范围扩大，额外攻击两个目标",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 22,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 50,
          "initSp": 10,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.25,
            "attack@max_target": 3
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
          "prefabId": "skchr_glassb_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_195_glassb",
        "portrait": "char_195_glassb_1",
        "spine": "char_195_glassb",
        "skillIcon": "skchr_glassb_2",
        "subProfIcon": "sub_slower_icon"
      },
      "expansionBatch": "ursus-expansion-v1"
    },
    "chess_ursus_glassb_b": {
      "chessId": "chess_ursus_glassb_b",
      "baseId": "chess_ursus_glassb_a",
      "goldenId": "chess_ursus_glassb_b",
      "isGolden": true,
      "tier": 3,
      "identifier": 15004,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1503,
      "charId": "char_195_glassb",
      "name": "真理",
      "appellation": "Истина",
      "rarity": "TIER_5",
      "profession": "SUPPORT",
      "subProfessionId": "slower",
      "subProfessionName": "凝滞师",
      "position": "RANGED",
      "nationId": "ursus",
      "teamId": "student",
      "bonds": [
        "ursusShip",
        "arcaneShip",
        "ursusStudentShip"
      ],
      "garrisonIds": [],
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
        "maxHp": 1295,
        "atk": 495,
        "def": 100,
        "res": 20,
        "cost": 15,
        "blockCnt": 1,
        "bat": 1.9,
        "aspd": 103,
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
        "maxHp": 1215,
        "atk": 495,
        "def": 100,
        "res": 20,
        "cost": 15,
        "blockCnt": 1,
        "bat": 1.9,
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
      "rangeId": "y-2",
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
          1,
          2
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
        "desc": "攻击造成法术伤害，并对敌人造成较长的停顿",
        "descRaw": "攻击造成法术伤害，并对敌人造成短暂的停顿",
        "bb": {
          "sluggish": 1.2
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "攻击造成法术伤害，并对敌人造成短暂的停顿",
        "descRaw": "攻击造成法术伤害，并对敌人造成短暂的停顿",
        "bb": {
          "sluggish": 0.8
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "探知者",
          "desc": "防御力-35%，但攻击速度+18",
          "descRaw": "防御力-35%，但攻击速度+18",
          "bb": {
            "def": -0.35,
            "attack_speed": 18
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "探知者",
          "desc": "防御力-35%，但攻击速度+18",
          "descRaw": "防御力-35%，但攻击速度+18",
          "bb": {
            "def": -0.35,
            "attack_speed": 18
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_glassb_2",
        "iconId": "skchr_glassb_2",
        "name": "文学风暴",
        "level": 7,
        "desc": "攻击力+30%，攻击范围扩大，额外攻击两个目标",
        "descRaw": "攻击力+30%，攻击范围扩大，额外攻击两个目标",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 25,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 50,
        "initSp": 20,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk": 0.3,
          "attack@max_target": 3
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
        "prefabId": "skchr_glassb_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_glassb_1",
          "iconId": "skchr_glassb_1",
          "name": "专心致志",
          "level": 7,
          "desc": "攻击间隔大幅度缩短",
          "descRaw": "攻击间隔大幅度缩短",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 26,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 44,
          "initSp": 20,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "base_attack_time": -1
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_glassb_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_glassb_2",
          "iconId": "skchr_glassb_2",
          "name": "文学风暴",
          "level": 7,
          "desc": "攻击力+30%，攻击范围扩大，额外攻击两个目标",
          "descRaw": "攻击力+30%，攻击范围扩大，额外攻击两个目标",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 25,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 50,
          "initSp": 20,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.3,
            "attack@max_target": 3
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
          "prefabId": "skchr_glassb_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        }
      ],
      "module": {
        "id": "uniequip_002_glassb",
        "name": "读书笔记",
        "type": "DEC-Y",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_glassb",
          "name": "读书笔记",
          "typeName": "DEC-Y",
          "isDefault": true,
          "level": 1,
          "attr": {
            "maxHp": 80,
            "aspd": 3
          },
          "traitOverride": {
            "desc": "攻击造成法术伤害，并对敌人造成较长的停顿",
            "descRaw": "攻击造成法术伤害，并对敌人造成短暂的停顿",
            "bb": {
              "sluggish": 1.2
            },
            "bbStr": {},
            "rangeGrid": null
          },
          "talentChanges": []
        }
      ],
      "assets": {
        "avatar": "char_195_glassb_2",
        "portrait": "char_195_glassb_2",
        "spine": "char_195_glassb",
        "skillIcon": "skchr_glassb_2",
        "subProfIcon": "sub_slower_icon"
      },
      "expansionBatch": "ursus-expansion-v1"
    },
    "chess_ursus_absin_a": {
      "chessId": "chess_ursus_absin_a",
      "baseId": "chess_ursus_absin_a",
      "goldenId": "chess_ursus_absin_b",
      "isGolden": false,
      "tier": 3,
      "identifier": 15005,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1503,
      "charId": "char_405_absin",
      "name": "苦艾",
      "appellation": "Absinthe",
      "rarity": "TIER_5",
      "profession": "CASTER",
      "subProfessionId": "corecaster",
      "subProfessionName": "中坚术师",
      "position": "RANGED",
      "nationId": "ursus",
      "teamId": "student",
      "bonds": [
        "ursusShip",
        "preciShip",
        "ursusStudentShip"
      ],
      "garrisonIds": [],
      "price": 3,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_ursus_absin_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 1150,
        "atk": 531,
        "def": 111,
        "res": 20,
        "cost": 22,
        "blockCnt": 1,
        "bat": 1.6,
        "aspd": 100,
        "respawnTime": 80,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "statsBase": {
        "maxHp": 1150,
        "atk": 531,
        "def": 111,
        "res": 20,
        "cost": 22,
        "blockCnt": 1,
        "bat": 1.6,
        "aspd": 100,
        "respawnTime": 80,
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
        "desc": "攻击造成法术伤害",
        "descRaw": "攻击造成法术伤害",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "攻击造成法术伤害",
        "descRaw": "攻击造成法术伤害",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "执法者",
          "desc": "攻击生命值低于40%的敌人伤害提高24%",
          "descRaw": "攻击生命值低于40%的敌人伤害提高24%",
          "bb": {
            "hp_ratio": 0.4,
            "damage_scale": 1.24
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "执法者",
          "desc": "攻击生命值低于40%的敌人伤害提高24%",
          "descRaw": "攻击生命值低于40%的敌人伤害提高24%",
          "bb": {
            "hp_ratio": 0.4,
            "damage_scale": 1.24
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_absin_1",
        "iconId": "skchr_absin_1",
        "name": "执法模式",
        "level": 4,
        "desc": "攻击力+45%，优先攻击当前生命百分比最低的敌人\n持续时间无限",
        "descRaw": "攻击力+45%，优先攻击当前生命百分比最低的敌人\n持续时间无限",
        "skillType": "AUTO",
        "durationType": "NONE",
        "duration": 0,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 84,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk": 0.45
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_absin_1",
        "trigger": {
          "rule": "SP_FULL"
        },
        "index": 0,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_absin_1",
          "iconId": "skchr_absin_1",
          "name": "执法模式",
          "level": 4,
          "desc": "攻击力+45%，优先攻击当前生命百分比最低的敌人\n持续时间无限",
          "descRaw": "攻击力+45%，优先攻击当前生命百分比最低的敌人\n持续时间无限",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 84,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.45
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_absin_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": true
        },
        {
          "skillId": "skchr_absin_2",
          "iconId": "skchr_absin_2",
          "name": "终结连射",
          "level": 4,
          "desc": "每次攻击变为攻击力65%的4连发，但不再选择生命值高于50%的敌人作为目标",
          "descRaw": "每次攻击变为攻击力65%的4连发，但不再选择生命值高于50%的敌人作为目标",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 26,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 57,
          "initSp": 15,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "attack@times": 4,
            "attack@atk_scale": 0.65
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_absin_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_405_absin",
        "portrait": "char_405_absin_1",
        "spine": "char_405_absin",
        "skillIcon": "skchr_absin_1",
        "subProfIcon": "sub_corecaster_icon"
      },
      "expansionBatch": "ursus-expansion-v1"
    },
    "chess_ursus_absin_b": {
      "chessId": "chess_ursus_absin_b",
      "baseId": "chess_ursus_absin_a",
      "goldenId": "chess_ursus_absin_b",
      "isGolden": true,
      "tier": 3,
      "identifier": 15005,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1503,
      "charId": "char_405_absin",
      "name": "苦艾",
      "appellation": "Absinthe",
      "rarity": "TIER_5",
      "profession": "CASTER",
      "subProfessionId": "corecaster",
      "subProfessionName": "中坚术师",
      "position": "RANGED",
      "nationId": "ursus",
      "teamId": "student",
      "bonds": [
        "ursusShip",
        "preciShip",
        "ursusStudentShip"
      ],
      "garrisonIds": [],
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
        "maxHp": 1452,
        "atk": 637,
        "def": 121,
        "res": 20,
        "cost": 22,
        "blockCnt": 1,
        "bat": 1.6,
        "aspd": 100,
        "respawnTime": 80,
        "spRecovery": 1,
        "hpRecoveryPerSec": 0,
        "moveSpeed": 1,
        "tauntLevel": 0,
        "massLevel": 0,
        "deployLimit": 1,
        "deckStack": 0
      },
      "statsBase": {
        "maxHp": 1352,
        "atk": 607,
        "def": 121,
        "res": 20,
        "cost": 22,
        "blockCnt": 1,
        "bat": 1.6,
        "aspd": 100,
        "respawnTime": 80,
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
        "desc": "攻击造成法术伤害",
        "descRaw": "攻击造成法术伤害",
        "bb": {
          "magic_resist_penetrate_fixed": 10
        },
        "bbStr": {},
        "rangeGrid": null,
        "moduleDesc": "无视目标10点法术抗性"
      },
      "traitBase": {
        "desc": "攻击造成法术伤害",
        "descRaw": "攻击造成法术伤害",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "执法者",
          "desc": "攻击生命值低于40%的敌人伤害提高24%",
          "descRaw": "攻击生命值低于40%的敌人伤害提高24%",
          "bb": {
            "hp_ratio": 0.4,
            "damage_scale": 1.24
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "执法者",
          "desc": "攻击生命值低于40%的敌人伤害提高24%",
          "descRaw": "攻击生命值低于40%的敌人伤害提高24%",
          "bb": {
            "hp_ratio": 0.4,
            "damage_scale": 1.24
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_absin_1",
        "iconId": "skchr_absin_1",
        "name": "执法模式",
        "level": 7,
        "desc": "攻击力+60%，优先攻击当前生命百分比最低的敌人\n持续时间无限",
        "descRaw": "攻击力+60%，优先攻击当前生命百分比最低的敌人\n持续时间无限",
        "skillType": "AUTO",
        "durationType": "NONE",
        "duration": 0,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 78,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk": 0.6
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_absin_1",
        "trigger": {
          "rule": "SP_FULL"
        },
        "index": 0,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_absin_1",
          "iconId": "skchr_absin_1",
          "name": "执法模式",
          "level": 7,
          "desc": "攻击力+60%，优先攻击当前生命百分比最低的敌人\n持续时间无限",
          "descRaw": "攻击力+60%，优先攻击当前生命百分比最低的敌人\n持续时间无限",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 78,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.6
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_absin_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": true
        },
        {
          "skillId": "skchr_absin_2",
          "iconId": "skchr_absin_2",
          "name": "终结连射",
          "level": 7,
          "desc": "每次攻击变为攻击力75%的4连发，但不再选择生命值高于50%的敌人作为目标",
          "descRaw": "每次攻击变为攻击力75%的4连发，但不再选择生命值高于50%的敌人作为目标",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 27,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 54,
          "initSp": 19,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "attack@times": 4,
            "attack@atk_scale": 0.75
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_absin_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false
        }
      ],
      "module": {
        "id": "uniequip_002_absin",
        "name": "“监护者”单兵通讯单元",
        "type": "CCR-X",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_absin",
          "name": "“监护者”单兵通讯单元",
          "typeName": "CCR-X",
          "isDefault": true,
          "level": 1,
          "attr": {
            "maxHp": 100,
            "atk": 30
          },
          "traitOverride": {
            "desc": "攻击造成法术伤害",
            "descRaw": "攻击造成法术伤害",
            "bb": {
              "magic_resist_penetrate_fixed": 10
            },
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "无视目标10点法术抗性"
          },
          "talentChanges": []
        }
      ],
      "assets": {
        "avatar": "char_405_absin_2",
        "portrait": "char_405_absin_2",
        "spine": "char_405_absin",
        "skillIcon": "skchr_absin_1",
        "subProfIcon": "sub_corecaster_icon"
      },
      "expansionBatch": "ursus-expansion-v1"
    },
    "chess_ursus_leto_a": {
      "chessId": "chess_ursus_leto_a",
      "baseId": "chess_ursus_leto_a",
      "goldenId": "chess_ursus_leto_b",
      "isGolden": false,
      "tier": 4,
      "identifier": 15006,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1504,
      "charId": "char_194_leto",
      "name": "烈夏",
      "appellation": "Лето",
      "rarity": "TIER_5",
      "profession": "WARRIOR",
      "subProfessionId": "lord",
      "subProfessionName": "领主",
      "position": "MELEE",
      "nationId": "ursus",
      "teamId": "student",
      "bonds": [
        "ursusShip",
        "deputShip",
        "ursusStudentShip"
      ],
      "garrisonIds": [],
      "price": 3,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_ursus_leto_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 1801,
        "atk": 550,
        "def": 311,
        "res": 10,
        "cost": 19,
        "blockCnt": 2,
        "bat": 1.3,
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
        "maxHp": 1801,
        "atk": 550,
        "def": 311,
        "res": 10,
        "cost": 19,
        "blockCnt": 2,
        "bat": 1.3,
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
      "rangeId": "3-12",
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
        "desc": "可以进行远程攻击，但此时攻击力降低至80%",
        "descRaw": "可以进行远程攻击，但此时攻击力降低至80%",
        "bb": {
          "atk_scale": 0.8
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "可以进行远程攻击，但此时攻击力降低至80%",
        "descRaw": "可以进行远程攻击，但此时攻击力降低至80%",
        "bb": {
          "atk_scale": 0.8
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "快点快点！",
          "desc": "开启技能时，【乌萨斯学生自治团】干员攻击速度+21，持续至技能结束",
          "descRaw": "开启技能时，【乌萨斯学生自治团】干员攻击速度+21，持续至技能结束",
          "bb": {
            "attack_speed": 21
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "快点快点！",
          "desc": "开启技能时，【乌萨斯学生自治团】干员攻击速度+21，持续至技能结束",
          "descRaw": "开启技能时，【乌萨斯学生自治团】干员攻击速度+21，持续至技能结束",
          "bb": {
            "attack_speed": 21
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_leto_2",
        "iconId": "skchr_leto_2",
        "name": "一呼百应",
        "level": 4,
        "desc": "立刻使技能就绪的【乌萨斯学生自治团】干员同时开启技能，自身攻击力+50%，额外攻击一个目标，远程攻击不再降低攻击力",
        "descRaw": "立刻使技能就绪的【乌萨斯学生自治团】干员同时开启技能，自身攻击力+50%，额外攻击一个目标，远程攻击不再降低攻击力",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 25,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 43,
        "initSp": 9,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk": 0.5,
          "attack@max_target": 2
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_leto_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skcom_quickattack[3]",
          "iconId": "skcom_quickattack[3]",
          "name": "迅捷打击·γ型",
          "level": 4,
          "desc": "攻击力+27%，攻击速度+25",
          "descRaw": "攻击力+27%，攻击速度+25",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 35,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 42,
          "initSp": 5,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.27,
            "attack_speed": 25
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skcom_quickattack",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_leto_2",
          "iconId": "skchr_leto_2",
          "name": "一呼百应",
          "level": 4,
          "desc": "立刻使技能就绪的【乌萨斯学生自治团】干员同时开启技能，自身攻击力+50%，额外攻击一个目标，远程攻击不再降低攻击力",
          "descRaw": "立刻使技能就绪的【乌萨斯学生自治团】干员同时开启技能，自身攻击力+50%，额外攻击一个目标，远程攻击不再降低攻击力",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 25,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 43,
          "initSp": 9,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.5,
            "attack@max_target": 2
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_leto_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_194_leto",
        "portrait": "char_194_leto_1",
        "spine": "char_194_leto",
        "skillIcon": "skchr_leto_2",
        "subProfIcon": "sub_lord_icon"
      },
      "expansionBatch": "ursus-expansion-v1"
    },
    "chess_ursus_leto_b": {
      "chessId": "chess_ursus_leto_b",
      "baseId": "chess_ursus_leto_a",
      "goldenId": "chess_ursus_leto_b",
      "isGolden": true,
      "tier": 4,
      "identifier": 15006,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1504,
      "charId": "char_194_leto",
      "name": "烈夏",
      "appellation": "Лето",
      "rarity": "TIER_5",
      "profession": "WARRIOR",
      "subProfessionId": "lord",
      "subProfessionName": "领主",
      "position": "MELEE",
      "nationId": "ursus",
      "teamId": "student",
      "bonds": [
        "ursusShip",
        "deputShip",
        "ursusStudentShip"
      ],
      "garrisonIds": [],
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
        "maxHp": 2159,
        "atk": 687,
        "def": 384,
        "res": 10,
        "cost": 19,
        "blockCnt": 2,
        "bat": 1.3,
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
        "maxHp": 2159,
        "atk": 647,
        "def": 359,
        "res": 10,
        "cost": 19,
        "blockCnt": 2,
        "bat": 1.3,
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
      "rangeId": "3-12",
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
        "desc": "可以进行远程攻击，但此时攻击力降低至80%",
        "descRaw": "可以进行远程攻击，但此时攻击力降低至80%",
        "bb": {
          "atk_scale": 0.8
        },
        "bbStr": {},
        "rangeGrid": null,
        "moduleDesc": "攻击范围内存在2名及以上敌人时攻击速度+12"
      },
      "traitBase": {
        "desc": "可以进行远程攻击，但此时攻击力降低至80%",
        "descRaw": "可以进行远程攻击，但此时攻击力降低至80%",
        "bb": {
          "atk_scale": 0.8
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "快点快点！",
          "desc": "开启技能时，【乌萨斯学生自治团】干员攻击速度+21，持续至技能结束",
          "descRaw": "开启技能时，【乌萨斯学生自治团】干员攻击速度+21，持续至技能结束",
          "bb": {
            "attack_speed": 21
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": -1,
          "talentIndex": -1,
          "name": null,
          "desc": "",
          "bb": {
            "cnt": 2,
            "attack_speed": 12
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": true,
          "fromModule": true
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "快点快点！",
          "desc": "开启技能时，【乌萨斯学生自治团】干员攻击速度+21，持续至技能结束",
          "descRaw": "开启技能时，【乌萨斯学生自治团】干员攻击速度+21，持续至技能结束",
          "bb": {
            "attack_speed": 21
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_leto_2",
        "iconId": "skchr_leto_2",
        "name": "一呼百应",
        "level": 7,
        "desc": "立刻使技能就绪的【乌萨斯学生自治团】干员同时开启技能，自身攻击力+80%，额外攻击一个目标，远程攻击不再降低攻击力",
        "descRaw": "立刻使技能就绪的【乌萨斯学生自治团】干员同时开启技能，自身攻击力+80%，额外攻击一个目标，远程攻击不再降低攻击力",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 25,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 35,
        "initSp": 12,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk": 0.8,
          "attack@max_target": 2
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_leto_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skcom_quickattack[3]",
          "iconId": "skcom_quickattack[3]",
          "name": "迅捷打击·γ型",
          "level": 7,
          "desc": "攻击力+34%，攻击速度+35",
          "descRaw": "攻击力+34%，攻击速度+35",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 35,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 39,
          "initSp": 10,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.34,
            "attack_speed": 35
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skcom_quickattack",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_leto_2",
          "iconId": "skchr_leto_2",
          "name": "一呼百应",
          "level": 7,
          "desc": "立刻使技能就绪的【乌萨斯学生自治团】干员同时开启技能，自身攻击力+80%，额外攻击一个目标，远程攻击不再降低攻击力",
          "descRaw": "立刻使技能就绪的【乌萨斯学生自治团】干员同时开启技能，自身攻击力+80%，额外攻击一个目标，远程攻击不再降低攻击力",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 25,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 35,
          "initSp": 12,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.8,
            "attack@max_target": 2
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_leto_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        }
      ],
      "module": {
        "id": "uniequip_002_leto",
        "name": "旧衣服",
        "type": "LOR-Y",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_leto",
          "name": "旧衣服",
          "typeName": "LOR-Y",
          "isDefault": true,
          "level": 1,
          "attr": {
            "atk": 40,
            "def": 25
          },
          "traitOverride": {
            "desc": "可以进行远程攻击，但此时攻击力降低至80%",
            "descRaw": "可以进行远程攻击，但此时攻击力降低至80%",
            "bb": {
              "atk_scale": 0.8
            },
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "攻击范围内存在2名及以上敌人时攻击速度+12"
          },
          "talentChanges": [
            {
              "talentIndex": -1,
              "name": null,
              "desc": "",
              "bb": {
                "cnt": 2,
                "attack_speed": 12
              },
              "bbStr": {},
              "rangeGrid": null,
              "hidden": true
            }
          ]
        }
      ],
      "assets": {
        "avatar": "char_194_leto_2",
        "portrait": "char_194_leto_2",
        "spine": "char_194_leto",
        "skillIcon": "skchr_leto_2",
        "subProfIcon": "sub_lord_icon"
      },
      "expansionBatch": "ursus-expansion-v1"
    },
    "chess_ursus_turdus_a": {
      "chessId": "chess_ursus_turdus_a",
      "baseId": "chess_ursus_turdus_a",
      "goldenId": "chess_ursus_turdus_b",
      "isGolden": false,
      "tier": 4,
      "identifier": 15007,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1504,
      "charId": "char_4224_turdus",
      "name": "乌啾",
      "appellation": "Укусик",
      "rarity": "TIER_5",
      "profession": "MEDIC",
      "subProfessionId": "chainhealer",
      "subProfessionName": "链愈师",
      "position": "RANGED",
      "nationId": "ursus",
      "teamId": null,
      "bonds": [
        "ursusShip",
        "deputShip"
      ],
      "garrisonIds": [],
      "price": 3,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_ursus_turdus_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 1419,
        "atk": 352,
        "def": 140,
        "res": 0,
        "cost": 18,
        "blockCnt": 1,
        "bat": 2.85,
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
        "maxHp": 1419,
        "atk": 352,
        "def": 140,
        "res": 0,
        "cost": 18,
        "blockCnt": 1,
        "bat": 2.85,
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
      "rangeId": "y-2",
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
          1,
          2
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
      "dmgType": "heal",
      "attackKind": "ranged",
      "projectile": "bolt",
      "canHitFly": false,
      "targetPriority": null,
      "trait": {
        "desc": "恢复友方单位生命，且会在3个友方单位间跳跃，每次跳跃治疗量降低25%",
        "descRaw": "恢复友方单位生命，且会在3个友方单位间跳跃，每次跳跃治疗量降低25%",
        "bb": {
          "attack@chain.max_target": 3,
          "attack@chain.atk_scale": 0.75,
          "chain.max_target": 3,
          "chain.atk_scale": 0.75
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "恢复友方单位生命，且会在3个友方单位间跳跃，每次跳跃治疗量降低25%",
        "descRaw": "恢复友方单位生命，且会在3个友方单位间跳跃，每次跳跃治疗量降低25%",
        "bb": {
          "attack@chain.max_target": 3,
          "attack@chain.atk_scale": 0.75,
          "chain.max_target": 3,
          "chain.atk_scale": 0.75
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "久病良医",
          "desc": "受到自身的跳跃治疗时，治疗量提升至120%，并额外进行一次不衰减的治疗跳跃",
          "descRaw": "受到自身的跳跃治疗时，治疗量提升至120%，并额外进行一次不衰减的治疗跳跃",
          "bb": {
            "attack@chain.atk_scale_2": 1.2,
            "chain.atk_scale_2": 1.2
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "久病良医",
          "desc": "受到自身的跳跃治疗时，治疗量提升至120%，并额外进行一次不衰减的治疗跳跃",
          "descRaw": "受到自身的跳跃治疗时，治疗量提升至120%，并额外进行一次不衰减的治疗跳跃",
          "bb": {
            "attack@chain.atk_scale_2": 1.2,
            "chain.atk_scale_2": 1.2
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_turdus_1",
        "iconId": "skchr_turdus_1",
        "name": "火钳秘咒",
        "level": 4,
        "desc": "攻击速度+40，每次治疗的跳跃次数+1 ",
        "descRaw": "攻击速度+40，每次治疗的跳跃次数+1 ",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 25,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 35,
        "initSp": 20,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "attack_speed": 40,
          "attack@chain.extra_value": 1
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_turdus_1",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 0,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_turdus_1",
          "iconId": "skchr_turdus_1",
          "name": "火钳秘咒",
          "level": 4,
          "desc": "攻击速度+40，每次治疗的跳跃次数+1 ",
          "descRaw": "攻击速度+40，每次治疗的跳跃次数+1 ",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 25,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 35,
          "initSp": 20,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "attack_speed": 40,
            "attack@chain.extra_value": 1
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_turdus_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": true
        },
        {
          "skillId": "skchr_turdus_2",
          "iconId": "skchr_turdus_2",
          "name": "“捉迷藏！”",
          "level": 4,
          "desc": "流失15%当前生命值，立即进行一次治疗，并使目标每秒受到治疗量为20%攻击力的增益治疗，治疗的所有目标获得迷彩，持续10秒",
          "descRaw": "流失15%当前生命值，立即进行一次治疗，并使目标每秒受到治疗量为20%攻击力的增益治疗，治疗的所有目标获得迷彩，持续10秒",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 42,
          "initSp": 30,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "turdus_s2[continues_heal].heal_scale": 0.2,
            "bonus_duration": 10,
            "turdus_s2[self_damage].hp_ratio": 0.15
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_turdus_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_4224_turdus",
        "portrait": "char_4224_turdus_1",
        "spine": "char_4224_turdus",
        "skillIcon": "skchr_turdus_1",
        "subProfIcon": "sub_chainhealer_icon"
      },
      "expansionBatch": "ursus-expansion-v1"
    },
    "chess_ursus_turdus_b": {
      "chessId": "chess_ursus_turdus_b",
      "baseId": "chess_ursus_turdus_a",
      "goldenId": "chess_ursus_turdus_b",
      "isGolden": true,
      "tier": 4,
      "identifier": 15007,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1504,
      "charId": "char_4224_turdus",
      "name": "乌啾",
      "appellation": "Укусик",
      "rarity": "TIER_5",
      "profession": "MEDIC",
      "subProfessionId": "chainhealer",
      "subProfessionName": "链愈师",
      "position": "RANGED",
      "nationId": "ursus",
      "teamId": null,
      "bonds": [
        "ursusShip",
        "deputShip"
      ],
      "garrisonIds": [],
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
        "maxHp": 1757,
        "atk": 456,
        "def": 166,
        "res": 0,
        "cost": 18,
        "blockCnt": 1,
        "bat": 2.85,
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
        "maxHp": 1592,
        "atk": 418,
        "def": 166,
        "res": 0,
        "cost": 18,
        "blockCnt": 1,
        "bat": 2.85,
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
      "rangeId": "y-2",
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
          1,
          2
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
      "dmgType": "heal",
      "attackKind": "ranged",
      "projectile": "bolt",
      "canHitFly": false,
      "targetPriority": null,
      "trait": {
        "desc": "恢复友方单位生命，且会在3个友方单位间跳跃，每次跳跃治疗量降低15%",
        "descRaw": "恢复友方单位生命，且会在3个友方单位间跳跃，每次跳跃治疗量降低25%",
        "bb": {
          "attack@chain.max_target": 3,
          "attack@chain.atk_scale": 0.85,
          "chain.max_target": 3,
          "chain.atk_scale": 0.85
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "恢复友方单位生命，且会在3个友方单位间跳跃，每次跳跃治疗量降低25%",
        "descRaw": "恢复友方单位生命，且会在3个友方单位间跳跃，每次跳跃治疗量降低25%",
        "bb": {
          "attack@chain.max_target": 3,
          "attack@chain.atk_scale": 0.75,
          "chain.max_target": 3,
          "chain.atk_scale": 0.75
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "久病良医",
          "desc": "受到自身的跳跃治疗时，治疗量提升至120%，并额外进行一次不衰减的治疗跳跃",
          "descRaw": "受到自身的跳跃治疗时，治疗量提升至120%，并额外进行一次不衰减的治疗跳跃",
          "bb": {
            "attack@chain.atk_scale_2": 1.2,
            "chain.atk_scale_2": 1.2
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "久病良医",
          "desc": "受到自身的跳跃治疗时，治疗量提升至120%，并额外进行一次不衰减的治疗跳跃",
          "descRaw": "受到自身的跳跃治疗时，治疗量提升至120%，并额外进行一次不衰减的治疗跳跃",
          "bb": {
            "attack@chain.atk_scale_2": 1.2,
            "chain.atk_scale_2": 1.2
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_turdus_1",
        "iconId": "skchr_turdus_1",
        "name": "火钳秘咒",
        "level": 7,
        "desc": "攻击速度+55，每次治疗的跳跃次数+1 ",
        "descRaw": "攻击速度+55，每次治疗的跳跃次数+1 ",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 25,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 32,
        "initSp": 20,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "attack_speed": 55,
          "attack@chain.extra_value": 1
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_turdus_1",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 0,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_turdus_1",
          "iconId": "skchr_turdus_1",
          "name": "火钳秘咒",
          "level": 7,
          "desc": "攻击速度+55，每次治疗的跳跃次数+1 ",
          "descRaw": "攻击速度+55，每次治疗的跳跃次数+1 ",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 25,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 32,
          "initSp": 20,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "attack_speed": 55,
            "attack@chain.extra_value": 1
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_turdus_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": true
        },
        {
          "skillId": "skchr_turdus_2",
          "iconId": "skchr_turdus_2",
          "name": "“捉迷藏！”",
          "level": 7,
          "desc": "流失15%当前生命值，立即进行一次治疗，并使目标每秒受到治疗量为26%攻击力的增益治疗，治疗的所有目标获得迷彩，持续12秒",
          "descRaw": "流失15%当前生命值，立即进行一次治疗，并使目标每秒受到治疗量为26%攻击力的增益治疗，治疗的所有目标获得迷彩，持续12秒",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 39,
          "initSp": 30,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "turdus_s2[continues_heal].heal_scale": 0.26,
            "bonus_duration": 12,
            "turdus_s2[self_damage].hp_ratio": 0.15
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_turdus_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false
        }
      ],
      "module": {
        "id": "uniequip_002_turdus",
        "name": "“睡前故事”",
        "type": "XAH-X",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_turdus",
          "name": "“睡前故事”",
          "typeName": "XAH-X",
          "isDefault": true,
          "level": 1,
          "attr": {
            "maxHp": 165,
            "atk": 38
          },
          "traitOverride": {
            "desc": "恢复友方单位生命，且会在3个友方单位间跳跃，每次跳跃治疗量降低15%",
            "descRaw": "恢复友方单位生命，且会在3个友方单位间跳跃，每次跳跃治疗量降低25%",
            "bb": {
              "attack@chain.max_target": 3,
              "attack@chain.atk_scale": 0.85,
              "chain.max_target": 3,
              "chain.atk_scale": 0.85
            },
            "bbStr": {},
            "rangeGrid": null
          },
          "talentChanges": []
        }
      ],
      "assets": {
        "avatar": "char_4224_turdus_2",
        "portrait": "char_4224_turdus_2",
        "spine": "char_4224_turdus",
        "skillIcon": "skchr_turdus_1",
        "subProfIcon": "sub_chainhealer_icon"
      },
      "expansionBatch": "ursus-expansion-v1"
    },
    "chess_ursus_poca_a": {
      "chessId": "chess_ursus_poca_a",
      "baseId": "chess_ursus_poca_a",
      "goldenId": "chess_ursus_poca_b",
      "isGolden": false,
      "tier": 5,
      "identifier": 15008,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1505,
      "charId": "char_197_poca",
      "name": "早露",
      "appellation": "Роса",
      "rarity": "TIER_6",
      "profession": "SNIPER",
      "subProfessionId": "siegesniper",
      "subProfessionName": "攻城手",
      "position": "RANGED",
      "nationId": "ursus",
      "teamId": "student",
      "bonds": [
        "ursusShip",
        "preciShip",
        "ursusStudentShip"
      ],
      "garrisonIds": [],
      "price": 4,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_ursus_poca_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 1351,
        "atk": 856,
        "def": 100,
        "res": 0,
        "cost": 24,
        "blockCnt": 1,
        "bat": 2.4,
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
        "maxHp": 1351,
        "atk": 856,
        "def": 100,
        "res": 0,
        "cost": 24,
        "blockCnt": 1,
        "bat": 2.4,
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
      "rangeId": "4-3",
      "rangeGrid": [
        [
          2,
          2
        ],
        [
          2,
          3
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
          2
        ],
        [
          -1,
          3
        ],
        [
          -1,
          4
        ],
        [
          -2,
          2
        ],
        [
          -2,
          3
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
      "attackKind": "ranged",
      "projectile": "bolt",
      "canHitFly": true,
      "targetPriority": "heavy",
      "trait": {
        "desc": "优先攻击重量最重的敌人",
        "descRaw": "优先攻击重量最重的敌人",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "优先攻击重量最重的敌人",
        "descRaw": "优先攻击重量最重的敌人",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "深入骨髓",
          "desc": "攻击重量较重（重量等级大于等于3）的敌人时，无视其防御力的60%",
          "descRaw": "攻击重量较重（重量等级大于等于3）的敌人时，无视其防御力的60%",
          "bb": {
            "value": 3,
            "def_penetrate": 0.6
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "学生楷模",
          "desc": "编入队伍时，所有【乌萨斯学生自治团】干员攻击力+8%",
          "descRaw": "编入队伍时，所有【乌萨斯学生自治团】干员攻击力+8%",
          "bb": {
            "atk": 0.08
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "深入骨髓",
          "desc": "攻击重量较重（重量等级大于等于3）的敌人时，无视其防御力的60%",
          "descRaw": "攻击重量较重（重量等级大于等于3）的敌人时，无视其防御力的60%",
          "bb": {
            "value": 3,
            "def_penetrate": 0.6
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "学生楷模",
          "desc": "编入队伍时，所有【乌萨斯学生自治团】干员攻击力+8%",
          "descRaw": "编入队伍时，所有【乌萨斯学生自治团】干员攻击力+8%",
          "bb": {
            "atk": 0.08
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_poca_3",
        "iconId": "skchr_poca_3",
        "name": "雪崩击",
        "level": 4,
        "desc": "攻击力+10%，立即向至多3个重量最重的敌人发射束缚叉枪；技能持续时间内所有目标受到束缚效果，每秒受到一次攻击",
        "descRaw": "攻击力+10%，立即向至多3个重量最重的敌人发射束缚叉枪；技能持续时间内所有目标受到束缚效果，每秒受到一次攻击",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 6,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 37,
        "initSp": 11,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "max_target": 3,
          "hit_interval": 1,
          "atk": 0.1,
          "hit_duration": 6
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_poca_3",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 2,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skcom_atk_up[3]",
          "iconId": "skcom_atk_up[3]",
          "name": "攻击力强化·γ型",
          "level": 4,
          "desc": "攻击力+45%",
          "descRaw": "攻击力+45%",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 30,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 37,
          "initSp": 5,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.45
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skcom_atk_up",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_poca_2",
          "iconId": "skchr_poca_2",
          "name": "分裂射击",
          "level": 4,
          "desc": "攻击力+45%，可以额外攻击一个敌人",
          "descRaw": "攻击力+45%，可以额外攻击一个敌人",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 60,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 80,
          "initSp": 42,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.45,
            "attack@max_target": 2
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_poca_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false
        },
        {
          "skillId": "skchr_poca_3",
          "iconId": "skchr_poca_3",
          "name": "雪崩击",
          "level": 4,
          "desc": "攻击力+10%，立即向至多3个重量最重的敌人发射束缚叉枪；技能持续时间内所有目标受到束缚效果，每秒受到一次攻击",
          "descRaw": "攻击力+10%，立即向至多3个重量最重的敌人发射束缚叉枪；技能持续时间内所有目标受到束缚效果，每秒受到一次攻击",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 6,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 37,
          "initSp": 11,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "max_target": 3,
            "hit_interval": 1,
            "atk": 0.1,
            "hit_duration": 6
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_poca_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": true
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_197_poca",
        "portrait": "char_197_poca_1",
        "spine": "char_197_poca",
        "skillIcon": "skchr_poca_3",
        "subProfIcon": "sub_siegesniper_icon"
      },
      "expansionBatch": "ursus-expansion-v1"
    },
    "chess_ursus_poca_b": {
      "chessId": "chess_ursus_poca_b",
      "baseId": "chess_ursus_poca_a",
      "goldenId": "chess_ursus_poca_b",
      "isGolden": true,
      "tier": 5,
      "identifier": 15008,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1505,
      "charId": "char_197_poca",
      "name": "早露",
      "appellation": "Роса",
      "rarity": "TIER_6",
      "profession": "SNIPER",
      "subProfessionId": "siegesniper",
      "subProfessionName": "攻城手",
      "position": "RANGED",
      "nationId": "ursus",
      "teamId": "student",
      "bonds": [
        "ursusShip",
        "preciShip",
        "ursusStudentShip"
      ],
      "garrisonIds": [],
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
        "maxHp": 1619,
        "atk": 1033,
        "def": 145,
        "res": 0,
        "cost": 24,
        "blockCnt": 1,
        "bat": 2.4,
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
        "maxHp": 1619,
        "atk": 973,
        "def": 115,
        "res": 0,
        "cost": 24,
        "blockCnt": 1,
        "bat": 2.4,
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
      "rangeId": "4-3",
      "rangeGrid": [
        [
          2,
          2
        ],
        [
          2,
          3
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
          2
        ],
        [
          -1,
          3
        ],
        [
          -1,
          4
        ],
        [
          -2,
          2
        ],
        [
          -2,
          3
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
      "attackKind": "ranged",
      "projectile": "bolt",
      "canHitFly": true,
      "targetPriority": "heavy",
      "trait": {
        "desc": "优先攻击重量最重的敌人",
        "descRaw": "优先攻击重量最重的敌人",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null,
        "moduleDesc": "攻击重量较重（重量等级大于等于3）的敌人时，攻击力提升至115%"
      },
      "traitBase": {
        "desc": "优先攻击重量最重的敌人",
        "descRaw": "优先攻击重量最重的敌人",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "深入骨髓",
          "desc": "攻击重量较重（重量等级大于等于3）的敌人时，无视其防御力的60%",
          "descRaw": "攻击重量较重（重量等级大于等于3）的敌人时，无视其防御力的60%",
          "bb": {
            "value": 3,
            "def_penetrate": 0.6
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "学生楷模",
          "desc": "编入队伍时，所有【乌萨斯学生自治团】干员攻击力+8%",
          "descRaw": "编入队伍时，所有【乌萨斯学生自治团】干员攻击力+8%",
          "bb": {
            "atk": 0.08
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 0,
          "talentIndex": 0,
          "name": null,
          "desc": "",
          "bb": {
            "atk_scale": 1.15,
            "value": 3
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": true,
          "fromModule": true
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "深入骨髓",
          "desc": "攻击重量较重（重量等级大于等于3）的敌人时，无视其防御力的60%",
          "descRaw": "攻击重量较重（重量等级大于等于3）的敌人时，无视其防御力的60%",
          "bb": {
            "value": 3,
            "def_penetrate": 0.6
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "学生楷模",
          "desc": "编入队伍时，所有【乌萨斯学生自治团】干员攻击力+8%",
          "descRaw": "编入队伍时，所有【乌萨斯学生自治团】干员攻击力+8%",
          "bb": {
            "atk": 0.08
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_poca_3",
        "iconId": "skchr_poca_3",
        "name": "雪崩击",
        "level": 7,
        "desc": "攻击力+10%，立即向至多3个重量最重的敌人发射束缚叉枪；技能持续时间内所有目标受到束缚效果，每秒受到一次攻击",
        "descRaw": "攻击力+10%，立即向至多3个重量最重的敌人发射束缚叉枪；技能持续时间内所有目标受到束缚效果，每秒受到一次攻击",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 7,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 34,
        "initSp": 12,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "max_target": 3,
          "hit_interval": 1,
          "atk": 0.1,
          "hit_duration": 7
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_poca_3",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 2,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skcom_atk_up[3]",
          "iconId": "skcom_atk_up[3]",
          "name": "攻击力强化·γ型",
          "level": 7,
          "desc": "攻击力+60%",
          "descRaw": "攻击力+60%",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 30,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 35,
          "initSp": 10,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.6
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skcom_atk_up",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_poca_2",
          "iconId": "skchr_poca_2",
          "name": "分裂射击",
          "level": 7,
          "desc": "攻击力+60%，可以额外攻击一个敌人",
          "descRaw": "攻击力+60%，可以额外攻击一个敌人",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 60,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 80,
          "initSp": 45,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.6,
            "attack@max_target": 2
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_poca_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false
        },
        {
          "skillId": "skchr_poca_3",
          "iconId": "skchr_poca_3",
          "name": "雪崩击",
          "level": 7,
          "desc": "攻击力+10%，立即向至多3个重量最重的敌人发射束缚叉枪；技能持续时间内所有目标受到束缚效果，每秒受到一次攻击",
          "descRaw": "攻击力+10%，立即向至多3个重量最重的敌人发射束缚叉枪；技能持续时间内所有目标受到束缚效果，每秒受到一次攻击",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 7,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 34,
          "initSp": 12,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "max_target": 3,
            "hit_interval": 1,
            "atk": 0.1,
            "hit_duration": 7
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_poca_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": true
        }
      ],
      "module": {
        "id": "uniequip_002_poca",
        "name": "攻城器械训练装置",
        "type": "SIE-X",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_poca",
          "name": "攻城器械训练装置",
          "typeName": "SIE-X",
          "isDefault": true,
          "level": 1,
          "attr": {
            "atk": 60,
            "def": 30
          },
          "traitOverride": {
            "desc": "优先攻击重量最重的敌人",
            "descRaw": "优先攻击重量最重的敌人",
            "bb": {},
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "攻击重量较重（重量等级大于等于3）的敌人时，攻击力提升至115%"
          },
          "talentChanges": [
            {
              "talentIndex": 0,
              "name": null,
              "desc": "",
              "bb": {
                "atk_scale": 1.15,
                "value": 3
              },
              "bbStr": {},
              "rangeGrid": null,
              "hidden": true
            }
          ]
        },
        {
          "uniEquipId": "uniequip_003_poca",
          "name": "“心”",
          "typeName": "SIE-Y",
          "isDefault": false,
          "level": 1,
          "attr": {
            "atk": 70,
            "def": 20
          },
          "traitOverride": {
            "desc": "优先攻击重量最重的敌人",
            "descRaw": "优先攻击重量最重的敌人",
            "bb": {
              "max_dist": 4.5,
              "min_dist": 1,
              "damage_scale": 0.12
            },
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "攻击越远的敌人造成的伤害越高（最高提升12%）"
          },
          "talentChanges": []
        }
      ],
      "assets": {
        "avatar": "char_197_poca_2",
        "portrait": "char_197_poca_2",
        "spine": "char_197_poca",
        "skillIcon": "skchr_poca_3",
        "subProfIcon": "sub_siegesniper_icon"
      },
      "expansionBatch": "ursus-expansion-v1"
    },
    "chess_ursus_helage_a": {
      "chessId": "chess_ursus_helage_a",
      "baseId": "chess_ursus_helage_a",
      "goldenId": "chess_ursus_helage_b",
      "isGolden": false,
      "tier": 5,
      "identifier": 15009,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1505,
      "charId": "char_188_helage",
      "name": "赫拉格",
      "appellation": "Hellagur",
      "rarity": "TIER_6",
      "profession": "WARRIOR",
      "subProfessionId": "musha",
      "subProfessionName": "武者",
      "position": "MELEE",
      "nationId": "ursus",
      "teamId": null,
      "bonds": [
        "ursusShip",
        "soloShip"
      ],
      "garrisonIds": [],
      "price": 4,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_ursus_helage_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 2868,
        "atk": 632,
        "def": 283,
        "res": 0,
        "cost": 26,
        "blockCnt": 1,
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
        "maxHp": 2868,
        "atk": 632,
        "def": 283,
        "res": 0,
        "cost": 26,
        "blockCnt": 1,
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
        "desc": "不成为其他角色的治疗目标，每次攻击到敌人后回复自身70生命",
        "descRaw": "不成为其他角色的治疗目标，每次攻击到敌人后回复自身70生命",
        "bb": {
          "value": 70
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "不成为其他角色的治疗目标，每次攻击到敌人后回复自身70生命",
        "descRaw": "不成为其他角色的治疗目标，每次攻击到敌人后回复自身70生命",
        "bb": {
          "value": 70
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "月盈星亏",
          "desc": "在场时，自身获得最高+100攻击速度的坚忍（损失70%生命值时达到最大加成）",
          "descRaw": "在场时，自身获得最高+100攻击速度的坚忍（损失70%生命值时达到最大加成）",
          "bb": {
            "min_attack_speed": 100,
            "min_hp_ratio": 0.3
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "运筹帷幄",
          "desc": "未阻挡敌人时每秒回复60生命",
          "descRaw": "未阻挡敌人时每秒回复60生命",
          "bb": {
            "hp_recovery_per_sec": 60
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "月盈星亏",
          "desc": "在场时，自身获得最高+100攻击速度的坚忍（损失70%生命值时达到最大加成）",
          "descRaw": "在场时，自身获得最高+100攻击速度的坚忍（损失70%生命值时达到最大加成）",
          "bb": {
            "min_attack_speed": 100,
            "min_hp_ratio": 0.3
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "运筹帷幄",
          "desc": "未阻挡敌人时每秒回复60生命",
          "descRaw": "未阻挡敌人时每秒回复60生命",
          "bb": {
            "hp_recovery_per_sec": 60
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_helage_2",
        "iconId": "skchr_helage_2",
        "name": "弦月",
        "level": 4,
        "desc": "攻击力+35%，攻击变为二连击，获得75%的物理闪避",
        "descRaw": "攻击力+35%，攻击变为二连击，获得75%的物理闪避",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 11,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 32,
        "initSp": 5,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk": 0.35,
          "prob": 0.75
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_helage_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_helage_1",
          "iconId": "skchr_helage_1",
          "name": "新月",
          "level": 4,
          "desc": "下次攻击的攻击力提升至125%，并连续攻击两次",
          "descRaw": "下次攻击的攻击力提升至125%，并连续攻击两次",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 3,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 1.25
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_helage_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_helage_2",
          "iconId": "skchr_helage_2",
          "name": "弦月",
          "level": 4,
          "desc": "攻击力+35%，攻击变为二连击，获得75%的物理闪避",
          "descRaw": "攻击力+35%，攻击变为二连击，获得75%的物理闪避",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 11,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 32,
          "initSp": 5,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.35,
            "prob": 0.75
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_helage_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        },
        {
          "skillId": "skchr_helage_3",
          "iconId": "skchr_helage_3",
          "name": "满月",
          "level": 4,
          "desc": "攻击力+55%，攻击范围+1格，最多可以同时攻击3个目标",
          "descRaw": "攻击力+55%，攻击范围+1格，最多可以同时攻击3个目标",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 13,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 43,
          "initSp": 15,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.55,
            "ability_range_forward_extend": 1,
            "attack@max_target": 3
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_helage_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": false
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_188_helage",
        "portrait": "char_188_helage_1",
        "spine": "char_188_helage",
        "skillIcon": "skchr_helage_2",
        "subProfIcon": "sub_musha_icon"
      },
      "expansionBatch": "ursus-expansion-v1"
    },
    "chess_ursus_helage_b": {
      "chessId": "chess_ursus_helage_b",
      "baseId": "chess_ursus_helage_a",
      "goldenId": "chess_ursus_helage_b",
      "isGolden": true,
      "tier": 5,
      "identifier": 15009,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1505,
      "charId": "char_188_helage",
      "name": "赫拉格",
      "appellation": "Hellagur",
      "rarity": "TIER_6",
      "profession": "WARRIOR",
      "subProfessionId": "musha",
      "subProfessionName": "武者",
      "position": "MELEE",
      "nationId": "ursus",
      "teamId": null,
      "bonds": [
        "ursusShip",
        "soloShip"
      ],
      "garrisonIds": [],
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
        "maxHp": 3732,
        "atk": 773,
        "def": 317,
        "res": 0,
        "cost": 26,
        "blockCnt": 1,
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
        "maxHp": 3502,
        "atk": 718,
        "def": 317,
        "res": 0,
        "cost": 26,
        "blockCnt": 1,
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
        "desc": "不成为其他角色的治疗目标，每次攻击到敌人后回复自身70生命",
        "descRaw": "不成为其他角色的治疗目标，每次攻击到敌人后回复自身70生命",
        "bb": {
          "value": 70
        },
        "bbStr": {},
        "rangeGrid": null,
        "moduleDesc": "生命值低于50%时，获得25%的庇护"
      },
      "traitBase": {
        "desc": "不成为其他角色的治疗目标，每次攻击到敌人后回复自身70生命",
        "descRaw": "不成为其他角色的治疗目标，每次攻击到敌人后回复自身70生命",
        "bb": {
          "value": 70
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "月盈星亏",
          "desc": "在场时，自身获得最高+100攻击速度的坚忍（损失70%生命值时达到最大加成）",
          "descRaw": "在场时，自身获得最高+100攻击速度的坚忍（损失70%生命值时达到最大加成）",
          "bb": {
            "min_attack_speed": 100,
            "min_hp_ratio": 0.3
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "运筹帷幄",
          "desc": "未阻挡敌人时每秒回复60生命",
          "descRaw": "未阻挡敌人时每秒回复60生命",
          "bb": {
            "hp_recovery_per_sec": 60
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 0,
          "talentIndex": 0,
          "name": null,
          "desc": "",
          "bb": {
            "hp_ratio": 0.5,
            "damage_resistance": 0.25
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": true,
          "fromModule": true
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "月盈星亏",
          "desc": "在场时，自身获得最高+100攻击速度的坚忍（损失70%生命值时达到最大加成）",
          "descRaw": "在场时，自身获得最高+100攻击速度的坚忍（损失70%生命值时达到最大加成）",
          "bb": {
            "min_attack_speed": 100,
            "min_hp_ratio": 0.3
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "运筹帷幄",
          "desc": "未阻挡敌人时每秒回复60生命",
          "descRaw": "未阻挡敌人时每秒回复60生命",
          "bb": {
            "hp_recovery_per_sec": 60
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_helage_2",
        "iconId": "skchr_helage_2",
        "name": "弦月",
        "level": 7,
        "desc": "攻击力+50%，攻击变为二连击，获得75%的物理闪避",
        "descRaw": "攻击力+50%，攻击变为二连击，获得75%的物理闪避",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 12,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 29,
        "initSp": 10,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk": 0.5,
          "prob": 0.75
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_helage_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_helage_1",
          "iconId": "skchr_helage_1",
          "name": "新月",
          "level": 7,
          "desc": "下次攻击的攻击力提升至145%，并连续攻击两次",
          "descRaw": "下次攻击的攻击力提升至145%，并连续攻击两次",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 3,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 1.45
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_helage_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_helage_2",
          "iconId": "skchr_helage_2",
          "name": "弦月",
          "level": 7,
          "desc": "攻击力+50%，攻击变为二连击，获得75%的物理闪避",
          "descRaw": "攻击力+50%，攻击变为二连击，获得75%的物理闪避",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 12,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 29,
          "initSp": 10,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.5,
            "prob": 0.75
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_helage_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        },
        {
          "skillId": "skchr_helage_3",
          "iconId": "skchr_helage_3",
          "name": "满月",
          "level": 7,
          "desc": "攻击力+70%，攻击范围+1格，最多可以同时攻击3个目标",
          "descRaw": "攻击力+70%，攻击范围+1格，最多可以同时攻击3个目标",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 14,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 41,
          "initSp": 15,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.7,
            "ability_range_forward_extend": 1,
            "attack@max_target": 3
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_helage_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": false
        }
      ],
      "module": {
        "id": "uniequip_002_helage",
        "name": "藏锋",
        "type": "SBL-X",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_helage",
          "name": "藏锋",
          "typeName": "SBL-X",
          "isDefault": true,
          "level": 1,
          "attr": {
            "maxHp": 230,
            "atk": 55
          },
          "traitOverride": {
            "desc": "不成为其他角色的治疗目标，每次攻击到敌人后回复自身70生命",
            "descRaw": "不成为其他角色的治疗目标，每次攻击到敌人后回复自身70生命",
            "bb": {
              "value": 70
            },
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "生命值低于50%时，获得25%的庇护"
          },
          "talentChanges": [
            {
              "talentIndex": 0,
              "name": null,
              "desc": "",
              "bb": {
                "hp_ratio": 0.5,
                "damage_resistance": 0.25
              },
              "bbStr": {},
              "rangeGrid": null,
              "hidden": true
            }
          ]
        },
        {
          "uniEquipId": "uniequip_003_helage",
          "name": "“热的雪”",
          "typeName": "SBL-Y",
          "isDefault": false,
          "level": 1,
          "attr": {
            "atk": 55,
            "def": 50
          },
          "traitOverride": {
            "desc": "不成为其他角色的治疗目标，每次攻击到敌人后回复自身70生命",
            "descRaw": "不成为其他角色的治疗目标，每次攻击到敌人后回复自身70生命",
            "bb": {
              "value": 70,
              "hp_ratio": 0.3
            },
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "被击倒时不撤退且回复30%生命（单次部署只触发1次）"
          },
          "talentChanges": []
        }
      ],
      "assets": {
        "avatar": "char_188_helage_2",
        "portrait": "char_188_helage_2",
        "spine": "char_188_helage",
        "skillIcon": "skchr_helage_2",
        "subProfIcon": "sub_musha_icon"
      },
      "expansionBatch": "ursus-expansion-v1"
    },
    "chess_ursus_headb2_a": {
      "chessId": "chess_ursus_headb2_a",
      "baseId": "chess_ursus_headb2_a",
      "goldenId": "chess_ursus_headb2_b",
      "isGolden": false,
      "tier": 6,
      "identifier": 15010,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1506,
      "charId": "char_1051_headb2",
      "name": "怒潮凛冬",
      "appellation": "Zima the Raging Tide",
      "rarity": "TIER_6",
      "profession": "WARRIOR",
      "subProfessionId": "hammer",
      "subProfessionName": "撼地者",
      "position": "MELEE",
      "nationId": "ursus",
      "teamId": "student",
      "bonds": [
        "ursusShip",
        "indomShip",
        "ursusStudentShip"
      ],
      "garrisonIds": [],
      "price": 4,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_ursus_headb2_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 2301,
        "atk": 1060,
        "def": 346,
        "res": 0,
        "cost": 20,
        "blockCnt": 2,
        "bat": 1.8,
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
        "maxHp": 2301,
        "atk": 1060,
        "def": 346,
        "res": 0,
        "cost": 20,
        "blockCnt": 2,
        "bat": 1.8,
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
        "desc": "攻击使目标周围的其他敌人受到相当于攻击力50%的群体物理伤害",
        "descRaw": "攻击使目标周围的其他敌人受到相当于攻击力50%的群体物理伤害",
        "bb": {
          "attack@ability_range_radius": 1,
          "attack@atk_scale_2": 0.5
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "攻击使目标周围的其他敌人受到相当于攻击力50%的群体物理伤害",
        "descRaw": "攻击使目标周围的其他敌人受到相当于攻击力50%的群体物理伤害",
        "bb": {
          "attack@ability_range_radius": 1,
          "attack@atk_scale_2": 0.5
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "汹涌怒火",
          "desc": "特性溅射造成的物理伤害提升24%，且溅射到的每个高台对周围四格所有地面敌人造成相当于攻击力24%的物理伤害和0.5秒停顿",
          "descRaw": "特性溅射造成的物理伤害提升24%，且溅射到的每个高台对周围四格所有地面敌人造成相当于攻击力24%的物理伤害和0.5秒停顿",
          "bb": {
            "damage_scale": 1.24,
            "attack@splash_atk_scale": 0.24,
            "attack@sluggish": 0.5
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "万众巨潮",
          "desc": "技能期间所有场上干员攻击力和防御力+14%，【乌萨斯学生自治团】干员获得加成效果翻倍",
          "descRaw": "技能期间所有场上干员攻击力和防御力+14%，【乌萨斯学生自治团】干员获得加成效果翻倍",
          "bb": {
            "atk": 0.14,
            "def": 0.14,
            "scale_bonus": 2
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "汹涌怒火",
          "desc": "特性溅射造成的物理伤害提升24%，且溅射到的每个高台对周围四格所有地面敌人造成相当于攻击力24%的物理伤害和0.5秒停顿",
          "descRaw": "特性溅射造成的物理伤害提升24%，且溅射到的每个高台对周围四格所有地面敌人造成相当于攻击力24%的物理伤害和0.5秒停顿",
          "bb": {
            "damage_scale": 1.24,
            "attack@splash_atk_scale": 0.24,
            "attack@sluggish": 0.5
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "万众巨潮",
          "desc": "技能期间所有场上干员攻击力和防御力+14%，【乌萨斯学生自治团】干员获得加成效果翻倍",
          "descRaw": "技能期间所有场上干员攻击力和防御力+14%，【乌萨斯学生自治团】干员获得加成效果翻倍",
          "bb": {
            "atk": 0.14,
            "def": 0.14,
            "scale_bonus": 2
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_headb2_3",
        "iconId": "skchr_headb2_3",
        "name": "无可抵挡",
        "level": 4,
        "desc": "攻击力+65%，对前方一格持续进行五次溅射范围更大的锤击，每次造成相当于攻击力190%的物理伤害并使攻击力额外+30%；技能期间触发第一天赋的高台会向四周高台扩散该效果（扩散次数随攻击次数递增），并使伤害效果提升至3.5倍，控制效果变为1秒束缚",
        "descRaw": "攻击力+65%，对前方一格持续进行五次溅射范围更大的锤击，每次造成相当于攻击力190%的物理伤害并使攻击力额外+30%；技能期间触发第一天赋的高台会向四周高台扩散该效果（扩散次数随攻击次数递增），并使伤害效果提升至3.5倍，控制效果变为1秒束缚",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 0,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 34,
        "initSp": 12,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk_scale": 1.9,
          "atk_step": 0.3,
          "splash_atk_scale_bonus": 3.5,
          "unmovable": 1,
          "atk_base": 0.65
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_headb2_3",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 2,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_headb2_1",
          "iconId": "skchr_headb2_1",
          "name": "誓不低头",
          "level": 4,
          "desc": "攻击力+32%，攻击速度+35",
          "descRaw": "攻击力+32%，攻击速度+35",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 30,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 37,
          "initSp": 5,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.32,
            "attack_speed": 35
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_headb2_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_headb2_2",
          "iconId": "skchr_headb2_2",
          "name": "绝不罢休",
          "level": 4,
          "desc": "被动效果：每次有高台触发第一天赋的效果时，获得1点技力\n自动开启：攻击范围扩大，攻击力+60%，防御力+40%\n第二次及以后使用时能力加成变为最初的两倍，且持续时间无限",
          "descRaw": "被动效果：每次有高台触发第一天赋的效果时，获得1点技力\n自动开启：攻击范围扩大，攻击力+60%，防御力+40%\n第二次及以后使用时能力加成变为最初的两倍，且持续时间无限",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 16,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 57,
          "initSp": 20,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.6,
            "def": 0.4,
            "headb2_s_2[second].atk": 1.2,
            "headb2_s_2[second].def": 0.8,
            "sp_per_highland": 1
          },
          "bbStr": {},
          "rangeId": "2-5",
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
              -1,
              1
            ],
            [
              -1,
              2
            ]
          ],
          "prefabId": "skchr_headb2_2",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 1,
          "isDefault": false
        },
        {
          "skillId": "skchr_headb2_3",
          "iconId": "skchr_headb2_3",
          "name": "无可抵挡",
          "level": 4,
          "desc": "攻击力+65%，对前方一格持续进行五次溅射范围更大的锤击，每次造成相当于攻击力190%的物理伤害并使攻击力额外+30%；技能期间触发第一天赋的高台会向四周高台扩散该效果（扩散次数随攻击次数递增），并使伤害效果提升至3.5倍，控制效果变为1秒束缚",
          "descRaw": "攻击力+65%，对前方一格持续进行五次溅射范围更大的锤击，每次造成相当于攻击力190%的物理伤害并使攻击力额外+30%；技能期间触发第一天赋的高台会向四周高台扩散该效果（扩散次数随攻击次数递增），并使伤害效果提升至3.5倍，控制效果变为1秒束缚",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 34,
          "initSp": 12,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 1.9,
            "atk_step": 0.3,
            "splash_atk_scale_bonus": 3.5,
            "unmovable": 1,
            "atk_base": 0.65
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_headb2_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": true
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_1051_headb2",
        "portrait": "char_1051_headb2_1",
        "spine": "char_1051_headb2",
        "skillIcon": "skchr_headb2_3",
        "subProfIcon": "sub_hammer_icon"
      },
      "expansionBatch": "ursus-expansion-v1"
    },
    "chess_ursus_headb2_b": {
      "chessId": "chess_ursus_headb2_b",
      "baseId": "chess_ursus_headb2_a",
      "goldenId": "chess_ursus_headb2_b",
      "isGolden": true,
      "tier": 6,
      "identifier": 15010,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1506,
      "charId": "char_1051_headb2",
      "name": "怒潮凛冬",
      "appellation": "Zima the Raging Tide",
      "rarity": "TIER_6",
      "profession": "WARRIOR",
      "subProfessionId": "hammer",
      "subProfessionName": "撼地者",
      "position": "MELEE",
      "nationId": "ursus",
      "teamId": "student",
      "bonds": [
        "ursusShip",
        "indomShip",
        "ursusStudentShip"
      ],
      "garrisonIds": [],
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
        "maxHp": 2981,
        "atk": 1257,
        "def": 408,
        "res": 0,
        "cost": 20,
        "blockCnt": 2,
        "bat": 1.8,
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
        "maxHp": 2731,
        "atk": 1194,
        "def": 387,
        "res": 0,
        "cost": 20,
        "blockCnt": 2,
        "bat": 1.8,
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
        "desc": "攻击使目标周围的其他敌人受到相当于攻击力50%的群体物理伤害",
        "descRaw": "攻击使目标周围的其他敌人受到相当于攻击力50%的群体物理伤害",
        "bb": {
          "attack@ability_range_radius": 1,
          "attack@atk_scale_2": 0.5,
          "atk_scale_e": 1.15,
          "cnt": 3
        },
        "bbStr": {},
        "rangeGrid": null,
        "moduleDesc": "溅射范围内有大于或等于3个敌人时，使当次攻击力提升至115%"
      },
      "traitBase": {
        "desc": "攻击使目标周围的其他敌人受到相当于攻击力50%的群体物理伤害",
        "descRaw": "攻击使目标周围的其他敌人受到相当于攻击力50%的群体物理伤害",
        "bb": {
          "attack@ability_range_radius": 1,
          "attack@atk_scale_2": 0.5
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "汹涌怒火",
          "desc": "特性溅射造成的物理伤害提升24%，且溅射到的每个高台对周围四格所有地面敌人造成相当于攻击力24%的物理伤害和0.5秒停顿",
          "descRaw": "特性溅射造成的物理伤害提升24%，且溅射到的每个高台对周围四格所有地面敌人造成相当于攻击力24%的物理伤害和0.5秒停顿",
          "bb": {
            "damage_scale": 1.24,
            "attack@splash_atk_scale": 0.24,
            "attack@sluggish": 0.5
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "万众巨潮",
          "desc": "技能期间所有场上干员攻击力和防御力+14%，【乌萨斯学生自治团】干员获得加成效果翻倍",
          "descRaw": "技能期间所有场上干员攻击力和防御力+14%，【乌萨斯学生自治团】干员获得加成效果翻倍",
          "bb": {
            "atk": 0.14,
            "def": 0.14,
            "scale_bonus": 2
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "汹涌怒火",
          "desc": "特性溅射造成的物理伤害提升24%，且溅射到的每个高台对周围四格所有地面敌人造成相当于攻击力24%的物理伤害和0.5秒停顿",
          "descRaw": "特性溅射造成的物理伤害提升24%，且溅射到的每个高台对周围四格所有地面敌人造成相当于攻击力24%的物理伤害和0.5秒停顿",
          "bb": {
            "damage_scale": 1.24,
            "attack@splash_atk_scale": 0.24,
            "attack@sluggish": 0.5
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "万众巨潮",
          "desc": "技能期间所有场上干员攻击力和防御力+14%，【乌萨斯学生自治团】干员获得加成效果翻倍",
          "descRaw": "技能期间所有场上干员攻击力和防御力+14%，【乌萨斯学生自治团】干员获得加成效果翻倍",
          "bb": {
            "atk": 0.14,
            "def": 0.14,
            "scale_bonus": 2
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_headb2_3",
        "iconId": "skchr_headb2_3",
        "name": "无可抵挡",
        "level": 7,
        "desc": "攻击力+80%，对前方一格持续进行五次溅射范围更大的锤击，每次造成相当于攻击力210%的物理伤害并使攻击力额外+30%；技能期间触发第一天赋的高台会向四周高台扩散该效果（扩散次数随攻击次数递增），并使伤害效果提升至3.5倍，控制效果变为1.5秒束缚",
        "descRaw": "攻击力+80%，对前方一格持续进行五次溅射范围更大的锤击，每次造成相当于攻击力210%的物理伤害并使攻击力额外+30%；技能期间触发第一天赋的高台会向四周高台扩散该效果（扩散次数随攻击次数递增），并使伤害效果提升至3.5倍，控制效果变为1.5秒束缚",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 0,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 32,
        "initSp": 15,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk_scale": 2.1,
          "atk_step": 0.3,
          "splash_atk_scale_bonus": 3.5,
          "unmovable": 1.5,
          "atk_base": 0.8
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_headb2_3",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 2,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_headb2_1",
          "iconId": "skchr_headb2_1",
          "name": "誓不低头",
          "level": 7,
          "desc": "攻击力+39%，攻击速度+40",
          "descRaw": "攻击力+39%，攻击速度+40",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 30,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 34,
          "initSp": 10,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.39,
            "attack_speed": 40
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_headb2_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_headb2_2",
          "iconId": "skchr_headb2_2",
          "name": "绝不罢休",
          "level": 7,
          "desc": "被动效果：每次有高台触发第一天赋的效果时，获得1点技力\n自动开启：攻击范围扩大，攻击力+75%，防御力+50%\n第二次及以后使用时能力加成变为最初的两倍，且持续时间无限",
          "descRaw": "被动效果：每次有高台触发第一天赋的效果时，获得1点技力\n自动开启：攻击范围扩大，攻击力+75%，防御力+50%\n第二次及以后使用时能力加成变为最初的两倍，且持续时间无限",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 16,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 53,
          "initSp": 24,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.75,
            "def": 0.5,
            "headb2_s_2[second].atk": 1.5,
            "headb2_s_2[second].def": 1,
            "sp_per_highland": 1
          },
          "bbStr": {},
          "rangeId": "2-5",
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
              -1,
              1
            ],
            [
              -1,
              2
            ]
          ],
          "prefabId": "skchr_headb2_2",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 1,
          "isDefault": false
        },
        {
          "skillId": "skchr_headb2_3",
          "iconId": "skchr_headb2_3",
          "name": "无可抵挡",
          "level": 7,
          "desc": "攻击力+80%，对前方一格持续进行五次溅射范围更大的锤击，每次造成相当于攻击力210%的物理伤害并使攻击力额外+30%；技能期间触发第一天赋的高台会向四周高台扩散该效果（扩散次数随攻击次数递增），并使伤害效果提升至3.5倍，控制效果变为1.5秒束缚",
          "descRaw": "攻击力+80%，对前方一格持续进行五次溅射范围更大的锤击，每次造成相当于攻击力210%的物理伤害并使攻击力额外+30%；技能期间触发第一天赋的高台会向四周高台扩散该效果（扩散次数随攻击次数递增），并使伤害效果提升至3.5倍，控制效果变为1.5秒束缚",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 32,
          "initSp": 15,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 2.1,
            "atk_step": 0.3,
            "splash_atk_scale_bonus": 3.5,
            "unmovable": 1.5,
            "atk_base": 0.8
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_headb2_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": true
        }
      ],
      "module": {
        "id": "uniequip_002_headb2",
        "name": "迟到的勋章",
        "type": "HAM-X",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_headb2",
          "name": "迟到的勋章",
          "typeName": "HAM-X",
          "isDefault": true,
          "level": 1,
          "attr": {
            "maxHp": 250,
            "atk": 63,
            "def": 21
          },
          "traitOverride": {
            "desc": "攻击使目标周围的其他敌人受到相当于攻击力50%的群体物理伤害",
            "descRaw": "攻击使目标周围的其他敌人受到相当于攻击力50%的群体物理伤害",
            "bb": {
              "attack@ability_range_radius": 1,
              "attack@atk_scale_2": 0.5,
              "atk_scale_e": 1.15,
              "cnt": 3
            },
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "溅射范围内有大于或等于3个敌人时，使当次攻击力提升至115%"
          },
          "talentChanges": []
        }
      ],
      "assets": {
        "avatar": "char_1051_headb2_2",
        "portrait": "char_1051_headb2_2",
        "spine": "char_1051_headb2",
        "skillIcon": "skchr_headb2_3",
        "subProfIcon": "sub_hammer_icon"
      },
      "expansionBatch": "ursus-expansion-v1"
    },
    "chess_ursus_oxi_a": {
      "chessId": "chess_ursus_oxi_a",
      "baseId": "chess_ursus_oxi_a",
      "goldenId": "chess_ursus_oxi_b",
      "isGolden": false,
      "tier": 6,
      "identifier": 15011,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1506,
      "charId": "char_4247_oxi",
      "name": "塔露拉",
      "appellation": "Talulah",
      "rarity": "TIER_6",
      "profession": "WARRIOR",
      "subProfessionId": "primguard",
      "subProfessionName": "本源近卫",
      "position": "MELEE",
      "nationId": "ursus",
      "teamId": null,
      "bonds": [
        "ursusShip",
        "arcaneShip"
      ],
      "garrisonIds": [],
      "price": 4,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_ursus_oxi_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 2415,
        "atk": 743,
        "def": 361,
        "res": 10,
        "cost": 23,
        "blockCnt": 2,
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
        "maxHp": 2415,
        "atk": 743,
        "def": 361,
        "res": 10,
        "cost": 23,
        "blockCnt": 2,
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
      "dmgType": "arts",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "trait": {
        "desc": "能够阻挡两个敌人，可以造成元素伤害",
        "descRaw": "能够阻挡两个敌人，可以造成元素伤害",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "能够阻挡两个敌人，可以造成元素伤害",
        "descRaw": "能够阻挡两个敌人，可以造成元素伤害",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "绝不妥协",
          "desc": "攻击造成法术伤害；造成法术伤害时附带11%的灼燃损伤；停止攻击3秒后法术和元素伤害逐渐提升（最高提升15%，每次攻击时衰减）",
          "descRaw": "攻击造成法术伤害；造成法术伤害时附带11%的灼燃损伤；停止攻击3秒后法术和元素伤害逐渐提升（最高提升15%，每次攻击时衰减）",
          "bb": {
            "arcane_idle_delay": 3,
            "arcane_step_interval": 0.5,
            "arcane_step": 0.025,
            "arcane_max": 0.15,
            "ep_damage_ratio": 0.11
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "我即火焰",
          "desc": "在场时，全场敌人灼燃损伤爆发后5秒内，于可通行地面留下持续3秒的“足迹”（最多25格），每0.3秒造成塔露拉攻击力12%的法术伤害",
          "descRaw": "在场时，全场敌人灼燃损伤爆发后5秒内，于可通行地面留下持续3秒的“足迹”（最多25格），每0.3秒造成塔露拉攻击力12%的法术伤害",
          "bb": {
            "field_duration": 3,
            "field_interval": 0.3,
            "field_atk_scale": 0.12,
            "max_count": 25
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "绝不妥协",
          "desc": "攻击造成法术伤害；造成法术伤害时附带11%的灼燃损伤；停止攻击3秒后法术和元素伤害逐渐提升（最高提升15%，每次攻击时衰减）",
          "descRaw": "攻击造成法术伤害；造成法术伤害时附带11%的灼燃损伤；停止攻击3秒后法术和元素伤害逐渐提升（最高提升15%，每次攻击时衰减）",
          "bb": {
            "arcane_idle_delay": 3,
            "arcane_step_interval": 0.5,
            "arcane_step": 0.025,
            "arcane_max": 0.15,
            "ep_damage_ratio": 0.11
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "我即火焰",
          "desc": "在场时，全场敌人灼燃损伤爆发后5秒内，于可通行地面留下持续3秒的“足迹”（最多25格），每0.3秒造成塔露拉攻击力12%的法术伤害",
          "descRaw": "在场时，全场敌人灼燃损伤爆发后5秒内，于可通行地面留下持续3秒的“足迹”（最多25格），每0.3秒造成塔露拉攻击力12%的法术伤害",
          "bb": {
            "field_duration": 3,
            "field_interval": 0.3,
            "field_atk_scale": 0.12,
            "max_count": 25
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_oxi_3",
        "iconId": "skchr_oxi_3",
        "name": "日冕重烈",
        "level": 4,
        "desc": "攻击力+108%；停止攻击以持续引导场地进入以下状态：每2.67秒在5行范围内，朝部署方向召唤“簇火”，“簇火”碰到敌人时爆炸造成攻击力130%的范围法术伤害；若目标处于灼燃损伤爆发期间则改为造成元素伤害\n过载：“簇火”生成间隔缩短至2秒，范围扩展最多13行\n被同波次的多个“簇火”命中时，后续“簇火”造成的伤害降低至15%\n该技能可随时主动关闭",
        "descRaw": "攻击力+108%；停止攻击以持续引导场地进入以下状态：每2.67秒在5行范围内，朝部署方向召唤“簇火”，“簇火”碰到敌人时爆炸造成攻击力130%的范围法术伤害；若目标处于灼燃损伤爆发期间则改为造成元素伤害\n过载：“簇火”生成间隔缩短至2秒，范围扩展最多13行\n被同波次的多个“簇火”命中时，后续“簇火”造成的伤害降低至15%\n该技能可随时主动关闭",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 36,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 45,
        "initSp": 38,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk": 1.08,
          "heatwave_atk_scale": 1.3,
          "normal_interval": 2.67,
          "overload_interval": 2,
          "wave_speed": 2.3,
          "normal_half_width": 2,
          "overload_half_width": 6,
          "projectile_range": 0.5,
          "range_radius": 1.5,
          "random_birth_delay": 0,
          "wave_exit_distance": 5,
          "same_wave_repeat_damage_scale": 0.15
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_oxi_3",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 2,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_oxi_1",
          "iconId": "skchr_oxi_1",
          "name": "照霎白夜",
          "level": 4,
          "desc": "对目标所在地块上的所有地面敌人造成攻击力400%的法术伤害，并造成2秒恐惧",
          "descRaw": "对目标所在地块上的所有地面敌人造成攻击力400%的法术伤害，并造成2秒恐惧",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": -1,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 8,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 4,
            "fear": 2
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_oxi_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_oxi_2",
          "iconId": "skchr_oxi_2",
          "name": "阂断骤雪",
          "level": 4,
          "desc": "获得90%的庇护（持续0.2秒后逐渐降低），对攻击来源造成塔露拉攻击力170%的范围法术伤害，并治疗塔露拉相当于伤害量5%的生命值；之后5秒内攻击所有阻挡的敌人，攻击力+37%和防御力+37%（可叠加5层）\n受到攻击后触发，可充能5次",
          "descRaw": "获得90%的庇护（持续0.2秒后逐渐降低），对攻击来源造成塔露拉攻击力170%的范围法术伤害，并治疗塔露拉相当于伤害量5%的生命值；之后5秒内攻击所有阻挡的敌人，攻击力+37%和防御力+37%（可叠加5层）\n受到攻击后触发，可充能5次",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 9,
          "initSp": 17,
          "maxChargeTime": 5,
          "increment": 1,
          "bb": {
            "skill_duration": 1.3,
            "damage_remaining_scale": 0.1,
            "damage_resistance": 0.9,
            "shelter_hold_duration": 0.2,
            "retaliate_atk_scale": 1.7,
            "heal_ratio": 0.05,
            "atk": 0.37,
            "def": 0.37,
            "max_stack_cnt": 5,
            "stack_duration": 5,
            "ability_range_radius": 1,
            "attack@buffed_attack_atk_scale": 1
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_oxi_2",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 1,
          "isDefault": false
        },
        {
          "skillId": "skchr_oxi_3",
          "iconId": "skchr_oxi_3",
          "name": "日冕重烈",
          "level": 4,
          "desc": "攻击力+108%；停止攻击以持续引导场地进入以下状态：每2.67秒在5行范围内，朝部署方向召唤“簇火”，“簇火”碰到敌人时爆炸造成攻击力130%的范围法术伤害；若目标处于灼燃损伤爆发期间则改为造成元素伤害\n过载：“簇火”生成间隔缩短至2秒，范围扩展最多13行\n被同波次的多个“簇火”命中时，后续“簇火”造成的伤害降低至15%\n该技能可随时主动关闭",
          "descRaw": "攻击力+108%；停止攻击以持续引导场地进入以下状态：每2.67秒在5行范围内，朝部署方向召唤“簇火”，“簇火”碰到敌人时爆炸造成攻击力130%的范围法术伤害；若目标处于灼燃损伤爆发期间则改为造成元素伤害\n过载：“簇火”生成间隔缩短至2秒，范围扩展最多13行\n被同波次的多个“簇火”命中时，后续“簇火”造成的伤害降低至15%\n该技能可随时主动关闭",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 36,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 45,
          "initSp": 38,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 1.08,
            "heatwave_atk_scale": 1.3,
            "normal_interval": 2.67,
            "overload_interval": 2,
            "wave_speed": 2.3,
            "normal_half_width": 2,
            "overload_half_width": 6,
            "projectile_range": 0.5,
            "range_radius": 1.5,
            "random_birth_delay": 0,
            "wave_exit_distance": 5,
            "same_wave_repeat_damage_scale": 0.15
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_oxi_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": true
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_4247_oxi",
        "portrait": "char_4247_oxi_1",
        "spine": "char_4247_oxi",
        "skillIcon": "skchr_oxi_3",
        "subProfIcon": "sub_primguard_icon"
      },
      "expansionBatch": "ursus-expansion-v1"
    },
    "chess_ursus_oxi_b": {
      "chessId": "chess_ursus_oxi_b",
      "baseId": "chess_ursus_oxi_a",
      "goldenId": "chess_ursus_oxi_b",
      "isGolden": true,
      "tier": 6,
      "identifier": 15011,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1506,
      "charId": "char_4247_oxi",
      "name": "塔露拉",
      "appellation": "Talulah",
      "rarity": "TIER_6",
      "profession": "WARRIOR",
      "subProfessionId": "primguard",
      "subProfessionName": "本源近卫",
      "position": "MELEE",
      "nationId": "ursus",
      "teamId": null,
      "bonds": [
        "ursusShip",
        "arcaneShip"
      ],
      "garrisonIds": [],
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
        "maxHp": 2743,
        "atk": 831,
        "def": 403,
        "res": 10,
        "cost": 23,
        "blockCnt": 2,
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
        "maxHp": 2743,
        "atk": 831,
        "def": 403,
        "res": 10,
        "cost": 23,
        "blockCnt": 2,
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
      "dmgType": "arts",
      "attackKind": "melee",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "trait": {
        "desc": "能够阻挡两个敌人，可以造成元素伤害",
        "descRaw": "能够阻挡两个敌人，可以造成元素伤害",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "能够阻挡两个敌人，可以造成元素伤害",
        "descRaw": "能够阻挡两个敌人，可以造成元素伤害",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "绝不妥协",
          "desc": "攻击造成法术伤害；造成法术伤害时附带11%的灼燃损伤；停止攻击3秒后法术和元素伤害逐渐提升（最高提升15%，每次攻击时衰减）",
          "descRaw": "攻击造成法术伤害；造成法术伤害时附带11%的灼燃损伤；停止攻击3秒后法术和元素伤害逐渐提升（最高提升15%，每次攻击时衰减）",
          "bb": {
            "arcane_idle_delay": 3,
            "arcane_step_interval": 0.5,
            "arcane_step": 0.025,
            "arcane_max": 0.15,
            "ep_damage_ratio": 0.11
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "我即火焰",
          "desc": "在场时，全场敌人灼燃损伤爆发后5秒内，于可通行地面留下持续3秒的“足迹”（最多25格），每0.3秒造成塔露拉攻击力12%的法术伤害",
          "descRaw": "在场时，全场敌人灼燃损伤爆发后5秒内，于可通行地面留下持续3秒的“足迹”（最多25格），每0.3秒造成塔露拉攻击力12%的法术伤害",
          "bb": {
            "field_duration": 3,
            "field_interval": 0.3,
            "field_atk_scale": 0.12,
            "max_count": 25
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "绝不妥协",
          "desc": "攻击造成法术伤害；造成法术伤害时附带11%的灼燃损伤；停止攻击3秒后法术和元素伤害逐渐提升（最高提升15%，每次攻击时衰减）",
          "descRaw": "攻击造成法术伤害；造成法术伤害时附带11%的灼燃损伤；停止攻击3秒后法术和元素伤害逐渐提升（最高提升15%，每次攻击时衰减）",
          "bb": {
            "arcane_idle_delay": 3,
            "arcane_step_interval": 0.5,
            "arcane_step": 0.025,
            "arcane_max": 0.15,
            "ep_damage_ratio": 0.11
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "我即火焰",
          "desc": "在场时，全场敌人灼燃损伤爆发后5秒内，于可通行地面留下持续3秒的“足迹”（最多25格），每0.3秒造成塔露拉攻击力12%的法术伤害",
          "descRaw": "在场时，全场敌人灼燃损伤爆发后5秒内，于可通行地面留下持续3秒的“足迹”（最多25格），每0.3秒造成塔露拉攻击力12%的法术伤害",
          "bb": {
            "field_duration": 3,
            "field_interval": 0.3,
            "field_atk_scale": 0.12,
            "max_count": 25
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_oxi_3",
        "iconId": "skchr_oxi_3",
        "name": "日冕重烈",
        "level": 7,
        "desc": "攻击力+120%；停止攻击以持续引导场地进入以下状态：每2.67秒在5行范围内，朝部署方向召唤“簇火”，“簇火”碰到敌人时爆炸造成攻击力175%的范围法术伤害；若目标处于灼燃损伤爆发期间则改为造成元素伤害\n过载：“簇火”生成间隔缩短至2秒，范围扩展最多13行\n被同波次的多个“簇火”命中时，后续“簇火”造成的伤害降低至15%\n该技能可随时主动关闭",
        "descRaw": "攻击力+120%；停止攻击以持续引导场地进入以下状态：每2.67秒在5行范围内，朝部署方向召唤“簇火”，“簇火”碰到敌人时爆炸造成攻击力175%的范围法术伤害；若目标处于灼燃损伤爆发期间则改为造成元素伤害\n过载：“簇火”生成间隔缩短至2秒，范围扩展最多13行\n被同波次的多个“簇火”命中时，后续“簇火”造成的伤害降低至15%\n该技能可随时主动关闭",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 36,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 45,
        "initSp": 38,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk": 1.2,
          "heatwave_atk_scale": 1.75,
          "normal_interval": 2.67,
          "overload_interval": 2,
          "wave_speed": 2.3,
          "normal_half_width": 2,
          "overload_half_width": 6,
          "projectile_range": 0.5,
          "range_radius": 1.5,
          "random_birth_delay": 0,
          "wave_exit_distance": 5,
          "same_wave_repeat_damage_scale": 0.15
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_oxi_3",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 2,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_oxi_1",
          "iconId": "skchr_oxi_1",
          "name": "照霎白夜",
          "level": 7,
          "desc": "对目标所在地块上的所有地面敌人造成攻击力490%的法术伤害，并造成2.5秒恐惧",
          "descRaw": "对目标所在地块上的所有地面敌人造成攻击力490%的法术伤害，并造成2.5秒恐惧",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": -1,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 8,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 4.9,
            "fear": 2.5
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_oxi_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_oxi_2",
          "iconId": "skchr_oxi_2",
          "name": "阂断骤雪",
          "level": 7,
          "desc": "获得90%的庇护（持续0.2秒后逐渐降低），对攻击来源造成塔露拉攻击力230%的范围法术伤害，并治疗塔露拉相当于伤害量5%的生命值；之后5秒内攻击所有阻挡的敌人，攻击力+47%和防御力+47%（可叠加5层）\n受到攻击后触发，可充能5次",
          "descRaw": "获得90%的庇护（持续0.2秒后逐渐降低），对攻击来源造成塔露拉攻击力230%的范围法术伤害，并治疗塔露拉相当于伤害量5%的生命值；之后5秒内攻击所有阻挡的敌人，攻击力+47%和防御力+47%（可叠加5层）\n受到攻击后触发，可充能5次",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 8,
          "initSp": 18,
          "maxChargeTime": 5,
          "increment": 1,
          "bb": {
            "skill_duration": 1.3,
            "damage_remaining_scale": 0.1,
            "damage_resistance": 0.9,
            "shelter_hold_duration": 0.2,
            "retaliate_atk_scale": 2.3,
            "heal_ratio": 0.05,
            "atk": 0.47,
            "def": 0.47,
            "max_stack_cnt": 5,
            "stack_duration": 5,
            "ability_range_radius": 1,
            "attack@buffed_attack_atk_scale": 1
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_oxi_2",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 1,
          "isDefault": false
        },
        {
          "skillId": "skchr_oxi_3",
          "iconId": "skchr_oxi_3",
          "name": "日冕重烈",
          "level": 7,
          "desc": "攻击力+120%；停止攻击以持续引导场地进入以下状态：每2.67秒在5行范围内，朝部署方向召唤“簇火”，“簇火”碰到敌人时爆炸造成攻击力175%的范围法术伤害；若目标处于灼燃损伤爆发期间则改为造成元素伤害\n过载：“簇火”生成间隔缩短至2秒，范围扩展最多13行\n被同波次的多个“簇火”命中时，后续“簇火”造成的伤害降低至15%\n该技能可随时主动关闭",
          "descRaw": "攻击力+120%；停止攻击以持续引导场地进入以下状态：每2.67秒在5行范围内，朝部署方向召唤“簇火”，“簇火”碰到敌人时爆炸造成攻击力175%的范围法术伤害；若目标处于灼燃损伤爆发期间则改为造成元素伤害\n过载：“簇火”生成间隔缩短至2秒，范围扩展最多13行\n被同波次的多个“簇火”命中时，后续“簇火”造成的伤害降低至15%\n该技能可随时主动关闭",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 36,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 45,
          "initSp": 38,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 1.2,
            "heatwave_atk_scale": 1.75,
            "normal_interval": 2.67,
            "overload_interval": 2,
            "wave_speed": 2.3,
            "normal_half_width": 2,
            "overload_half_width": 6,
            "projectile_range": 0.5,
            "range_radius": 1.5,
            "random_birth_delay": 0,
            "wave_exit_distance": 5,
            "same_wave_repeat_damage_scale": 0.15
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_oxi_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": true
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_4247_oxi_2",
        "portrait": "char_4247_oxi_2",
        "spine": "char_4247_oxi",
        "skillIcon": "skchr_oxi_3",
        "subProfIcon": "sub_primguard_icon"
      },
      "expansionBatch": "ursus-expansion-v1"
    }
  },
  "garrisons": {},
  "tokens": {},
  "oldMembers": [
    {
      "charId": "char_196_sunbr",
      "bonds": [
        "steadShip",
        "ursusShip",
        "ursusStudentShip"
      ],
      "ids": [
        "chess_char_1_10_a",
        "chess_char_1_10_b"
      ]
    },
    {
      "charId": "char_4207_branch",
      "bonds": [
        "steadShip",
        "soloShip",
        "ursusShip"
      ],
      "ids": [
        "chess_char_2_17_a",
        "chess_char_2_17_b"
      ]
    }
  ]
};
