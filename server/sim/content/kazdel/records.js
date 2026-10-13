// Generated from pinned GameData by tools/build-kazdel.mjs.
export const OVERLAY = {
  "id": "kazdel-expansion-v1",
  "version": "kazdel-test-8",
  "chess": {
    "chess_kz_vigna_a": {
      "chessId": "chess_kz_vigna_a",
      "baseId": "chess_kz_vigna_a",
      "goldenId": "chess_kz_vigna_b",
      "isGolden": false,
      "tier": 1,
      "identifier": 12001,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1101,
      "charId": "char_290_vigna",
      "name": "红豆",
      "appellation": "Vigna",
      "rarity": "TIER_4",
      "profession": "PIONEER",
      "subProfessionId": "charger",
      "position": "MELEE",
      "nationId": "columbia",
      "bonds": [
        "kazdelShip",
        "indomShip"
      ],
      "garrisonIds": [
        "kz_growth_vigna_a"
      ],
      "price": 2,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_kz_vigna_b",
      "status": {
        "phase": 1,
        "level": 55,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 1267,
        "atk": 458,
        "def": 281,
        "res": 0,
        "cost": 11,
        "blockCnt": 1,
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
      "statsBase": {
        "maxHp": 1267,
        "atk": 458,
        "def": 281,
        "res": 0,
        "cost": 11,
        "blockCnt": 1,
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
        "desc": "击杀敌人后获得1点部署费用，撤退时返还初始部署费用",
        "descRaw": "击杀敌人后获得1点部署费用，撤退时返还初始部署费用",
        "bb": {
          "cost": 1
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "击杀敌人后获得1点部署费用，撤退时返还初始部署费用",
        "descRaw": "击杀敌人后获得1点部署费用，撤退时返还初始部署费用",
        "bb": {
          "cost": 1
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "蛮力穿刺",
          "desc": "攻击时，10%几率当次攻击的攻击力+50%。技能中这个几率提高到30%",
          "descRaw": "攻击时，10%几率当次攻击的攻击力+50%。技能中这个几率提高到30%",
          "bb": {
            "atk": 0.5,
            "prob1": 0.1,
            "prob2": 0.3
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "蛮力穿刺",
          "desc": "攻击时，10%几率当次攻击的攻击力+50%。技能中这个几率提高到30%",
          "descRaw": "攻击时，10%几率当次攻击的攻击力+50%。技能中这个几率提高到30%",
          "bb": {
            "atk": 0.5,
            "prob1": 0.1,
            "prob2": 0.3
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_vigna_2",
        "iconId": "skchr_vigna_2",
        "name": "槌音",
        "level": 4,
        "desc": "攻击间隔略微增大，攻击力+120%",
        "descRaw": "攻击间隔略微增大，攻击力+120%",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 22,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 32,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk": 1.2,
          "base_attack_time": 0.5
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_vigna_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_vigna_1",
          "iconId": "skcom_atk_up[2]",
          "name": "攻击力强化·β型",
          "level": 4,
          "desc": "攻击力+35%",
          "descRaw": "攻击力+35%",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 25,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 37,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.35
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_vigna_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_vigna_2",
          "iconId": "skchr_vigna_2",
          "name": "槌音",
          "level": 4,
          "desc": "攻击间隔略微增大，攻击力+120%",
          "descRaw": "攻击间隔略微增大，攻击力+120%",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 22,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 32,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 1.2,
            "base_attack_time": 0.5
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_vigna_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_290_vigna",
        "portrait": "char_290_vigna_1",
        "spine": "char_290_vigna",
        "skillIcon": "skchr_vigna_2",
        "subProfIcon": "sub_charger_icon"
      },
      "expansionBatch": "kazdel-expansion-v1"
    },
    "chess_kz_vigna_b": {
      "chessId": "chess_kz_vigna_b",
      "baseId": "chess_kz_vigna_a",
      "goldenId": "chess_kz_vigna_b",
      "isGolden": true,
      "tier": 1,
      "identifier": 12001,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1101,
      "charId": "char_290_vigna",
      "name": "红豆",
      "appellation": "Vigna",
      "rarity": "TIER_4",
      "profession": "PIONEER",
      "subProfessionId": "charger",
      "position": "MELEE",
      "nationId": "columbia",
      "bonds": [
        "kazdelShip",
        "indomShip"
      ],
      "garrisonIds": [
        "kz_growth_vigna_b"
      ],
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
        "maxHp": 1764,
        "atk": 572,
        "def": 332,
        "res": 0,
        "cost": 11,
        "blockCnt": 1,
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
      "statsBase": {
        "maxHp": 1684,
        "atk": 532,
        "def": 332,
        "res": 0,
        "cost": 11,
        "blockCnt": 1,
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
        "desc": "击杀敌人后获得1点部署费用，撤退时返还初始部署费用",
        "descRaw": "击杀敌人后获得1点部署费用，撤退时返还初始部署费用",
        "bb": {
          "cost": 1,
          "hp_ratio": 0.4,
          "atk_scale": 1.15
        },
        "bbStr": {},
        "rangeGrid": null,
        "moduleDesc": "攻击生命值低于40%的敌人时攻击力提升至115%"
      },
      "traitBase": {
        "desc": "击杀敌人后获得1点部署费用，撤退时返还初始部署费用",
        "descRaw": "击杀敌人后获得1点部署费用，撤退时返还初始部署费用",
        "bb": {
          "cost": 1
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "蛮力穿刺",
          "desc": "攻击时，10%几率当次攻击的攻击力+100%。技能中这个几率提高到30%",
          "descRaw": "攻击时，10%几率当次攻击的攻击力+100%。技能中这个几率提高到30%",
          "bb": {
            "atk": 1,
            "prob1": 0.1,
            "prob2": 0.3
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": -1,
          "talentIndex": -1,
          "name": null,
          "desc": "",
          "bb": {
            "hp_ratio": 0.4,
            "atk_scale": 1.15
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
          "name": "蛮力穿刺",
          "desc": "攻击时，10%几率当次攻击的攻击力+100%。技能中这个几率提高到30%",
          "descRaw": "攻击时，10%几率当次攻击的攻击力+100%。技能中这个几率提高到30%",
          "bb": {
            "atk": 1,
            "prob1": 0.1,
            "prob2": 0.3
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_vigna_2",
        "iconId": "skchr_vigna_2",
        "name": "槌音",
        "level": 7,
        "desc": "攻击间隔略微增大，攻击力+150%",
        "descRaw": "攻击间隔略微增大，攻击力+150%",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 25,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 28,
        "initSp": 5,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk": 1.5,
          "base_attack_time": 0.5
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_vigna_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_vigna_1",
          "iconId": "skcom_atk_up[2]",
          "name": "攻击力强化·β型",
          "level": 7,
          "desc": "攻击力+50%",
          "descRaw": "攻击力+50%",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 25,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 37,
          "initSp": 5,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.5
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_vigna_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_vigna_2",
          "iconId": "skchr_vigna_2",
          "name": "槌音",
          "level": 7,
          "desc": "攻击间隔略微增大，攻击力+150%",
          "descRaw": "攻击间隔略微增大，攻击力+150%",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 25,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 28,
          "initSp": 5,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 1.5,
            "base_attack_time": 0.5
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_vigna_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        }
      ],
      "module": {
        "id": "uniequip_002_vigna",
        "name": "伟大的摇滚",
        "type": "CHG-Y",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_vigna",
          "name": "伟大的摇滚",
          "typeName": "CHG-Y",
          "isDefault": true,
          "level": 1,
          "attr": {
            "maxHp": 80,
            "atk": 40
          },
          "traitOverride": {
            "desc": "击杀敌人后获得1点部署费用，撤退时返还初始部署费用",
            "descRaw": "击杀敌人后获得1点部署费用，撤退时返还初始部署费用",
            "bb": {
              "cost": 1,
              "hp_ratio": 0.4,
              "atk_scale": 1.15
            },
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "攻击生命值低于40%的敌人时攻击力提升至115%"
          },
          "talentChanges": [
            {
              "talentIndex": -1,
              "name": null,
              "desc": "",
              "bb": {
                "hp_ratio": 0.4,
                "atk_scale": 1.15
              },
              "bbStr": {},
              "rangeGrid": null,
              "hidden": true
            }
          ]
        }
      ],
      "assets": {
        "avatar": "char_290_vigna_2",
        "portrait": "char_290_vigna_2",
        "spine": "char_290_vigna",
        "skillIcon": "skchr_vigna_2",
        "subProfIcon": "sub_charger_icon"
      },
      "expansionBatch": "kazdel-expansion-v1"
    },
    "chess_kz_hibisc_a": {
      "chessId": "chess_kz_hibisc_a",
      "baseId": "chess_kz_hibisc_a",
      "goldenId": "chess_kz_hibisc_b",
      "isGolden": false,
      "tier": 2,
      "identifier": 12002,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1102,
      "charId": "char_120_hibisc",
      "name": "芙蓉",
      "appellation": "Hibiscus",
      "rarity": "TIER_3",
      "profession": "MEDIC",
      "subProfessionId": "physician",
      "position": "RANGED",
      "nationId": "rhodes",
      "bonds": [
        "kazdelShip",
        "bloodlineShip"
      ],
      "garrisonIds": [
        "kz_growth_hibisc_a"
      ],
      "price": 3,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_kz_hibisc_b",
      "status": {
        "phase": 1,
        "level": 55,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 1220,
        "atk": 345,
        "def": 110,
        "res": 0,
        "cost": 17,
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
        "maxHp": 1220,
        "atk": 345,
        "def": 110,
        "res": 0,
        "cost": 17,
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
      "rangeId": "3-3",
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
        ],
        [
          -1,
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
      "dmgType": "heal",
      "attackKind": "heal",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "trait": {
        "desc": "恢复友方单位生命",
        "descRaw": "恢复友方单位生命",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "恢复友方单位生命",
        "descRaw": "恢复友方单位生命",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "治疗力提升",
          "desc": "攻击力+8%",
          "descRaw": "攻击力+8%",
          "bb": {
            "atk": 0.08
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "治疗力提升",
          "desc": "攻击力+8%",
          "descRaw": "攻击力+8%",
          "bb": {
            "atk": 0.08
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skcom_heal_up[1]",
        "iconId": "skcom_heal_up[1]",
        "name": "治疗强化·α型",
        "level": 4,
        "desc": "攻击力+30%",
        "descRaw": "攻击力+30%",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 20,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 35,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk": 0.3
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skcom_heal_up",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 0,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skcom_heal_up[1]",
          "iconId": "skcom_heal_up[1]",
          "name": "治疗强化·α型",
          "level": 4,
          "desc": "攻击力+30%",
          "descRaw": "攻击力+30%",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 20,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 35,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.3
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skcom_heal_up",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": true
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_120_hibisc",
        "portrait": "char_120_hibisc_1",
        "spine": "char_120_hibisc",
        "skillIcon": "skcom_heal_up[1]",
        "subProfIcon": "sub_physician_icon"
      },
      "expansionBatch": "kazdel-expansion-v1"
    },
    "chess_kz_hibisc_b": {
      "chessId": "chess_kz_hibisc_b",
      "baseId": "chess_kz_hibisc_a",
      "goldenId": "chess_kz_hibisc_b",
      "isGolden": true,
      "tier": 2,
      "identifier": 12002,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1102,
      "charId": "char_120_hibisc",
      "name": "芙蓉",
      "appellation": "Hibiscus",
      "rarity": "TIER_3",
      "profession": "MEDIC",
      "subProfessionId": "physician",
      "position": "RANGED",
      "nationId": "rhodes",
      "bonds": [
        "kazdelShip",
        "bloodlineShip"
      ],
      "garrisonIds": [
        "kz_growth_hibisc_b"
      ],
      "price": 3,
      "sellPrice": 3,
      "upgradeNum": 3,
      "upgradeChessId": null,
      "status": {
        "phase": 1,
        "level": 55,
        "skillLevel": 7,
        "equipLevel": 1
      },
      "stats": {
        "maxHp": 1220,
        "atk": 345,
        "def": 110,
        "res": 0,
        "cost": 17,
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
        "maxHp": 1220,
        "atk": 345,
        "def": 110,
        "res": 0,
        "cost": 17,
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
      "rangeId": "3-3",
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
        ],
        [
          -1,
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
      "dmgType": "heal",
      "attackKind": "heal",
      "projectile": "none",
      "canHitFly": false,
      "targetPriority": null,
      "trait": {
        "desc": "恢复友方单位生命",
        "descRaw": "恢复友方单位生命",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "恢复友方单位生命",
        "descRaw": "恢复友方单位生命",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "治疗力提升",
          "desc": "攻击力+8%",
          "descRaw": "攻击力+8%",
          "bb": {
            "atk": 0.08
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "治疗力提升",
          "desc": "攻击力+8%",
          "descRaw": "攻击力+8%",
          "bb": {
            "atk": 0.08
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skcom_heal_up[1]",
        "iconId": "skcom_heal_up[1]",
        "name": "治疗强化·α型",
        "level": 7,
        "desc": "攻击力+50%",
        "descRaw": "攻击力+50%",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 20,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 30,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk": 0.5
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skcom_heal_up",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 0,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skcom_heal_up[1]",
          "iconId": "skcom_heal_up[1]",
          "name": "治疗强化·α型",
          "level": 7,
          "desc": "攻击力+50%",
          "descRaw": "攻击力+50%",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 20,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 30,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.5
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skcom_heal_up",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": true
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_120_hibisc_2",
        "portrait": "char_120_hibisc_2",
        "spine": "char_120_hibisc",
        "skillIcon": "skcom_heal_up[1]",
        "subProfIcon": "sub_physician_icon"
      },
      "expansionBatch": "kazdel-expansion-v1"
    },
    "chess_kz_flameb_a": {
      "chessId": "chess_kz_flameb_a",
      "baseId": "chess_kz_flameb_a",
      "goldenId": "chess_kz_flameb_b",
      "isGolden": false,
      "tier": 2,
      "identifier": 12003,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1102,
      "charId": "char_131_flameb",
      "name": "炎客",
      "appellation": "Flamebringer",
      "rarity": "TIER_5",
      "profession": "WARRIOR",
      "subProfessionId": "fearless",
      "position": "MELEE",
      "nationId": "rhodes",
      "bonds": [
        "kazdelShip",
        "bloodlineShip"
      ],
      "garrisonIds": [
        "kz_growth_flameb_a"
      ],
      "price": 3,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_kz_flameb_b",
      "status": {
        "phase": 1,
        "level": 60,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 2815,
        "atk": 738,
        "def": 155,
        "res": 0,
        "cost": 20,
        "blockCnt": 1,
        "bat": 1.5,
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
        "maxHp": 2815,
        "atk": 738,
        "def": 155,
        "res": 0,
        "cost": 20,
        "blockCnt": 1,
        "bat": 1.5,
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
          "name": "血戮",
          "desc": "每击杀一名敌人后自身的生命上限提高20，最多可以叠加30次",
          "descRaw": "每击杀一名敌人后自身的生命上限提高20，最多可以叠加30次",
          "bb": {
            "max_hp": 20,
            "max_stack_cnt": 30
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "血戮",
          "desc": "每击杀一名敌人后自身的生命上限提高20，最多可以叠加30次",
          "descRaw": "每击杀一名敌人后自身的生命上限提高20，最多可以叠加30次",
          "bb": {
            "max_hp": 20,
            "max_stack_cnt": 30
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_flameb_1",
        "iconId": "skchr_flameb_1",
        "name": "歃血",
        "level": 4,
        "desc": "下次攻击的攻击力提高至170%，并回复自身6%的生命",
        "descRaw": "下次攻击的攻击力提高至170%，并回复自身6%的生命",
        "skillType": "AUTO",
        "durationType": "NONE",
        "duration": 0,
        "spType": "INCREASE_WHEN_ATTACK",
        "spCost": 4,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk_scale": 1.7,
          "hp_ratio": 0.06
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_flameb_1",
        "trigger": {
          "rule": "SP_FULL"
        },
        "index": 0,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_flameb_1",
          "iconId": "skchr_flameb_1",
          "name": "歃血",
          "level": 4,
          "desc": "下次攻击的攻击力提高至170%，并回复自身6%的生命",
          "descRaw": "下次攻击的攻击力提高至170%，并回复自身6%的生命",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 4,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 1.7,
            "hp_ratio": 0.06
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_flameb_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": true
        },
        {
          "skillId": "skchr_flameb_2",
          "iconId": "skchr_flameb_2",
          "name": "刃鬼",
          "level": 4,
          "desc": "攻击力+40%，攻击速度+30\n持续时间无限",
          "descRaw": "攻击力+40%，攻击速度+30\n持续时间无限",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 54,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.4,
            "attack_speed": 30
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_flameb_2",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 1,
          "isDefault": false
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_131_flameb",
        "portrait": "char_131_flameb_1",
        "spine": "char_131_flameb",
        "skillIcon": "skchr_flameb_1",
        "subProfIcon": "sub_fearless_icon"
      },
      "expansionBatch": "kazdel-expansion-v1"
    },
    "chess_kz_flameb_b": {
      "chessId": "chess_kz_flameb_b",
      "baseId": "chess_kz_flameb_a",
      "goldenId": "chess_kz_flameb_b",
      "isGolden": true,
      "tier": 2,
      "identifier": 12003,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1102,
      "charId": "char_131_flameb",
      "name": "炎客",
      "appellation": "Flamebringer",
      "rarity": "TIER_5",
      "profession": "WARRIOR",
      "subProfessionId": "fearless",
      "position": "MELEE",
      "nationId": "rhodes",
      "bonds": [
        "kazdelShip",
        "bloodlineShip"
      ],
      "garrisonIds": [
        "kz_growth_flameb_b"
      ],
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
        "maxHp": 3898,
        "atk": 868,
        "def": 184,
        "res": 0,
        "cost": 20,
        "blockCnt": 1,
        "bat": 1.5,
        "aspd": 104,
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
        "maxHp": 3598,
        "atk": 868,
        "def": 184,
        "res": 0,
        "cost": 20,
        "blockCnt": 1,
        "bat": 1.5,
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
        "bb": {
          "attack_speed": 30,
          "max_hp": 0.4,
          "hp_ratio": 1,
          "value": 0.6
        },
        "bbStr": {},
        "rangeGrid": null,
        "moduleDesc": "被击倒时不撤退且回复所有生命但生命上限-60%，攻击速度+30（单次部署只触发1次）"
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
          "name": "血戮",
          "desc": "每击杀一名敌人后自身的生命上限提高40，最多可以叠加30次",
          "descRaw": "每击杀一名敌人后自身的生命上限提高40，最多可以叠加30次",
          "bb": {
            "max_hp": 40,
            "max_stack_cnt": 30
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "血戮",
          "desc": "每击杀一名敌人后自身的生命上限提高40，最多可以叠加30次",
          "descRaw": "每击杀一名敌人后自身的生命上限提高40，最多可以叠加30次",
          "bb": {
            "max_hp": 40,
            "max_stack_cnt": 30
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_flameb_1",
        "iconId": "skchr_flameb_1",
        "name": "歃血",
        "level": 7,
        "desc": "下次攻击的攻击力提高至190%，并回复自身7%的生命",
        "descRaw": "下次攻击的攻击力提高至190%，并回复自身7%的生命",
        "skillType": "AUTO",
        "durationType": "NONE",
        "duration": 0,
        "spType": "INCREASE_WHEN_ATTACK",
        "spCost": 4,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk_scale": 1.9,
          "hp_ratio": 0.07
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_flameb_1",
        "trigger": {
          "rule": "SP_FULL"
        },
        "index": 0,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_flameb_1",
          "iconId": "skchr_flameb_1",
          "name": "歃血",
          "level": 7,
          "desc": "下次攻击的攻击力提高至190%，并回复自身7%的生命",
          "descRaw": "下次攻击的攻击力提高至190%，并回复自身7%的生命",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 4,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 1.9,
            "hp_ratio": 0.07
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_flameb_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": true
        },
        {
          "skillId": "skchr_flameb_2",
          "iconId": "skchr_flameb_2",
          "name": "刃鬼",
          "level": 7,
          "desc": "攻击力+50%，攻击速度+30\n持续时间无限",
          "descRaw": "攻击力+50%，攻击速度+30\n持续时间无限",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 48,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.5,
            "attack_speed": 30
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_flameb_2",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 1,
          "isDefault": false
        }
      ],
      "module": {
        "id": "uniequip_002_flameb",
        "name": "锈损的断刀",
        "type": "DRE-Y",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_flameb",
          "name": "锈损的断刀",
          "typeName": "DRE-Y",
          "isDefault": true,
          "level": 1,
          "attr": {
            "maxHp": 300,
            "aspd": 4
          },
          "traitOverride": {
            "desc": "能够阻挡一个敌人",
            "descRaw": "能够阻挡一个敌人",
            "bb": {
              "attack_speed": 30,
              "max_hp": 0.4,
              "hp_ratio": 1,
              "value": 0.6
            },
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "被击倒时不撤退且回复所有生命但生命上限-60%，攻击速度+30（单次部署只触发1次）"
          },
          "talentChanges": []
        }
      ],
      "assets": {
        "avatar": "char_131_flameb_2",
        "portrait": "char_131_flameb_2",
        "spine": "char_131_flameb",
        "skillIcon": "skchr_flameb_1",
        "subProfIcon": "sub_fearless_icon"
      },
      "expansionBatch": "kazdel-expansion-v1"
    },
    "chess_kz_meteo_a": {
      "chessId": "chess_kz_meteo_a",
      "baseId": "chess_kz_meteo_a",
      "goldenId": "chess_kz_meteo_b",
      "isGolden": false,
      "tier": 3,
      "identifier": 12004,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1103,
      "charId": "char_219_meteo",
      "name": "陨星",
      "appellation": "Meteorite",
      "rarity": "TIER_5",
      "profession": "SNIPER",
      "subProfessionId": "aoesniper",
      "subProfessionName": "炮手",
      "position": "RANGED",
      "nationId": "rhodes",
      "bonds": [
        "kazdelShip"
      ],
      "garrisonIds": [
        "kz_growth_meteo_a"
      ],
      "price": 3,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_kz_meteo_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 1204,
        "atk": 674,
        "def": 98,
        "res": 0,
        "cost": 28,
        "blockCnt": 1,
        "bat": 2.8,
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
        "maxHp": 1204,
        "atk": 674,
        "def": 98,
        "res": 0,
        "cost": 28,
        "blockCnt": 1,
        "bat": 2.8,
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
        "desc": "攻击造成群体物理伤害",
        "descRaw": "攻击造成群体物理伤害",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "攻击造成群体物理伤害",
        "descRaw": "攻击造成群体物理伤害",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "爆破附着改装",
          "desc": "普通攻击和技能释放时，30%几率当次攻击的攻击力+60%",
          "descRaw": "普通攻击和技能释放时，30%几率当次攻击的攻击力+60%",
          "bb": {
            "atk": 0.6,
            "prob": 0.3
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "爆破附着改装",
          "desc": "普通攻击和技能释放时，30%几率当次攻击的攻击力+60%",
          "descRaw": "普通攻击和技能释放时，30%几率当次攻击的攻击力+60%",
          "bb": {
            "atk": 0.6,
            "prob": 0.3
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_meteo_1",
        "iconId": "skchr_meteo_1",
        "name": "霰射弹头",
        "level": 4,
        "desc": "下次攻击的爆炸范围扩大，造成相当于攻击力150%的物理伤害",
        "descRaw": "下次攻击的爆炸范围扩大，造成相当于攻击力150%的物理伤害",
        "skillType": "AUTO",
        "durationType": "NONE",
        "duration": 0,
        "spType": "INCREASE_WHEN_ATTACK",
        "spCost": 4,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk_scale": 1.5
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_meteo_1",
        "trigger": {
          "rule": "SP_FULL"
        },
        "index": 0,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_meteo_1",
          "iconId": "skchr_meteo_1",
          "name": "霰射弹头",
          "level": 4,
          "desc": "下次攻击的爆炸范围扩大，造成相当于攻击力150%的物理伤害",
          "descRaw": "下次攻击的爆炸范围扩大，造成相当于攻击力150%的物理伤害",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 4,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 1.5
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_meteo_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": true
        },
        {
          "skillId": "skchr_meteo_2",
          "iconId": "skchr_meteo_2",
          "name": "高爆弹头",
          "level": 4,
          "desc": "立即发射一枚火焰弹，对目标范围内所有敌人造成相当于攻击力210%的物理伤害，所有命中目标在10秒内防御力-170",
          "descRaw": "立即发射一枚火焰弹，对目标范围内所有敌人造成相当于攻击力210%的物理伤害，所有命中目标在10秒内防御力-170",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": -1,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 24,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 2.1,
            "def": -170,
            "duration": 10
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_meteo_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_219_meteo",
        "portrait": "char_219_meteo_1",
        "spine": "char_219_meteo",
        "skillIcon": "skchr_meteo_1",
        "subProfIcon": "sub_aoesniper_icon"
      },
      "expansionBatch": "kazdel-expansion-v1"
    },
    "chess_kz_meteo_b": {
      "chessId": "chess_kz_meteo_b",
      "baseId": "chess_kz_meteo_a",
      "goldenId": "chess_kz_meteo_b",
      "isGolden": true,
      "tier": 3,
      "identifier": 12004,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1103,
      "charId": "char_219_meteo",
      "name": "陨星",
      "appellation": "Meteorite",
      "rarity": "TIER_5",
      "profession": "SNIPER",
      "subProfessionId": "aoesniper",
      "subProfessionName": "炮手",
      "position": "RANGED",
      "nationId": "rhodes",
      "bonds": [
        "kazdelShip"
      ],
      "garrisonIds": [
        "kz_growth_meteo_b"
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
        "maxHp": 1529,
        "atk": 854,
        "def": 111,
        "res": 0,
        "cost": 28,
        "blockCnt": 1,
        "bat": 2.8,
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
        "maxHp": 1429,
        "atk": 817,
        "def": 111,
        "res": 0,
        "cost": 28,
        "blockCnt": 1,
        "bat": 2.8,
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
        "desc": "攻击造成群体物理伤害",
        "descRaw": "攻击造成群体物理伤害",
        "bb": {
          "def_penetrate_fixed": 100
        },
        "bbStr": {},
        "rangeGrid": null,
        "moduleDesc": "攻击时无视敌人100点的防御力"
      },
      "traitBase": {
        "desc": "攻击造成群体物理伤害",
        "descRaw": "攻击造成群体物理伤害",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "爆破附着改装",
          "desc": "普通攻击和技能释放时，30%几率当次攻击的攻击力+60%",
          "descRaw": "普通攻击和技能释放时，30%几率当次攻击的攻击力+60%",
          "bb": {
            "atk": 0.6,
            "prob": 0.3
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "爆破附着改装",
          "desc": "普通攻击和技能释放时，30%几率当次攻击的攻击力+60%",
          "descRaw": "普通攻击和技能释放时，30%几率当次攻击的攻击力+60%",
          "bb": {
            "atk": 0.6,
            "prob": 0.3
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_meteo_1",
        "iconId": "skchr_meteo_1",
        "name": "霰射弹头",
        "level": 7,
        "desc": "下次攻击的爆炸范围扩大，造成相当于攻击力170%的物理伤害",
        "descRaw": "下次攻击的爆炸范围扩大，造成相当于攻击力170%的物理伤害",
        "skillType": "AUTO",
        "durationType": "NONE",
        "duration": 0,
        "spType": "INCREASE_WHEN_ATTACK",
        "spCost": 4,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk_scale": 1.7
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_meteo_1",
        "trigger": {
          "rule": "SP_FULL"
        },
        "index": 0,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_meteo_1",
          "iconId": "skchr_meteo_1",
          "name": "霰射弹头",
          "level": 7,
          "desc": "下次攻击的爆炸范围扩大，造成相当于攻击力170%的物理伤害",
          "descRaw": "下次攻击的爆炸范围扩大，造成相当于攻击力170%的物理伤害",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 4,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 1.7
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_meteo_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": true
        },
        {
          "skillId": "skchr_meteo_2",
          "iconId": "skchr_meteo_2",
          "name": "高爆弹头",
          "level": 7,
          "desc": "立即发射一枚火焰弹，对目标范围内所有敌人造成相当于攻击力240%的物理伤害，所有命中目标在10秒内防御力-210",
          "descRaw": "立即发射一枚火焰弹，对目标范围内所有敌人造成相当于攻击力240%的物理伤害，所有命中目标在10秒内防御力-210",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": -1,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 23,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 2.4,
            "def": -210,
            "duration": 10
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_meteo_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false
        }
      ],
      "module": {
        "id": "uniequip_002_meteo",
        "name": "无名的身份牌",
        "type": "ART-Y",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_meteo",
          "name": "无名的身份牌",
          "typeName": "ART-Y",
          "isDefault": true,
          "level": 1,
          "attr": {
            "maxHp": 100,
            "atk": 37
          },
          "traitOverride": {
            "desc": "攻击造成群体物理伤害",
            "descRaw": "攻击造成群体物理伤害",
            "bb": {
              "def_penetrate_fixed": 100
            },
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "攻击时无视敌人100点的防御力"
          },
          "talentChanges": []
        }
      ],
      "assets": {
        "avatar": "char_219_meteo_2",
        "portrait": "char_219_meteo_2",
        "spine": "char_219_meteo",
        "skillIcon": "skchr_meteo_1",
        "subProfIcon": "sub_aoesniper_icon"
      },
      "expansionBatch": "kazdel-expansion-v1"
    },
    "chess_kz_cqbw_a": {
      "chessId": "chess_kz_cqbw_a",
      "baseId": "chess_kz_cqbw_a",
      "goldenId": "chess_kz_cqbw_b",
      "isGolden": false,
      "tier": 3,
      "identifier": 12005,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1103,
      "charId": "char_113_cqbw",
      "name": "W",
      "appellation": "W",
      "rarity": "TIER_6",
      "profession": "SNIPER",
      "subProfessionId": "aoesniper",
      "subProfessionName": "炮手",
      "position": "RANGED",
      "nationId": null,
      "bonds": [
        "kazdelShip"
      ],
      "garrisonIds": [
        "kz_growth_cqbw_a"
      ],
      "price": 3,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_kz_cqbw_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 1284,
        "atk": 711,
        "def": 112,
        "res": 0,
        "cost": 29,
        "blockCnt": 1,
        "bat": 2.8,
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
        "maxHp": 1284,
        "atk": 711,
        "def": 112,
        "res": 0,
        "cost": 29,
        "blockCnt": 1,
        "bat": 2.8,
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
        "desc": "攻击造成群体物理伤害",
        "descRaw": "攻击造成群体物理伤害",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "攻击造成群体物理伤害",
        "descRaw": "攻击造成群体物理伤害",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "设伏",
          "desc": "在战场停留10秒后获得60%的物理和法术闪避，且不容易成为敌人的攻击目标",
          "descRaw": "在战场停留10秒后获得60%的物理和法术闪避，且不容易成为敌人的攻击目标",
          "bb": {
            "interval": 10,
            "prob": 0.6,
            "taunt_level": -1
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "落井下石",
          "desc": "攻击范围内的敌人在被晕眩时受到的物理伤害+18%",
          "descRaw": "攻击范围内的敌人在被晕眩时受到的物理伤害+18%",
          "bb": {
            "damage_scale": 1.18
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "设伏",
          "desc": "在战场停留10秒后获得60%的物理和法术闪避，且不容易成为敌人的攻击目标",
          "descRaw": "在战场停留10秒后获得60%的物理和法术闪避，且不容易成为敌人的攻击目标",
          "bb": {
            "interval": 10,
            "prob": 0.6,
            "taunt_level": -1
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "落井下石",
          "desc": "攻击范围内的敌人在被晕眩时受到的物理伤害+18%",
          "descRaw": "攻击范围内的敌人在被晕眩时受到的物理伤害+18%",
          "bb": {
            "damage_scale": 1.18
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_cqbw_1",
        "iconId": "skchr_cqbw_1",
        "name": "红桃K",
        "level": 4,
        "desc": "立即发射一枚榴弹，造成相当于攻击力270%的物理伤害，并使命中目标晕眩1.8秒",
        "descRaw": "立即发射一枚榴弹，造成相当于攻击力270%的物理伤害，并使命中目标晕眩1.8秒",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": -1,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 22,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk_scale": 2.7,
          "stun": 1.8
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_cqbw_1",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 0,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_cqbw_1",
          "iconId": "skchr_cqbw_1",
          "name": "红桃K",
          "level": 4,
          "desc": "立即发射一枚榴弹，造成相当于攻击力270%的物理伤害，并使命中目标晕眩1.8秒",
          "descRaw": "立即发射一枚榴弹，造成相当于攻击力270%的物理伤害，并使命中目标晕眩1.8秒",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": -1,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 22,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 2.7,
            "stun": 1.8
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_cqbw_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": true
        },
        {
          "skillId": "skchr_cqbw_2",
          "iconId": "skchr_cqbw_2",
          "name": "惊吓盒子",
          "level": 4,
          "desc": "下次攻击变为在攻击范围内的一个可放置地块埋下地雷（持续120秒）；地雷在敌人经过时会爆炸，爆炸后对周围所有敌人造成相当于攻击力220%的物理伤害并令其晕眩1.6秒",
          "descRaw": "下次攻击变为在攻击范围内的一个可放置地块埋下地雷（持续120秒）；地雷在敌人经过时会爆炸，爆炸后对周围所有敌人造成相当于攻击力220%的物理伤害并令其晕眩1.6秒",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 11,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 2.2,
            "stun": 1.6
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_cqbw_2",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 1,
          "isDefault": false
        },
        {
          "skillId": "skchr_cqbw_3",
          "iconId": "skchr_cqbw_3",
          "name": "D12",
          "level": 4,
          "desc": "在攻击范围内生命值最多的3个敌人身上放置一枚炸弹；炸弹会在一定延迟后引爆，每个对其周围的所有敌人造成相当于攻击力250%的物理伤害并令其晕眩3.5秒",
          "descRaw": "在攻击范围内生命值最多的3个敌人身上放置一枚炸弹；炸弹会在一定延迟后引爆，每个对其周围的所有敌人造成相当于攻击力250%的物理伤害并令其晕眩3.5秒",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 42,
          "initSp": 14,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "max_target": 3,
            "atk_scale": 2.5,
            "stun": 3.5
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_cqbw_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": false
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_113_cqbw",
        "portrait": "char_113_cqbw_1",
        "spine": "char_113_cqbw",
        "skillIcon": "skchr_cqbw_1",
        "subProfIcon": "sub_aoesniper_icon"
      },
      "expansionBatch": "kazdel-expansion-v1"
    },
    "chess_kz_cqbw_b": {
      "chessId": "chess_kz_cqbw_b",
      "baseId": "chess_kz_cqbw_a",
      "goldenId": "chess_kz_cqbw_b",
      "isGolden": true,
      "tier": 3,
      "identifier": 12005,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1103,
      "charId": "char_113_cqbw",
      "name": "W",
      "appellation": "W",
      "rarity": "TIER_6",
      "profession": "SNIPER",
      "subProfessionId": "aoesniper",
      "subProfessionName": "炮手",
      "position": "RANGED",
      "nationId": null,
      "bonds": [
        "kazdelShip"
      ],
      "garrisonIds": [
        "kz_growth_cqbw_b"
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
        "maxHp": 1627,
        "atk": 898,
        "def": 126,
        "res": 0,
        "cost": 29,
        "blockCnt": 1,
        "bat": 2.8,
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
        "maxHp": 1497,
        "atk": 844,
        "def": 126,
        "res": 0,
        "cost": 29,
        "blockCnt": 1,
        "bat": 2.8,
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
        "desc": "攻击造成群体物理伤害",
        "descRaw": "攻击造成群体物理伤害",
        "bb": {
          "atk_scale": 1.1
        },
        "bbStr": {},
        "rangeGrid": null,
        "moduleDesc": "攻击被阻挡的敌人时攻击力提升至110%"
      },
      "traitBase": {
        "desc": "攻击造成群体物理伤害",
        "descRaw": "攻击造成群体物理伤害",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "设伏",
          "desc": "在战场停留10秒后获得60%的物理和法术闪避，且不容易成为敌人的攻击目标",
          "descRaw": "在战场停留10秒后获得60%的物理和法术闪避，且不容易成为敌人的攻击目标",
          "bb": {
            "interval": 10,
            "prob": 0.6,
            "taunt_level": -1
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "落井下石",
          "desc": "攻击范围内的敌人在被晕眩时受到的物理伤害+18%",
          "descRaw": "攻击范围内的敌人在被晕眩时受到的物理伤害+18%",
          "bb": {
            "damage_scale": 1.18
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "设伏",
          "desc": "在战场停留10秒后获得60%的物理和法术闪避，且不容易成为敌人的攻击目标",
          "descRaw": "在战场停留10秒后获得60%的物理和法术闪避，且不容易成为敌人的攻击目标",
          "bb": {
            "interval": 10,
            "prob": 0.6,
            "taunt_level": -1
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "落井下石",
          "desc": "攻击范围内的敌人在被晕眩时受到的物理伤害+18%",
          "descRaw": "攻击范围内的敌人在被晕眩时受到的物理伤害+18%",
          "bb": {
            "damage_scale": 1.18
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_cqbw_1",
        "iconId": "skchr_cqbw_1",
        "name": "红桃K",
        "level": 7,
        "desc": "立即发射一枚榴弹，造成相当于攻击力310%的物理伤害，并使命中目标晕眩2.1秒",
        "descRaw": "立即发射一枚榴弹，造成相当于攻击力310%的物理伤害，并使命中目标晕眩2.1秒",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": -1,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 19,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk_scale": 3.1,
          "stun": 2.1
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_cqbw_1",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 0,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_cqbw_1",
          "iconId": "skchr_cqbw_1",
          "name": "红桃K",
          "level": 7,
          "desc": "立即发射一枚榴弹，造成相当于攻击力310%的物理伤害，并使命中目标晕眩2.1秒",
          "descRaw": "立即发射一枚榴弹，造成相当于攻击力310%的物理伤害，并使命中目标晕眩2.1秒",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": -1,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 19,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 3.1,
            "stun": 2.1
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_cqbw_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": true
        },
        {
          "skillId": "skchr_cqbw_2",
          "iconId": "skchr_cqbw_2",
          "name": "惊吓盒子",
          "level": 7,
          "desc": "下次攻击变为在攻击范围内的一个可放置地块埋下地雷（持续120秒）；地雷在敌人经过时会爆炸，爆炸后对周围所有敌人造成相当于攻击力250%的物理伤害并令其晕眩1.8秒",
          "descRaw": "下次攻击变为在攻击范围内的一个可放置地块埋下地雷（持续120秒）；地雷在敌人经过时会爆炸，爆炸后对周围所有敌人造成相当于攻击力250%的物理伤害并令其晕眩1.8秒",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 10,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 2.5,
            "stun": 1.8
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_cqbw_2",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 1,
          "isDefault": false
        },
        {
          "skillId": "skchr_cqbw_3",
          "iconId": "skchr_cqbw_3",
          "name": "D12",
          "level": 7,
          "desc": "在攻击范围内生命值最多的3个敌人身上放置一枚炸弹；炸弹会在一定延迟后引爆，每个对其周围的所有敌人造成相当于攻击力280%的物理伤害并令其晕眩4秒",
          "descRaw": "在攻击范围内生命值最多的3个敌人身上放置一枚炸弹；炸弹会在一定延迟后引爆，每个对其周围的所有敌人造成相当于攻击力280%的物理伤害并令其晕眩4秒",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 39,
          "initSp": 17,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "max_target": 3,
            "atk_scale": 2.8,
            "stun": 4
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_cqbw_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": false
        }
      ],
      "module": {
        "id": "uniequip_002_cqbw",
        "name": "佣兵的行囊",
        "type": "ART-X",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_cqbw",
          "name": "佣兵的行囊",
          "typeName": "ART-X",
          "isDefault": true,
          "level": 1,
          "attr": {
            "maxHp": 130,
            "atk": 54
          },
          "traitOverride": {
            "desc": "攻击造成群体物理伤害",
            "descRaw": "攻击造成群体物理伤害",
            "bb": {
              "atk_scale": 1.1
            },
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "攻击被阻挡的敌人时攻击力提升至110%"
          },
          "talentChanges": []
        },
        {
          "uniEquipId": "uniequip_003_cqbw",
          "name": "刺棱钝刃",
          "typeName": "ART-Y",
          "isDefault": false,
          "level": 1,
          "attr": {
            "maxHp": 160,
            "atk": 45
          },
          "traitOverride": {
            "desc": "攻击造成群体物理伤害",
            "descRaw": "攻击造成群体物理伤害",
            "bb": {
              "def_penetrate_fixed": 100
            },
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "攻击时无视敌人100点的防御力"
          },
          "talentChanges": []
        }
      ],
      "assets": {
        "avatar": "char_113_cqbw_2",
        "portrait": "char_113_cqbw_2",
        "spine": "char_113_cqbw",
        "skillIcon": "skchr_cqbw_1",
        "subProfIcon": "sub_aoesniper_icon"
      },
      "expansionBatch": "kazdel-expansion-v1"
    },
    "chess_kz_hodrer_a": {
      "chessId": "chess_kz_hodrer_a",
      "baseId": "chess_kz_hodrer_a",
      "goldenId": "chess_kz_hodrer_b",
      "isGolden": false,
      "tier": 5,
      "identifier": 12006,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1105,
      "charId": "char_4088_hodrer",
      "name": "赫德雷",
      "appellation": "Hoederer",
      "rarity": "TIER_6",
      "profession": "WARRIOR",
      "subProfessionId": "crusher",
      "position": "MELEE",
      "nationId": null,
      "bonds": [
        "kazdelShip",
        "bloodlineShip"
      ],
      "garrisonIds": [
        "kz_growth_hodrer_a"
      ],
      "price": 4,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_kz_hodrer_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 4670,
        "atk": 1323,
        "def": 0,
        "res": 0,
        "cost": 24,
        "blockCnt": 2,
        "bat": 2.5,
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
        "maxHp": 4670,
        "atk": 1323,
        "def": 0,
        "res": 0,
        "cost": 24,
        "blockCnt": 2,
        "bat": 2.5,
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
        "desc": "同时攻击阻挡的所有敌人",
        "descRaw": "同时攻击阻挡的所有敌人",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "同时攻击阻挡的所有敌人",
        "descRaw": "同时攻击阻挡的所有敌人",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "及锋而试",
          "desc": "攻击敌人时攻击力提升至110%，若目标处于晕眩、束缚则改为提升至140%",
          "descRaw": "攻击敌人时攻击力提升至110%，若目标处于晕眩、束缚则改为提升至140%",
          "bb": {
            "atk_scale": 1.4,
            "atk_scale_2": 1.1
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "余火之氅",
          "desc": "使自身与身后一格的友军获得18%的庇护",
          "descRaw": "使自身与身后一格的友军获得18%的庇护",
          "bb": {
            "damage_resistance": 0.18
          },
          "bbStr": {},
          "rangeGrid": [
            [
              0,
              -1
            ],
            [
              0,
              0
            ]
          ],
          "hidden": false,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "及锋而试",
          "desc": "攻击敌人时攻击力提升至110%，若目标处于晕眩、束缚则改为提升至140%",
          "descRaw": "攻击敌人时攻击力提升至110%，若目标处于晕眩、束缚则改为提升至140%",
          "bb": {
            "atk_scale": 1.4,
            "atk_scale_2": 1.1
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "余火之氅",
          "desc": "使自身与身后一格的友军获得18%的庇护",
          "descRaw": "使自身与身后一格的友军获得18%的庇护",
          "bb": {
            "damage_resistance": 0.18
          },
          "bbStr": {},
          "rangeGrid": [
            [
              0,
              -1
            ],
            [
              0,
              0
            ]
          ],
          "hidden": false,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_hodrer_3",
        "iconId": "skchr_hodrer_3",
        "name": "死境硝烟",
        "level": 4,
        "desc": "每秒流失100点生命，并使自身攻击过和攻击过自身的敌人每秒受到200点真实伤害；攻击距离+1，生命上限+30%，攻击力+60%，每次攻击回复自身5%的生命且有25%概率使目标晕眩3秒",
        "descRaw": "每秒流失100点生命，并使自身攻击过和攻击过自身的敌人每秒受到200点真实伤害；攻击距离+1，生命上限+30%，攻击力+60%，每次攻击回复自身5%的生命且有25%概率使目标晕眩3秒",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 70,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 70,
        "initSp": 40,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "max_hp": 0.3,
          "atk": 0.6,
          "attack@hp_ratio": 0.05,
          "attack@buff_prob": 0.25,
          "attack@stun": 3,
          "ability_range_forward_extend": 1,
          "attack@value": 100,
          "attack@damage": 200
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_hodrer_3",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 2,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_hodrer_1",
          "iconId": "skchr_hodrer_1",
          "name": "重锋不熄",
          "level": 4,
          "desc": "下次攻击造成相当于攻击力180%的物理伤害，并回复自身15%的生命",
          "descRaw": "下次攻击造成相当于攻击力180%的物理伤害，并回复自身15%的生命",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": -1,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 3,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 1.8,
            "hp_ratio": 0.15
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_hodrer_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_hodrer_2",
          "iconId": "skchr_hodrer_2",
          "name": "余烬重荷",
          "level": 4,
          "desc": "被动效果：攻击力+16%\n主动触发可以在下列状态和初始状态间切换：\n攻击间隔略微增大，阻挡数+1，攻击使目标晕眩1秒",
          "descRaw": "被动效果：攻击力+16%\n主动触发可以在下列状态和初始状态间切换：\n攻击间隔略微增大，阻挡数+1，攻击使目标晕眩1秒",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": -1,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 9,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.16,
            "base_attack_time": 0.5,
            "block_cnt": 1,
            "attack@stun": 1
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_hodrer_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false
        },
        {
          "skillId": "skchr_hodrer_3",
          "iconId": "skchr_hodrer_3",
          "name": "死境硝烟",
          "level": 4,
          "desc": "每秒流失100点生命，并使自身攻击过和攻击过自身的敌人每秒受到200点真实伤害；攻击距离+1，生命上限+30%，攻击力+60%，每次攻击回复自身5%的生命且有25%概率使目标晕眩3秒",
          "descRaw": "每秒流失100点生命，并使自身攻击过和攻击过自身的敌人每秒受到200点真实伤害；攻击距离+1，生命上限+30%，攻击力+60%，每次攻击回复自身5%的生命且有25%概率使目标晕眩3秒",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 70,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 70,
          "initSp": 40,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "max_hp": 0.3,
            "atk": 0.6,
            "attack@hp_ratio": 0.05,
            "attack@buff_prob": 0.25,
            "attack@stun": 3,
            "ability_range_forward_extend": 1,
            "attack@value": 100,
            "attack@damage": 200
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_hodrer_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": true
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_4088_hodrer",
        "portrait": "char_4088_hodrer_1",
        "spine": "char_4088_hodrer",
        "skillIcon": "skchr_hodrer_3",
        "subProfIcon": "sub_crusher_icon"
      },
      "expansionBatch": "kazdel-expansion-v1"
    },
    "chess_kz_hodrer_b": {
      "chessId": "chess_kz_hodrer_b",
      "baseId": "chess_kz_hodrer_a",
      "goldenId": "chess_kz_hodrer_b",
      "isGolden": true,
      "tier": 5,
      "identifier": 12006,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1105,
      "charId": "char_4088_hodrer",
      "name": "赫德雷",
      "appellation": "Hoederer",
      "rarity": "TIER_6",
      "profession": "WARRIOR",
      "subProfessionId": "crusher",
      "position": "MELEE",
      "nationId": null,
      "bonds": [
        "kazdelShip",
        "bloodlineShip"
      ],
      "garrisonIds": [
        "kz_growth_hodrer_b"
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
        "maxHp": 5834,
        "atk": 1583,
        "def": 0,
        "res": 0,
        "cost": 24,
        "blockCnt": 2,
        "bat": 2.5,
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
        "maxHp": 5544,
        "atk": 1491,
        "def": 0,
        "res": 0,
        "cost": 24,
        "blockCnt": 2,
        "bat": 2.5,
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
        "desc": "同时攻击阻挡的所有敌人",
        "descRaw": "同时攻击阻挡的所有敌人",
        "bb": {
          "heal_scale": 1.2
        },
        "bbStr": {},
        "rangeGrid": null,
        "moduleDesc": "受到的治疗效果提升20%"
      },
      "traitBase": {
        "desc": "同时攻击阻挡的所有敌人",
        "descRaw": "同时攻击阻挡的所有敌人",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "及锋而试",
          "desc": "攻击敌人时攻击力提升至110%，若目标处于晕眩、束缚则改为提升至140%",
          "descRaw": "攻击敌人时攻击力提升至110%，若目标处于晕眩、束缚则改为提升至140%",
          "bb": {
            "atk_scale": 1.4,
            "atk_scale_2": 1.1
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "余火之氅",
          "desc": "使自身与身后一格的友军获得18%的庇护",
          "descRaw": "使自身与身后一格的友军获得18%的庇护",
          "bb": {
            "damage_resistance": 0.18
          },
          "bbStr": {},
          "rangeGrid": [
            [
              0,
              -1
            ],
            [
              0,
              0
            ]
          ],
          "hidden": false,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "及锋而试",
          "desc": "攻击敌人时攻击力提升至110%，若目标处于晕眩、束缚则改为提升至140%",
          "descRaw": "攻击敌人时攻击力提升至110%，若目标处于晕眩、束缚则改为提升至140%",
          "bb": {
            "atk_scale": 1.4,
            "atk_scale_2": 1.1
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "余火之氅",
          "desc": "使自身与身后一格的友军获得18%的庇护",
          "descRaw": "使自身与身后一格的友军获得18%的庇护",
          "bb": {
            "damage_resistance": 0.18
          },
          "bbStr": {},
          "rangeGrid": [
            [
              0,
              -1
            ],
            [
              0,
              0
            ]
          ],
          "hidden": false,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_hodrer_3",
        "iconId": "skchr_hodrer_3",
        "name": "死境硝烟",
        "level": 7,
        "desc": "每秒流失100点生命，并使自身攻击过和攻击过自身的敌人每秒受到200点真实伤害；攻击距离+1，生命上限+45%，攻击力+90%，每次攻击回复自身5%的生命且有25%概率使目标晕眩4秒",
        "descRaw": "每秒流失100点生命，并使自身攻击过和攻击过自身的敌人每秒受到200点真实伤害；攻击距离+1，生命上限+45%，攻击力+90%，每次攻击回复自身5%的生命且有25%概率使目标晕眩4秒",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 70,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 60,
        "initSp": 40,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "max_hp": 0.45,
          "atk": 0.9,
          "attack@hp_ratio": 0.05,
          "attack@buff_prob": 0.25,
          "attack@stun": 4,
          "ability_range_forward_extend": 1,
          "attack@value": 100,
          "attack@damage": 200
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_hodrer_3",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 2,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_hodrer_1",
          "iconId": "skchr_hodrer_1",
          "name": "重锋不熄",
          "level": 7,
          "desc": "下次攻击造成相当于攻击力200%的物理伤害，并回复自身20%的生命",
          "descRaw": "下次攻击造成相当于攻击力200%的物理伤害，并回复自身20%的生命",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": -1,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 3,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 2,
            "hp_ratio": 0.2
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_hodrer_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_hodrer_2",
          "iconId": "skchr_hodrer_2",
          "name": "余烬重荷",
          "level": 7,
          "desc": "被动效果：攻击力+28%\n主动触发可以在下列状态和初始状态间切换：\n攻击间隔略微增大，阻挡数+1，攻击使目标晕眩1秒",
          "descRaw": "被动效果：攻击力+28%\n主动触发可以在下列状态和初始状态间切换：\n攻击间隔略微增大，阻挡数+1，攻击使目标晕眩1秒",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": -1,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 8,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.28,
            "base_attack_time": 0.5,
            "block_cnt": 1,
            "attack@stun": 1
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_hodrer_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false
        },
        {
          "skillId": "skchr_hodrer_3",
          "iconId": "skchr_hodrer_3",
          "name": "死境硝烟",
          "level": 7,
          "desc": "每秒流失100点生命，并使自身攻击过和攻击过自身的敌人每秒受到200点真实伤害；攻击距离+1，生命上限+45%，攻击力+90%，每次攻击回复自身5%的生命且有25%概率使目标晕眩4秒",
          "descRaw": "每秒流失100点生命，并使自身攻击过和攻击过自身的敌人每秒受到200点真实伤害；攻击距离+1，生命上限+45%，攻击力+90%，每次攻击回复自身5%的生命且有25%概率使目标晕眩4秒",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 70,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 60,
          "initSp": 40,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "max_hp": 0.45,
            "atk": 0.9,
            "attack@hp_ratio": 0.05,
            "attack@buff_prob": 0.25,
            "attack@stun": 4,
            "ability_range_forward_extend": 1,
            "attack@value": 100,
            "attack@damage": 200
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_hodrer_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": true
        }
      ],
      "module": {
        "id": "uniequip_002_hodrer",
        "name": "新的生活",
        "type": "CRU-X",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_hodrer",
          "name": "新的生活",
          "typeName": "CRU-X",
          "isDefault": true,
          "level": 1,
          "attr": {
            "maxHp": 290,
            "atk": 92
          },
          "traitOverride": {
            "desc": "同时攻击阻挡的所有敌人",
            "descRaw": "同时攻击阻挡的所有敌人",
            "bb": {
              "heal_scale": 1.2
            },
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "受到的治疗效果提升20%"
          },
          "talentChanges": []
        },
        {
          "uniEquipId": "uniequip_003_hodrer",
          "name": "笔迹",
          "typeName": "CRU-Y",
          "isDefault": false,
          "level": 1,
          "attr": {
            "maxHp": 300,
            "atk": 110
          },
          "traitOverride": {
            "desc": "同时攻击阻挡的所有敌人",
            "descRaw": "同时攻击阻挡的所有敌人",
            "bb": {
              "damage_scale": 1.1
            },
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "对被阻挡的敌人伤害提升至110%"
          },
          "talentChanges": []
        }
      ],
      "assets": {
        "avatar": "char_4088_hodrer_2",
        "portrait": "char_4088_hodrer_2",
        "spine": "char_4088_hodrer",
        "skillIcon": "skchr_hodrer_3",
        "subProfIcon": "sub_crusher_icon"
      },
      "expansionBatch": "kazdel-expansion-v1"
    },
    "chess_kz_logos_a": {
      "chessId": "chess_kz_logos_a",
      "baseId": "chess_kz_logos_a",
      "goldenId": "chess_kz_logos_b",
      "isGolden": false,
      "tier": 6,
      "identifier": 12007,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1106,
      "charId": "char_4133_logos",
      "name": "逻各斯",
      "appellation": "Logos",
      "rarity": "TIER_6",
      "profession": "CASTER",
      "subProfessionId": "corecaster",
      "subProfessionName": "中坚术师",
      "position": "RANGED",
      "nationId": "rhodes",
      "bonds": [
        "kazdelShip",
        "arcaneShip"
      ],
      "garrisonIds": [
        "kz_growth_logos_a"
      ],
      "price": 4,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_kz_logos_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 1297,
        "atk": 556,
        "def": 106,
        "res": 20,
        "cost": 21,
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
        "maxHp": 1297,
        "atk": 556,
        "def": 106,
        "res": 20,
        "cost": 21,
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
          "name": "语汇演化",
          "desc": "对一个目标发起攻击时，有40%几率额外对攻击范围内一个随机目标造成相当于攻击力60%的法术伤害并使其停顿0.8秒",
          "descRaw": "对一个目标发起攻击时，有40%几率额外对攻击范围内一个随机目标造成相当于攻击力60%的法术伤害并使其停顿0.8秒",
          "bb": {
            "prob": 0.4,
            "atk_scale": 0.6,
            "sluggish": 0.8
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "剜魂具辞",
          "desc": "攻击使目标在5秒内法术抗性-10且受到的法术伤害提高150点",
          "descRaw": "攻击使目标在5秒内法术抗性-10且受到的法术伤害提高150点",
          "bb": {
            "duration": 5,
            "magic_resistance": -10,
            "atk_addition": 150
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "语汇演化",
          "desc": "对一个目标发起攻击时，有40%几率额外对攻击范围内一个随机目标造成相当于攻击力60%的法术伤害并使其停顿0.8秒",
          "descRaw": "对一个目标发起攻击时，有40%几率额外对攻击范围内一个随机目标造成相当于攻击力60%的法术伤害并使其停顿0.8秒",
          "bb": {
            "prob": 0.4,
            "atk_scale": 0.6,
            "sluggish": 0.8
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "剜魂具辞",
          "desc": "攻击使目标在5秒内法术抗性-10且受到的法术伤害提高150点",
          "descRaw": "攻击使目标在5秒内法术抗性-10且受到的法术伤害提高150点",
          "bb": {
            "duration": 5,
            "magic_resistance": -10,
            "atk_addition": 150
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_logos_2",
        "iconId": "skchr_logos_2",
        "name": "提喻",
        "level": 4,
        "desc": "法术抗性+40，攻击改为锁定一个目标对其每0.5秒造成一次相当于攻击力35%的法术伤害，对相同目标的伤害逐渐提高至3倍并使其移动速度逐渐降低至40%(锁定5秒后达到上限)，被打断或目标倒下时重新索敌且效果重置",
        "descRaw": "法术抗性+40，攻击改为锁定一个目标对其每0.5秒造成一次相当于攻击力35%的法术伤害，对相同目标的伤害逐渐提高至3倍并使其移动速度逐渐降低至40%(锁定5秒后达到上限)，被打断或目标倒下时重新索敌且效果重置",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 20,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 39,
        "initSp": 20,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "magic_resistance": 40,
          "attack@cooldown": 0.5,
          "attack@atk_scale_base": 0.35,
          "attack@atk_scale_delta": 0.07,
          "attack@move_speed": -0.06,
          "attack@max_stack_cnt": 10
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_logos_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_logos_1",
          "iconId": "skchr_logos_1",
          "name": "殁亡",
          "level": 4,
          "desc": "攻击范围扩大，攻击力+40%，使攻击范围内生命值低于逻各斯攻击力90%的敌人立刻倒下、并对另一个随机目标造成与倒下单位生命值相等的法术伤害\n持续时间无限",
          "descRaw": "攻击范围扩大，攻击力+40%，使攻击范围内生命值低于逻各斯攻击力90%的敌人立刻倒下、并对另一个随机目标造成与倒下单位生命值相等的法术伤害\n持续时间无限",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": -1,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 74,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.4,
            "attack@kill_atk_scale": 0.9,
            "attack@kill_damage": 9999999
          },
          "bbStr": {},
          "rangeId": "3-3",
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
            ],
            [
              -1,
              3
            ]
          ],
          "prefabId": "skchr_logos_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_logos_2",
          "iconId": "skchr_logos_2",
          "name": "提喻",
          "level": 4,
          "desc": "法术抗性+40，攻击改为锁定一个目标对其每0.5秒造成一次相当于攻击力35%的法术伤害，对相同目标的伤害逐渐提高至3倍并使其移动速度逐渐降低至40%(锁定5秒后达到上限)，被打断或目标倒下时重新索敌且效果重置",
          "descRaw": "法术抗性+40，攻击改为锁定一个目标对其每0.5秒造成一次相当于攻击力35%的法术伤害，对相同目标的伤害逐渐提高至3倍并使其移动速度逐渐降低至40%(锁定5秒后达到上限)，被打断或目标倒下时重新索敌且效果重置",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 20,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 39,
          "initSp": 20,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "magic_resistance": 40,
            "attack@cooldown": 0.5,
            "attack@atk_scale_base": 0.35,
            "attack@atk_scale_delta": 0.07,
            "attack@move_speed": -0.06,
            "attack@max_stack_cnt": 10
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_logos_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        },
        {
          "skillId": "skchr_logos_3",
          "iconId": "skchr_logos_3",
          "name": "延异视阈",
          "level": 4,
          "desc": "攻击范围扩大，攻击力+160%，同时攻击3个目标，使攻击范围内敌方子弹的飞行速度大幅降低、并在技能结束时将其全部清除",
          "descRaw": "攻击范围扩大，攻击力+160%，同时攻击3个目标，使攻击范围内敌方子弹的飞行速度大幅降低、并在技能结束时将其全部清除",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 30,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 45,
          "initSp": 9,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 1.6,
            "attack@max_target": 3,
            "projectile_move_scale": 0.05
          },
          "bbStr": {},
          "rangeId": "3-4",
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
          "prefabId": "skchr_logos_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": false
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_4133_logos",
        "portrait": "char_4133_logos_1",
        "spine": "char_4133_logos",
        "skillIcon": "skchr_logos_2",
        "subProfIcon": "sub_corecaster_icon"
      },
      "expansionBatch": "kazdel-expansion-v1"
    },
    "chess_kz_logos_b": {
      "chessId": "chess_kz_logos_b",
      "baseId": "chess_kz_logos_a",
      "goldenId": "chess_kz_logos_b",
      "isGolden": true,
      "tier": 6,
      "identifier": 12007,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1106,
      "charId": "char_4133_logos",
      "name": "逻各斯",
      "appellation": "Logos",
      "rarity": "TIER_6",
      "profession": "CASTER",
      "subProfessionId": "corecaster",
      "subProfessionName": "中坚术师",
      "position": "RANGED",
      "nationId": "rhodes",
      "bonds": [
        "kazdelShip",
        "arcaneShip"
      ],
      "garrisonIds": [
        "kz_growth_logos_b"
      ],
      "price": 4,
      "sellPrice": 4,
      "upgradeNum": 3,
      "upgradeChessId": null,
      "status": {
        "phase": 2,
        "level": 60,
        "skillLevel": 7,
        "equipLevel": 3
      },
      "stats": {
        "maxHp": 1710,
        "atk": 699,
        "def": 115,
        "res": 20,
        "cost": 21,
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
        "maxHp": 1540,
        "atk": 632,
        "def": 115,
        "res": 20,
        "cost": 21,
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
        "desc": "攻击造成法术伤害",
        "descRaw": "攻击造成法术伤害",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null,
        "moduleDesc": "造成法术伤害时附带相当于8%伤害的凋亡损伤"
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
          "name": "语汇演化",
          "desc": "对一个目标发起攻击时，有40%几率额外对攻击范围内一个随机目标造成相当于攻击力60%的法术伤害并使其停顿0.8秒",
          "descRaw": "对一个目标发起攻击时，有40%几率额外对攻击范围内一个随机目标造成相当于攻击力60%的法术伤害并使其停顿0.8秒",
          "bb": {
            "prob": 0.4,
            "atk_scale": 0.6,
            "sluggish": 0.8
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "剜魂具辞",
          "desc": "攻击使目标在5秒内法术抗性-10且受到的法术伤害提高150点",
          "descRaw": "攻击使目标在5秒内法术抗性-10且受到的法术伤害提高150点",
          "bb": {
            "duration": 5,
            "magic_resistance": -10,
            "atk_addition": 150
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": -1,
          "talentIndex": -1,
          "name": null,
          "desc": "",
          "bb": {
            "ep_damage_ratio": 0.08
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": true,
          "fromModule": true
        },
        {
          "index": 0,
          "talentIndex": 0,
          "name": "语汇演化",
          "desc": "对一个目标发起攻击时，有60%几率额外对攻击范围内一个随机目标造成相当于攻击力60%的法术伤害并使其停顿0.8秒，若该随机目标处于凋亡损伤爆发期间则同时造成相当于攻击力60%的元素伤害",
          "bb": {
            "prob": 0.6,
            "atk_scale": 0.6,
            "sluggish": 0.8,
            "element_atk_scale": 0.6
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": true
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "语汇演化",
          "desc": "对一个目标发起攻击时，有40%几率额外对攻击范围内一个随机目标造成相当于攻击力60%的法术伤害并使其停顿0.8秒",
          "descRaw": "对一个目标发起攻击时，有40%几率额外对攻击范围内一个随机目标造成相当于攻击力60%的法术伤害并使其停顿0.8秒",
          "bb": {
            "prob": 0.4,
            "atk_scale": 0.6,
            "sluggish": 0.8
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "剜魂具辞",
          "desc": "攻击使目标在5秒内法术抗性-10且受到的法术伤害提高150点",
          "descRaw": "攻击使目标在5秒内法术抗性-10且受到的法术伤害提高150点",
          "bb": {
            "duration": 5,
            "magic_resistance": -10,
            "atk_addition": 150
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_logos_2",
        "iconId": "skchr_logos_2",
        "name": "提喻",
        "level": 7,
        "desc": "法术抗性+50，攻击改为锁定一个目标对其每0.5秒造成一次相当于攻击力50%的法术伤害，对相同目标的伤害逐渐提高至3倍并使其移动速度逐渐降低至40%(锁定5秒后达到上限)，被打断或目标倒下时重新索敌且效果重置",
        "descRaw": "法术抗性+50，攻击改为锁定一个目标对其每0.5秒造成一次相当于攻击力50%的法术伤害，对相同目标的伤害逐渐提高至3倍并使其移动速度逐渐降低至40%(锁定5秒后达到上限)，被打断或目标倒下时重新索敌且效果重置",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 20,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 36,
        "initSp": 20,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "magic_resistance": 50,
          "attack@cooldown": 0.5,
          "attack@atk_scale_base": 0.5,
          "attack@atk_scale_delta": 0.1,
          "attack@move_speed": -0.06,
          "attack@max_stack_cnt": 10
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_logos_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_logos_1",
          "iconId": "skchr_logos_1",
          "name": "殁亡",
          "level": 7,
          "desc": "攻击范围扩大，攻击力+70%，使攻击范围内生命值低于逻各斯攻击力120%的敌人立刻倒下、并对另一个随机目标造成与倒下单位生命值相等的法术伤害\n持续时间无限",
          "descRaw": "攻击范围扩大，攻击力+70%，使攻击范围内生命值低于逻各斯攻击力120%的敌人立刻倒下、并对另一个随机目标造成与倒下单位生命值相等的法术伤害\n持续时间无限",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": -1,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 68,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.7,
            "attack@kill_atk_scale": 1.2,
            "attack@kill_damage": 9999999
          },
          "bbStr": {},
          "rangeId": "3-3",
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
            ],
            [
              -1,
              3
            ]
          ],
          "prefabId": "skchr_logos_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_logos_2",
          "iconId": "skchr_logos_2",
          "name": "提喻",
          "level": 7,
          "desc": "法术抗性+50，攻击改为锁定一个目标对其每0.5秒造成一次相当于攻击力50%的法术伤害，对相同目标的伤害逐渐提高至3倍并使其移动速度逐渐降低至40%(锁定5秒后达到上限)，被打断或目标倒下时重新索敌且效果重置",
          "descRaw": "法术抗性+50，攻击改为锁定一个目标对其每0.5秒造成一次相当于攻击力50%的法术伤害，对相同目标的伤害逐渐提高至3倍并使其移动速度逐渐降低至40%(锁定5秒后达到上限)，被打断或目标倒下时重新索敌且效果重置",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 20,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 36,
          "initSp": 20,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "magic_resistance": 50,
            "attack@cooldown": 0.5,
            "attack@atk_scale_base": 0.5,
            "attack@atk_scale_delta": 0.1,
            "attack@move_speed": -0.06,
            "attack@max_stack_cnt": 10
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_logos_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        },
        {
          "skillId": "skchr_logos_3",
          "iconId": "skchr_logos_3",
          "name": "延异视阈",
          "level": 7,
          "desc": "攻击范围扩大，攻击力+220%，同时攻击3个目标，使攻击范围内敌方子弹的飞行速度大幅降低、并在技能结束时将其全部清除",
          "descRaw": "攻击范围扩大，攻击力+220%，同时攻击3个目标，使攻击范围内敌方子弹的飞行速度大幅降低、并在技能结束时将其全部清除",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 30,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 45,
          "initSp": 18,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 2.2,
            "attack@max_target": 3,
            "projectile_move_scale": 0.05
          },
          "bbStr": {},
          "rangeId": "3-4",
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
          "prefabId": "skchr_logos_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": false
        }
      ],
      "module": {
        "id": "uniequip_002_logos",
        "name": "来自河谷的笔盒",
        "type": "CCR-D",
        "level": 3,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_logos",
          "name": "来自河谷的笔盒",
          "typeName": "CCR-D",
          "isDefault": true,
          "level": 3,
          "attr": {
            "maxHp": 170,
            "atk": 67
          },
          "traitOverride": {
            "desc": "攻击造成法术伤害",
            "descRaw": "攻击造成法术伤害",
            "bb": {},
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "造成法术伤害时附带相当于8%伤害的凋亡损伤"
          },
          "talentChanges": [
            {
              "talentIndex": -1,
              "name": null,
              "desc": "",
              "bb": {
                "ep_damage_ratio": 0.08
              },
              "bbStr": {},
              "rangeGrid": null,
              "hidden": true
            },
            {
              "talentIndex": 0,
              "name": "语汇演化",
              "desc": "对一个目标发起攻击时，有60%几率额外对攻击范围内一个随机目标造成相当于攻击力60%的法术伤害并使其停顿0.8秒，若该随机目标处于凋亡损伤爆发期间则同时造成相当于攻击力60%的元素伤害",
              "bb": {
                "prob": 0.6,
                "atk_scale": 0.6,
                "sluggish": 0.8,
                "element_atk_scale": 0.6
              },
              "bbStr": {},
              "rangeGrid": null,
              "hidden": false
            }
          ]
        },
        {
          "uniEquipId": "uniequip_003_logos",
          "name": "《语义范式百科》",
          "typeName": "CCR-Y",
          "isDefault": false,
          "level": 3,
          "attr": {
            "atk": 60,
            "res": 5
          },
          "traitOverride": {
            "desc": "攻击造成法术伤害",
            "descRaw": "攻击造成法术伤害",
            "bb": {
              "sp": 1
            },
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "普通攻击命中精英或领袖敌人时获得1点技力"
          },
          "talentChanges": [
            {
              "talentIndex": 0,
              "name": "语汇演化",
              "desc": "对一个目标发起攻击时，有40%几率额外对攻击范围内两个随机目标造成相当于攻击力65%的法术伤害并使其停顿0.8秒",
              "bb": {
                "prob": 0.4,
                "atk_scale": 0.65,
                "sluggish": 0.8,
                "emit_count": 2
              },
              "bbStr": {},
              "rangeGrid": null,
              "hidden": false
            }
          ]
        }
      ],
      "assets": {
        "avatar": "char_4133_logos_2",
        "portrait": "char_4133_logos_2",
        "spine": "char_4133_logos",
        "skillIcon": "skchr_logos_2",
        "subProfIcon": "sub_corecaster_icon"
      },
      "expansionBatch": "kazdel-expansion-v1"
    }
  },
  "garrisons": {
    "kz_growth_vigna_a": {
      "garrisonId": "kz_growth_vigna_a",
      "expansionBatch": "kazdel-expansion-v1",
      "name": "行动积累",
      "eventType": "SERVER_PREP_FIN",
      "effectKey": "kz_growth_vigna",
      "desc": "上一普通战斗实际生命变化每累计25%开战最大生命，普通+1、精锐+2层；有效攻击、治疗或在场8秒另获1／2层，同名最多6／10层、多副本取最高；全队每轮最多18／30／40层。技能献血回血计魂契，魂火救援与纯还债不计；血脉仍用旧门槛，排除新技能献血回血。",
      "bb": {},
      "bbStr": {
        "conditionkey": "character_target_inboard"
      },
      "owners": [
        "chess_kz_vigna_a"
      ]
    },
    "kz_growth_vigna_b": {
      "garrisonId": "kz_growth_vigna_b",
      "expansionBatch": "kazdel-expansion-v1",
      "name": "行动积累",
      "eventType": "SERVER_PREP_FIN",
      "effectKey": "kz_growth_vigna",
      "desc": "上一普通战斗实际生命变化每累计25%开战最大生命，普通+1、精锐+2层；有效攻击、治疗或在场8秒另获1／2层，同名最多6／10层、多副本取最高；全队每轮最多18／30／40层。技能献血回血计魂契，魂火救援与纯还债不计；血脉仍用旧门槛，排除新技能献血回血。",
      "bb": {},
      "bbStr": {
        "conditionkey": "character_target_inboard"
      },
      "owners": [
        "chess_kz_vigna_b"
      ]
    },
    "kz_growth_hibisc_a": {
      "garrisonId": "kz_growth_hibisc_a",
      "expansionBatch": "kazdel-expansion-v1",
      "name": "行动积累",
      "eventType": "SERVER_PREP_FIN",
      "effectKey": "kz_growth_hibisc",
      "desc": "上一普通战斗实际生命变化每累计25%开战最大生命，普通+1、精锐+2层；有效攻击、治疗或在场8秒另获1／2层，同名最多6／10层、多副本取最高；全队每轮最多18／30／40层。技能献血回血计魂契，魂火救援与纯还债不计；血脉仍用旧门槛，排除新技能献血回血。",
      "bb": {},
      "bbStr": {
        "conditionkey": "character_target_inboard"
      },
      "owners": [
        "chess_kz_hibisc_a"
      ]
    },
    "kz_growth_hibisc_b": {
      "garrisonId": "kz_growth_hibisc_b",
      "expansionBatch": "kazdel-expansion-v1",
      "name": "行动积累",
      "eventType": "SERVER_PREP_FIN",
      "effectKey": "kz_growth_hibisc",
      "desc": "上一普通战斗实际生命变化每累计25%开战最大生命，普通+1、精锐+2层；有效攻击、治疗或在场8秒另获1／2层，同名最多6／10层、多副本取最高；全队每轮最多18／30／40层。技能献血回血计魂契，魂火救援与纯还债不计；血脉仍用旧门槛，排除新技能献血回血。",
      "bb": {},
      "bbStr": {
        "conditionkey": "character_target_inboard"
      },
      "owners": [
        "chess_kz_hibisc_b"
      ]
    },
    "kz_growth_flameb_a": {
      "garrisonId": "kz_growth_flameb_a",
      "expansionBatch": "kazdel-expansion-v1",
      "name": "行动积累",
      "eventType": "SERVER_PREP_FIN",
      "effectKey": "kz_growth_flameb",
      "desc": "上一普通战斗实际生命变化每累计25%开战最大生命，普通+1、精锐+2层；有效攻击、治疗或在场8秒另获1／2层，同名最多6／10层、多副本取最高；全队每轮最多18／30／40层。技能献血回血计魂契，魂火救援与纯还债不计；血脉仍用旧门槛，排除新技能献血回血。",
      "bb": {},
      "bbStr": {
        "conditionkey": "character_target_inboard"
      },
      "owners": [
        "chess_kz_flameb_a"
      ]
    },
    "kz_growth_flameb_b": {
      "garrisonId": "kz_growth_flameb_b",
      "expansionBatch": "kazdel-expansion-v1",
      "name": "行动积累",
      "eventType": "SERVER_PREP_FIN",
      "effectKey": "kz_growth_flameb",
      "desc": "上一普通战斗实际生命变化每累计25%开战最大生命，普通+1、精锐+2层；有效攻击、治疗或在场8秒另获1／2层，同名最多6／10层、多副本取最高；全队每轮最多18／30／40层。技能献血回血计魂契，魂火救援与纯还债不计；血脉仍用旧门槛，排除新技能献血回血。",
      "bb": {},
      "bbStr": {
        "conditionkey": "character_target_inboard"
      },
      "owners": [
        "chess_kz_flameb_b"
      ]
    },
    "kz_growth_meteo_a": {
      "garrisonId": "kz_growth_meteo_a",
      "expansionBatch": "kazdel-expansion-v1",
      "name": "行动积累",
      "eventType": "SERVER_PREP_FIN",
      "effectKey": "kz_growth_meteo",
      "desc": "上一普通战斗实际生命变化每累计25%开战最大生命，普通+1、精锐+2层；有效攻击、治疗或在场8秒另获1／2层，同名最多6／10层、多副本取最高；全队每轮最多18／30／40层。技能献血回血计魂契，魂火救援与纯还债不计；血脉仍用旧门槛，排除新技能献血回血。",
      "bb": {},
      "bbStr": {
        "conditionkey": "character_target_inboard"
      },
      "owners": [
        "chess_kz_meteo_a"
      ]
    },
    "kz_growth_meteo_b": {
      "garrisonId": "kz_growth_meteo_b",
      "expansionBatch": "kazdel-expansion-v1",
      "name": "行动积累",
      "eventType": "SERVER_PREP_FIN",
      "effectKey": "kz_growth_meteo",
      "desc": "上一普通战斗实际生命变化每累计25%开战最大生命，普通+1、精锐+2层；有效攻击、治疗或在场8秒另获1／2层，同名最多6／10层、多副本取最高；全队每轮最多18／30／40层。技能献血回血计魂契，魂火救援与纯还债不计；血脉仍用旧门槛，排除新技能献血回血。",
      "bb": {},
      "bbStr": {
        "conditionkey": "character_target_inboard"
      },
      "owners": [
        "chess_kz_meteo_b"
      ]
    },
    "kz_growth_cqbw_a": {
      "garrisonId": "kz_growth_cqbw_a",
      "expansionBatch": "kazdel-expansion-v1",
      "name": "行动积累",
      "eventType": "SERVER_PREP_FIN",
      "effectKey": "kz_growth_cqbw",
      "desc": "上一普通战斗实际生命变化每累计25%开战最大生命，普通+1、精锐+2层；有效攻击、治疗或在场8秒另获1／2层，同名最多6／10层、多副本取最高；全队每轮最多18／30／40层。技能献血回血计魂契，魂火救援与纯还债不计；血脉仍用旧门槛，排除新技能献血回血。",
      "bb": {},
      "bbStr": {
        "conditionkey": "character_target_inboard"
      },
      "owners": [
        "chess_kz_cqbw_a"
      ]
    },
    "kz_growth_cqbw_b": {
      "garrisonId": "kz_growth_cqbw_b",
      "expansionBatch": "kazdel-expansion-v1",
      "name": "行动积累",
      "eventType": "SERVER_PREP_FIN",
      "effectKey": "kz_growth_cqbw",
      "desc": "上一普通战斗实际生命变化每累计25%开战最大生命，普通+1、精锐+2层；有效攻击、治疗或在场8秒另获1／2层，同名最多6／10层、多副本取最高；全队每轮最多18／30／40层。技能献血回血计魂契，魂火救援与纯还债不计；血脉仍用旧门槛，排除新技能献血回血。",
      "bb": {},
      "bbStr": {
        "conditionkey": "character_target_inboard"
      },
      "owners": [
        "chess_kz_cqbw_b"
      ]
    },
    "kz_growth_hodrer_a": {
      "garrisonId": "kz_growth_hodrer_a",
      "expansionBatch": "kazdel-expansion-v1",
      "name": "行动积累",
      "eventType": "SERVER_PREP_FIN",
      "effectKey": "kz_growth_hodrer",
      "desc": "上一普通战斗实际生命变化每累计25%开战最大生命，普通+1、精锐+2层；有效攻击、治疗或在场8秒另获1／2层，同名最多6／10层、多副本取最高；全队每轮最多18／30／40层。技能献血回血计魂契，魂火救援与纯还债不计；血脉仍用旧门槛，排除新技能献血回血。",
      "bb": {},
      "bbStr": {
        "conditionkey": "character_target_inboard"
      },
      "owners": [
        "chess_kz_hodrer_a"
      ]
    },
    "kz_growth_hodrer_b": {
      "garrisonId": "kz_growth_hodrer_b",
      "expansionBatch": "kazdel-expansion-v1",
      "name": "行动积累",
      "eventType": "SERVER_PREP_FIN",
      "effectKey": "kz_growth_hodrer",
      "desc": "上一普通战斗实际生命变化每累计25%开战最大生命，普通+1、精锐+2层；有效攻击、治疗或在场8秒另获1／2层，同名最多6／10层、多副本取最高；全队每轮最多18／30／40层。技能献血回血计魂契，魂火救援与纯还债不计；血脉仍用旧门槛，排除新技能献血回血。",
      "bb": {},
      "bbStr": {
        "conditionkey": "character_target_inboard"
      },
      "owners": [
        "chess_kz_hodrer_b"
      ]
    },
    "kz_growth_logos_a": {
      "garrisonId": "kz_growth_logos_a",
      "expansionBatch": "kazdel-expansion-v1",
      "name": "行动积累",
      "eventType": "SERVER_PREP_FIN",
      "effectKey": "kz_growth_logos",
      "desc": "上一普通战斗实际生命变化每累计25%开战最大生命，普通+1、精锐+2层；有效攻击、治疗或在场8秒另获1／2层，同名最多6／10层、多副本取最高；全队每轮最多18／30／40层。技能献血回血计魂契，魂火救援与纯还债不计；血脉仍用旧门槛，排除新技能献血回血。",
      "bb": {},
      "bbStr": {
        "conditionkey": "character_target_inboard"
      },
      "owners": [
        "chess_kz_logos_a"
      ]
    },
    "kz_growth_logos_b": {
      "garrisonId": "kz_growth_logos_b",
      "expansionBatch": "kazdel-expansion-v1",
      "name": "行动积累",
      "eventType": "SERVER_PREP_FIN",
      "effectKey": "kz_growth_logos",
      "desc": "上一普通战斗实际生命变化每累计25%开战最大生命，普通+1、精锐+2层；有效攻击、治疗或在场8秒另获1／2层，同名最多6／10层、多副本取最高；全队每轮最多18／30／40层。技能献血回血计魂契，魂火救援与纯还债不计；血脉仍用旧门槛，排除新技能献血回血。",
      "bb": {},
      "bbStr": {
        "conditionkey": "character_target_inboard"
      },
      "owners": [
        "chess_kz_logos_b"
      ]
    }
  },
  "tokens": {},
  "oldMembers": [
    "chess_char_4_25_a",
    "chess_char_4_26_a",
    "chess_char_4_18_a",
    "chess_char_5_07_a"
  ]
};
