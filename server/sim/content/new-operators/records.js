// Generated from original GameData by tools/build-new-operators.mjs.
export const OVERLAY = {
  "id": "new-operators-20261021",
  "version": "new-operators-1",
  "chess": {
    "chess_exp_leizi2_a": {
      "chessId": "chess_exp_leizi2_a",
      "baseId": "chess_exp_leizi2_a",
      "goldenId": "chess_exp_leizi2_b",
      "isGolden": false,
      "tier": 5,
      "identifier": 16001,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1505,
      "charId": "char_1043_leizi2",
      "name": "司霆惊蛰",
      "appellation": "Leizi the Thunderbringer",
      "rarity": "TIER_6",
      "profession": "WARRIOR",
      "subProfessionId": "librator",
      "subProfessionName": "解放者",
      "position": "MELEE",
      "nationId": "yan",
      "teamId": null,
      "bonds": [
        "yanShip",
        "arcaneShip"
      ],
      "garrisonIds": [],
      "price": 4,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_exp_leizi2_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 3206,
        "atk": 306,
        "def": 417,
        "res": 15,
        "cost": 12,
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
        "maxHp": 3206,
        "atk": 306,
        "def": 417,
        "res": 15,
        "cost": 12,
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
      "rangeId": "1-2",
      "rangeGrid": [
        [
          1,
          0
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
        "desc": "通常不攻击且阻挡数为0，技能未开启时40秒内攻击力逐渐提升至最高+200%且技能结束时重置攻击力",
        "descRaw": "通常不攻击且阻挡数为0，技能未开启时40秒内攻击力逐渐提升至最高+200%且技能结束时重置攻击力",
        "bb": {
          "atk": 2,
          "mid_stack_cnt": 20,
          "max_stack_cnt": 40
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "通常不攻击且阻挡数为0，技能未开启时40秒内攻击力逐渐提升至最高+200%且技能结束时重置攻击力",
        "descRaw": "通常不攻击且阻挡数为0，技能未开启时40秒内攻击力逐渐提升至最高+200%且技能结束时重置攻击力",
        "bb": {
          "atk": 2,
          "mid_stack_cnt": 20,
          "max_stack_cnt": 40
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "明断",
          "desc": "攻击范围内每个地块每秒有10%的概率落雷对所有敌人造成相当于攻击力100%的法术伤害。未开启技能时起飞；技能期间攻击时攻击力提升至107%",
          "descRaw": "攻击范围内每个地块每秒有10%的概率落雷对所有敌人造成相当于攻击力100%的法术伤害。未开启技能时起飞；技能期间攻击时攻击力提升至107%",
          "bb": {
            "interval": 1,
            "atk_scale_t": 1,
            "atk_scale[skill_up]": 1.07,
            "times": 1
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "追责",
          "desc": "开启技能时，使攻击范围内所有地面地块落雷，对所有敌人造成相当于攻击力100%的法术伤害和2秒战栗",
          "descRaw": "开启技能时，使攻击范围内所有地面地块落雷，对所有敌人造成相当于攻击力100%的法术伤害和2秒战栗",
          "bb": {
            "atk_scale_t2": 1,
            "not_combat": 2
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 2,
          "name": null,
          "desc": "",
          "descRaw": "",
          "bb": {},
          "bbStr": {},
          "rangeGrid": null,
          "hidden": true,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "明断",
          "desc": "攻击范围内每个地块每秒有10%的概率落雷对所有敌人造成相当于攻击力100%的法术伤害。未开启技能时起飞；技能期间攻击时攻击力提升至107%",
          "descRaw": "攻击范围内每个地块每秒有10%的概率落雷对所有敌人造成相当于攻击力100%的法术伤害。未开启技能时起飞；技能期间攻击时攻击力提升至107%",
          "bb": {
            "interval": 1,
            "atk_scale_t": 1,
            "atk_scale[skill_up]": 1.07,
            "times": 1
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "追责",
          "desc": "开启技能时，使攻击范围内所有地面地块落雷，对所有敌人造成相当于攻击力100%的法术伤害和2秒战栗",
          "descRaw": "开启技能时，使攻击范围内所有地面地块落雷，对所有敌人造成相当于攻击力100%的法术伤害和2秒战栗",
          "bb": {
            "atk_scale_t2": 1,
            "not_combat": 2
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 2,
          "name": null,
          "desc": "",
          "descRaw": "",
          "bb": {},
          "bbStr": {},
          "rangeGrid": null,
          "hidden": true,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_leizi2_3",
        "iconId": "skchr_leizi2_3",
        "name": "天地通明",
        "level": 4,
        "desc": "攻击范围扩大，攻击间隔大幅延长，攻击造成攻击力210%的范围物理伤害，目标位置产生朝四周流动三格的电流。电流碰到自身或高台时反弹，电流所在地块上所有敌人每0.6秒受到司霆惊蛰攻击力45%的法术伤害，且有7%概率战栗3秒",
        "descRaw": "攻击范围扩大，攻击间隔大幅延长，攻击造成攻击力210%的范围物理伤害，目标位置产生朝四周流动三格的电流。电流碰到自身或高台时反弹，电流所在地块上所有敌人每0.6秒受到司霆惊蛰攻击力45%的法术伤害，且有7%概率战栗3秒",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 24,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 43,
        "initSp": 21,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "attack@atk_scale_s3": 2.1,
          "base_attack_time": 1.7,
          "attack@range_radius": 1.65,
          "attack@atk_scale_current": 0.45,
          "prob": 0.07,
          "not_combat": 3
        },
        "bbStr": {},
        "rangeId": "2-1",
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
        "prefabId": "skchr_leizi2_3",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 2,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_leizi2_1",
          "iconId": "skchr_leizi2_1",
          "name": "浩气长存",
          "level": 4,
          "desc": "攻击范围朝前方和两侧扩大。对三个方向的地面敌人各造成相当于攻击力260%的物理伤害\n可充能3次，充能耗尽前特性不重置",
          "descRaw": "攻击范围朝前方和两侧扩大。对三个方向的地面敌人各造成相当于攻击力260%的物理伤害\n可充能3次，充能耗尽前特性不重置",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": -1,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 14,
          "initSp": 17,
          "maxChargeTime": 3,
          "increment": 1,
          "bb": {
            "attack@atk_scale_s1": 2.6
          },
          "bbStr": {},
          "rangeId": "3-19",
          "rangeGrid": [
            [
              3,
              0
            ],
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
              -2,
              0
            ],
            [
              -3,
              0
            ]
          ],
          "prefabId": "skchr_leizi2_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_leizi2_2",
          "iconId": "skchr_leizi2_2",
          "name": "正霆摄威",
          "level": 4,
          "desc": "攻击范围沿地面地块扩展至最远三格，攻击对3个目标造成相当于攻击力110%的物理伤害。技能期间每次落雷使攻击力+10%（最多可叠加25次）",
          "descRaw": "攻击范围沿地面地块扩展至最远三格，攻击对3个目标造成相当于攻击力110%的物理伤害。技能期间每次落雷使攻击力+10%（最多可叠加25次）",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 36,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 50,
          "initSp": 22,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "attack@atk_scale_s2": 1.1,
            "attack@max_target_s2": 3,
            "thunder_atk": 0.1,
            "thunder_max_stack_cnt": 25
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_leizi2_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false
        },
        {
          "skillId": "skchr_leizi2_3",
          "iconId": "skchr_leizi2_3",
          "name": "天地通明",
          "level": 4,
          "desc": "攻击范围扩大，攻击间隔大幅延长，攻击造成攻击力210%的范围物理伤害，目标位置产生朝四周流动三格的电流。电流碰到自身或高台时反弹，电流所在地块上所有敌人每0.6秒受到司霆惊蛰攻击力45%的法术伤害，且有7%概率战栗3秒",
          "descRaw": "攻击范围扩大，攻击间隔大幅延长，攻击造成攻击力210%的范围物理伤害，目标位置产生朝四周流动三格的电流。电流碰到自身或高台时反弹，电流所在地块上所有敌人每0.6秒受到司霆惊蛰攻击力45%的法术伤害，且有7%概率战栗3秒",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 24,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 43,
          "initSp": 21,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "attack@atk_scale_s3": 2.1,
            "base_attack_time": 1.7,
            "attack@range_radius": 1.65,
            "attack@atk_scale_current": 0.45,
            "prob": 0.07,
            "not_combat": 3
          },
          "bbStr": {},
          "rangeId": "2-1",
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
          "prefabId": "skchr_leizi2_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": true
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_1043_leizi2",
        "portrait": "char_1043_leizi2_1",
        "spine": "char_1043_leizi2",
        "skillIcon": "skchr_leizi2_3",
        "subProfIcon": "sub_librator_icon"
      },
      "expansionBatch": "arknights-expansion-v1"
    },
    "chess_exp_leizi2_b": {
      "chessId": "chess_exp_leizi2_b",
      "baseId": "chess_exp_leizi2_a",
      "goldenId": "chess_exp_leizi2_b",
      "isGolden": true,
      "tier": 5,
      "identifier": 16001,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1505,
      "charId": "char_1043_leizi2",
      "name": "司霆惊蛰",
      "appellation": "Leizi the Thunderbringer",
      "rarity": "TIER_6",
      "profession": "WARRIOR",
      "subProfessionId": "librator",
      "subProfessionName": "解放者",
      "position": "MELEE",
      "nationId": "yan",
      "teamId": null,
      "bonds": [
        "yanShip",
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
        "maxHp": 3867,
        "atk": 368,
        "def": 493,
        "res": 15,
        "cost": 12,
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
        "maxHp": 3642,
        "atk": 342,
        "def": 466,
        "res": 15,
        "cost": 12,
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
      "rangeId": "1-2",
      "rangeGrid": [
        [
          1,
          0
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
        "desc": "通常不攻击且阻挡数为0，技能未开启时40秒内攻击力逐渐提升至最高+200%且技能结束时重置攻击力",
        "descRaw": "通常不攻击且阻挡数为0，技能未开启时40秒内攻击力逐渐提升至最高+200%且技能结束时重置攻击力",
        "bb": {
          "atk": 2,
          "mid_stack_cnt": 20,
          "max_stack_cnt": 40,
          "init_atk": 1
        },
        "bbStr": {},
        "rangeGrid": null,
        "moduleDesc": "部署后获得+100%加成"
      },
      "traitBase": {
        "desc": "通常不攻击且阻挡数为0，技能未开启时40秒内攻击力逐渐提升至最高+200%且技能结束时重置攻击力",
        "descRaw": "通常不攻击且阻挡数为0，技能未开启时40秒内攻击力逐渐提升至最高+200%且技能结束时重置攻击力",
        "bb": {
          "atk": 2,
          "mid_stack_cnt": 20,
          "max_stack_cnt": 40
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "明断",
          "desc": "攻击范围内每个地块每秒有10%的概率落雷对所有敌人造成相当于攻击力100%的法术伤害。未开启技能时起飞；技能期间攻击时攻击力提升至107%",
          "descRaw": "攻击范围内每个地块每秒有10%的概率落雷对所有敌人造成相当于攻击力100%的法术伤害。未开启技能时起飞；技能期间攻击时攻击力提升至107%",
          "bb": {
            "interval": 1,
            "atk_scale_t": 1,
            "atk_scale[skill_up]": 1.07,
            "times": 1
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "追责",
          "desc": "开启技能时，使攻击范围内所有地面地块落雷，对所有敌人造成相当于攻击力100%的法术伤害和2秒战栗",
          "descRaw": "开启技能时，使攻击范围内所有地面地块落雷，对所有敌人造成相当于攻击力100%的法术伤害和2秒战栗",
          "bb": {
            "atk_scale_t2": 1,
            "not_combat": 2
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 2,
          "name": null,
          "desc": "",
          "descRaw": "",
          "bb": {},
          "bbStr": {},
          "rangeGrid": null,
          "hidden": true,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": -1,
          "talentIndex": -1,
          "name": null,
          "desc": "",
          "bb": {
            "init_atk": 1
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
          "name": "明断",
          "desc": "攻击范围内每个地块每秒有10%的概率落雷对所有敌人造成相当于攻击力100%的法术伤害。未开启技能时起飞；技能期间攻击时攻击力提升至107%",
          "descRaw": "攻击范围内每个地块每秒有10%的概率落雷对所有敌人造成相当于攻击力100%的法术伤害。未开启技能时起飞；技能期间攻击时攻击力提升至107%",
          "bb": {
            "interval": 1,
            "atk_scale_t": 1,
            "atk_scale[skill_up]": 1.07,
            "times": 1
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "追责",
          "desc": "开启技能时，使攻击范围内所有地面地块落雷，对所有敌人造成相当于攻击力100%的法术伤害和2秒战栗",
          "descRaw": "开启技能时，使攻击范围内所有地面地块落雷，对所有敌人造成相当于攻击力100%的法术伤害和2秒战栗",
          "bb": {
            "atk_scale_t2": 1,
            "not_combat": 2
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 2,
          "name": null,
          "desc": "",
          "descRaw": "",
          "bb": {},
          "bbStr": {},
          "rangeGrid": null,
          "hidden": true,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_leizi2_3",
        "iconId": "skchr_leizi2_3",
        "name": "天地通明",
        "level": 7,
        "desc": "攻击范围扩大，攻击间隔大幅延长，攻击造成攻击力240%的范围物理伤害，目标位置产生朝四周流动三格的电流。电流碰到自身或高台时反弹，电流所在地块上所有敌人每0.6秒受到司霆惊蛰攻击力56%的法术伤害，且有10%概率战栗3秒",
        "descRaw": "攻击范围扩大，攻击间隔大幅延长，攻击造成攻击力240%的范围物理伤害，目标位置产生朝四周流动三格的电流。电流碰到自身或高台时反弹，电流所在地块上所有敌人每0.6秒受到司霆惊蛰攻击力56%的法术伤害，且有10%概率战栗3秒",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 24,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 40,
        "initSp": 21,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "attack@atk_scale_s3": 2.4,
          "base_attack_time": 1.7,
          "attack@range_radius": 1.65,
          "attack@atk_scale_current": 0.56,
          "prob": 0.1,
          "not_combat": 3
        },
        "bbStr": {},
        "rangeId": "2-1",
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
        "prefabId": "skchr_leizi2_3",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 2,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_leizi2_1",
          "iconId": "skchr_leizi2_1",
          "name": "浩气长存",
          "level": 7,
          "desc": "攻击范围朝前方和两侧扩大。对三个方向的地面敌人各造成相当于攻击力300%的物理伤害\n可充能3次，充能耗尽前特性不重置",
          "descRaw": "攻击范围朝前方和两侧扩大。对三个方向的地面敌人各造成相当于攻击力300%的物理伤害\n可充能3次，充能耗尽前特性不重置",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": -1,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 13,
          "initSp": 17,
          "maxChargeTime": 3,
          "increment": 1,
          "bb": {
            "attack@atk_scale_s1": 3
          },
          "bbStr": {},
          "rangeId": "3-19",
          "rangeGrid": [
            [
              3,
              0
            ],
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
              -2,
              0
            ],
            [
              -3,
              0
            ]
          ],
          "prefabId": "skchr_leizi2_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_leizi2_2",
          "iconId": "skchr_leizi2_2",
          "name": "正霆摄威",
          "level": 7,
          "desc": "攻击范围沿地面地块扩展至最远三格，攻击对3个目标造成相当于攻击力125%的物理伤害。技能期间每次落雷使攻击力+10%（最多可叠加25次）",
          "descRaw": "攻击范围沿地面地块扩展至最远三格，攻击对3个目标造成相当于攻击力125%的物理伤害。技能期间每次落雷使攻击力+10%（最多可叠加25次）",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 36,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 47,
          "initSp": 22,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "attack@atk_scale_s2": 1.25,
            "attack@max_target_s2": 3,
            "thunder_atk": 0.1,
            "thunder_max_stack_cnt": 25
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_leizi2_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false
        },
        {
          "skillId": "skchr_leizi2_3",
          "iconId": "skchr_leizi2_3",
          "name": "天地通明",
          "level": 7,
          "desc": "攻击范围扩大，攻击间隔大幅延长，攻击造成攻击力240%的范围物理伤害，目标位置产生朝四周流动三格的电流。电流碰到自身或高台时反弹，电流所在地块上所有敌人每0.6秒受到司霆惊蛰攻击力56%的法术伤害，且有10%概率战栗3秒",
          "descRaw": "攻击范围扩大，攻击间隔大幅延长，攻击造成攻击力240%的范围物理伤害，目标位置产生朝四周流动三格的电流。电流碰到自身或高台时反弹，电流所在地块上所有敌人每0.6秒受到司霆惊蛰攻击力56%的法术伤害，且有10%概率战栗3秒",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 24,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 40,
          "initSp": 21,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "attack@atk_scale_s3": 2.4,
            "base_attack_time": 1.7,
            "attack@range_radius": 1.65,
            "attack@atk_scale_current": 0.56,
            "prob": 0.1,
            "not_combat": 3
          },
          "bbStr": {},
          "rangeId": "2-1",
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
          "prefabId": "skchr_leizi2_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": true
        }
      ],
      "module": {
        "id": "uniequip_002_leizi2",
        "name": "“一念”",
        "type": "LIB-X",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_leizi2",
          "name": "“一念”",
          "typeName": "LIB-X",
          "isDefault": true,
          "level": 1,
          "attr": {
            "maxHp": 225,
            "atk": 26,
            "def": 27
          },
          "traitOverride": {
            "desc": "通常不攻击且阻挡数为0，技能未开启时40秒内攻击力逐渐提升至最高+200%且技能结束时重置攻击力",
            "descRaw": "通常不攻击且阻挡数为0，技能未开启时40秒内攻击力逐渐提升至最高+200%且技能结束时重置攻击力",
            "bb": {
              "atk": 2,
              "mid_stack_cnt": 20,
              "max_stack_cnt": 40,
              "init_atk": 1
            },
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "部署后获得+100%加成"
          },
          "talentChanges": [
            {
              "talentIndex": -1,
              "name": null,
              "desc": "",
              "bb": {
                "init_atk": 1
              },
              "bbStr": {},
              "rangeGrid": null,
              "hidden": true
            }
          ]
        }
      ],
      "assets": {
        "avatar": "char_1043_leizi2_2",
        "portrait": "char_1043_leizi2_2",
        "spine": "char_1043_leizi2",
        "skillIcon": "skchr_leizi2_3",
        "subProfIcon": "sub_librator_icon"
      },
      "expansionBatch": "arknights-expansion-v1"
    },
    "chess_exp_chen3_a": {
      "chessId": "chess_exp_chen3_a",
      "baseId": "chess_exp_chen3_a",
      "goldenId": "chess_exp_chen3_b",
      "isGolden": false,
      "tier": 6,
      "identifier": 16002,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1506,
      "charId": "char_1050_chen3",
      "name": "赤刃明霄陈",
      "appellation": "Ch'en the Dawnstreak",
      "rarity": "TIER_6",
      "profession": "WARRIOR",
      "subProfessionId": "artsfghter",
      "subProfessionName": "术战者",
      "position": "MELEE",
      "nationId": "yan",
      "teamId": null,
      "bonds": [
        "yanShip",
        "raidShip"
      ],
      "garrisonIds": [],
      "price": 4,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_exp_chen3_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 2211,
        "atk": 542,
        "def": 352,
        "res": 15,
        "cost": 21,
        "blockCnt": 1,
        "bat": 1.25,
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
        "maxHp": 2211,
        "atk": 542,
        "def": 352,
        "res": 15,
        "cost": 21,
        "blockCnt": 1,
        "bat": 1.25,
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
          "name": "形意洞照",
          "desc": "攻击力+13%，攻击速度+13，攻击变为弱点伤害",
          "descRaw": "攻击力+13%，攻击速度+13，攻击变为弱点伤害",
          "bb": {
            "atk": 0.13,
            "attack_speed": 13
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "寒暑觉知",
          "desc": "未受到伤害时，每7秒随机治疗自身一定（攻击力的30%~160%）生命值，并闪避下次物理与法术攻击",
          "descRaw": "未受到伤害时，每7秒随机治疗自身一定（攻击力的30%~160%）生命值，并闪避下次物理与法术攻击",
          "bb": {
            "stack_time": 7,
            "heal_atk_scale_min": 30,
            "heal_atk_scale_max": 161
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 2,
          "name": null,
          "desc": "",
          "descRaw": "",
          "bb": {},
          "bbStr": {},
          "rangeGrid": null,
          "hidden": true,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "形意洞照",
          "desc": "攻击力+13%，攻击速度+13，攻击变为弱点伤害",
          "descRaw": "攻击力+13%，攻击速度+13，攻击变为弱点伤害",
          "bb": {
            "atk": 0.13,
            "attack_speed": 13
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "寒暑觉知",
          "desc": "未受到伤害时，每7秒随机治疗自身一定（攻击力的30%~160%）生命值，并闪避下次物理与法术攻击",
          "descRaw": "未受到伤害时，每7秒随机治疗自身一定（攻击力的30%~160%）生命值，并闪避下次物理与法术攻击",
          "bb": {
            "stack_time": 7,
            "heal_atk_scale_min": 30,
            "heal_atk_scale_max": 161
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 2,
          "name": null,
          "desc": "",
          "descRaw": "",
          "bb": {},
          "bbStr": {},
          "rangeGrid": null,
          "hidden": true,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_chen3_3",
        "iconId": "skchr_chen3_3",
        "name": "赤霄·天喟",
        "level": 4,
        "desc": "技能开启时向前释放一道可转向的剑气，对穿过的敌人造成相当于其当前生命值6%的法术伤害（至少造成自身攻击力530%的法术伤害）；攻击范围扩大，每次攻击对最多3名地面敌人造成3次攻击力165%的法术伤害",
        "descRaw": "技能开启时向前释放一道可转向的剑气，对穿过的敌人造成相当于其当前生命值6%的法术伤害（至少造成自身攻击力530%的法术伤害）；攻击范围扩大，每次攻击对最多3名地面敌人造成3次攻击力165%的法术伤害",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 20,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 29,
        "initSp": 12,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "hp_ratio": 0.06,
          "projectile_min_atk_scale": 5.3,
          "attack@atk_scale": 1.65,
          "attack@max_target": 3
        },
        "bbStr": {},
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
        "prefabId": "skchr_chen3_3",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 2,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_chen3_1",
          "iconId": "skchr_chen3_1",
          "name": "赤霄·奔夜",
          "level": 4,
          "desc": "攻击力+65%，攻击变为二连击，攻击使目标敌人特殊能力失效持续至技能结束",
          "descRaw": "攻击力+65%，攻击变为二连击，攻击使目标敌人特殊能力失效持续至技能结束",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 18,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 27,
          "initSp": 6,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.65
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_chen3_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_chen3_2",
          "iconId": "skchr_chen3_2",
          "name": "赤霄·绝影-驰",
          "level": 4,
          "desc": "对周围最近的1名敌人发动10次斩击，每次造成攻击力390%的法术伤害，敌人被击倒时转移至目标周围最近的其他敌人并使剩余攻击次数+1；斩击结束时，若目标未被击倒且其位置可部署则移动至该位置，否则返回原位置。接下来攻击力+230%，获得40%物理和法术闪避",
          "descRaw": "对周围最近的1名敌人发动10次斩击，每次造成攻击力390%的法术伤害，敌人被击倒时转移至目标周围最近的其他敌人并使剩余攻击次数+1；斩击结束时，若目标未被击倒且其位置可部署则移动至该位置，否则返回原位置。接下来攻击力+230%，获得40%物理和法术闪避",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 6,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 24,
          "initSp": 11,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 3.9,
            "chen3_s2[respawn_buff].atk": 2.3,
            "chen3_s2[respawn_buff].prob": 0.4
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
          "prefabId": "skchr_chen3_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false
        },
        {
          "skillId": "skchr_chen3_3",
          "iconId": "skchr_chen3_3",
          "name": "赤霄·天喟",
          "level": 4,
          "desc": "技能开启时向前释放一道可转向的剑气，对穿过的敌人造成相当于其当前生命值6%的法术伤害（至少造成自身攻击力530%的法术伤害）；攻击范围扩大，每次攻击对最多3名地面敌人造成3次攻击力165%的法术伤害",
          "descRaw": "技能开启时向前释放一道可转向的剑气，对穿过的敌人造成相当于其当前生命值6%的法术伤害（至少造成自身攻击力530%的法术伤害）；攻击范围扩大，每次攻击对最多3名地面敌人造成3次攻击力165%的法术伤害",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 20,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 29,
          "initSp": 12,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "hp_ratio": 0.06,
            "projectile_min_atk_scale": 5.3,
            "attack@atk_scale": 1.65,
            "attack@max_target": 3
          },
          "bbStr": {},
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
          "prefabId": "skchr_chen3_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": true
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_1050_chen3",
        "portrait": "char_1050_chen3_1",
        "spine": "char_1050_chen3",
        "skillIcon": "skchr_chen3_3",
        "subProfIcon": "sub_artsfghter_icon"
      },
      "expansionBatch": "arknights-expansion-v1"
    },
    "chess_exp_chen3_b": {
      "chessId": "chess_exp_chen3_b",
      "baseId": "chess_exp_chen3_a",
      "goldenId": "chess_exp_chen3_b",
      "isGolden": true,
      "tier": 6,
      "identifier": 16002,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1506,
      "charId": "char_1050_chen3",
      "name": "赤刃明霄陈",
      "appellation": "Ch'en the Dawnstreak",
      "rarity": "TIER_6",
      "profession": "WARRIOR",
      "subProfessionId": "artsfghter",
      "subProfessionName": "术战者",
      "position": "MELEE",
      "nationId": "yan",
      "teamId": null,
      "bonds": [
        "yanShip",
        "raidShip"
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
        "equipLevel": 3
      },
      "stats": {
        "maxHp": 3094,
        "atk": 687,
        "def": 400,
        "res": 15,
        "cost": 21,
        "blockCnt": 1,
        "bat": 1.25,
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
        "maxHp": 2674,
        "atk": 627,
        "def": 400,
        "res": 15,
        "cost": 21,
        "blockCnt": 1,
        "bat": 1.25,
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
        "desc": "攻击造成法术伤害",
        "descRaw": "攻击造成法术伤害",
        "bb": {
          "attack_speed": 8
        },
        "bbStr": {},
        "rangeGrid": null,
        "moduleDesc": "未阻挡敌人时攻击速度+8"
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
          "name": "形意洞照",
          "desc": "攻击力+13%，攻击速度+13，攻击变为弱点伤害",
          "descRaw": "攻击力+13%，攻击速度+13，攻击变为弱点伤害",
          "bb": {
            "atk": 0.13,
            "attack_speed": 13
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "寒暑觉知",
          "desc": "未受到伤害时，每7秒随机治疗自身一定（攻击力的30%~160%）生命值，并闪避下次物理与法术攻击",
          "descRaw": "未受到伤害时，每7秒随机治疗自身一定（攻击力的30%~160%）生命值，并闪避下次物理与法术攻击",
          "bb": {
            "stack_time": 7,
            "heal_atk_scale_min": 30,
            "heal_atk_scale_max": 161
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 2,
          "name": null,
          "desc": "",
          "descRaw": "",
          "bb": {},
          "bbStr": {},
          "rangeGrid": null,
          "hidden": true,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "talentIndex": 1,
          "name": "寒暑觉知",
          "desc": "未受到伤害时，每6秒随机治疗自身一定（攻击力的50%~200%）生命值，并闪避下次物理与法术攻击",
          "bb": {
            "stack_time": 6,
            "heal_atk_scale_min": 50,
            "heal_atk_scale_max": 201
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
          "name": "形意洞照",
          "desc": "攻击力+13%，攻击速度+13，攻击变为弱点伤害",
          "descRaw": "攻击力+13%，攻击速度+13，攻击变为弱点伤害",
          "bb": {
            "atk": 0.13,
            "attack_speed": 13
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "寒暑觉知",
          "desc": "未受到伤害时，每7秒随机治疗自身一定（攻击力的30%~160%）生命值，并闪避下次物理与法术攻击",
          "descRaw": "未受到伤害时，每7秒随机治疗自身一定（攻击力的30%~160%）生命值，并闪避下次物理与法术攻击",
          "bb": {
            "stack_time": 7,
            "heal_atk_scale_min": 30,
            "heal_atk_scale_max": 161
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 2,
          "name": null,
          "desc": "",
          "descRaw": "",
          "bb": {},
          "bbStr": {},
          "rangeGrid": null,
          "hidden": true,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_chen3_3",
        "iconId": "skchr_chen3_3",
        "name": "赤霄·天喟",
        "level": 7,
        "desc": "技能开启时向前释放一道可转向的剑气，对穿过的敌人造成相当于其当前生命值6%的法术伤害（至少造成自身攻击力550%的法术伤害）；攻击范围扩大，每次攻击对最多3名地面敌人造成3次攻击力180%的法术伤害",
        "descRaw": "技能开启时向前释放一道可转向的剑气，对穿过的敌人造成相当于其当前生命值6%的法术伤害（至少造成自身攻击力550%的法术伤害）；攻击范围扩大，每次攻击对最多3名地面敌人造成3次攻击力180%的法术伤害",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 20,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 28,
        "initSp": 15,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "hp_ratio": 0.06,
          "projectile_min_atk_scale": 5.5,
          "attack@atk_scale": 1.8,
          "attack@max_target": 3
        },
        "bbStr": {},
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
        "prefabId": "skchr_chen3_3",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 2,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_chen3_1",
          "iconId": "skchr_chen3_1",
          "name": "赤霄·奔夜",
          "level": 7,
          "desc": "攻击力+80%，攻击变为二连击，攻击使目标敌人特殊能力失效持续至技能结束",
          "descRaw": "攻击力+80%，攻击变为二连击，攻击使目标敌人特殊能力失效持续至技能结束",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 18,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 24,
          "initSp": 7,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.8
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_chen3_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_chen3_2",
          "iconId": "skchr_chen3_2",
          "name": "赤霄·绝影-驰",
          "level": 7,
          "desc": "对周围最近的1名敌人发动10次斩击，每次造成攻击力430%的法术伤害，敌人被击倒时转移至目标周围最近的其他敌人并使剩余攻击次数+1；斩击结束时，若目标未被击倒且其位置可部署则移动至该位置，否则返回原位置。接下来攻击力+260%，获得50%物理和法术闪避",
          "descRaw": "对周围最近的1名敌人发动10次斩击，每次造成攻击力430%的法术伤害，敌人被击倒时转移至目标周围最近的其他敌人并使剩余攻击次数+1；斩击结束时，若目标未被击倒且其位置可部署则移动至该位置，否则返回原位置。接下来攻击力+260%，获得50%物理和法术闪避",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 6,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 23,
          "initSp": 12,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 4.3,
            "chen3_s2[respawn_buff].atk": 2.6,
            "chen3_s2[respawn_buff].prob": 0.5
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
          "prefabId": "skchr_chen3_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false
        },
        {
          "skillId": "skchr_chen3_3",
          "iconId": "skchr_chen3_3",
          "name": "赤霄·天喟",
          "level": 7,
          "desc": "技能开启时向前释放一道可转向的剑气，对穿过的敌人造成相当于其当前生命值6%的法术伤害（至少造成自身攻击力550%的法术伤害）；攻击范围扩大，每次攻击对最多3名地面敌人造成3次攻击力180%的法术伤害",
          "descRaw": "技能开启时向前释放一道可转向的剑气，对穿过的敌人造成相当于其当前生命值6%的法术伤害（至少造成自身攻击力550%的法术伤害）；攻击范围扩大，每次攻击对最多3名地面敌人造成3次攻击力180%的法术伤害",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 20,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 28,
          "initSp": 15,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "hp_ratio": 0.06,
            "projectile_min_atk_scale": 5.5,
            "attack@atk_scale": 1.8,
            "attack@max_target": 3
          },
          "bbStr": {},
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
          "prefabId": "skchr_chen3_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": true
        }
      ],
      "module": {
        "id": "uniequip_002_chen3",
        "name": "记忆残页",
        "type": "AFT-X",
        "level": 3,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_chen3",
          "name": "记忆残页",
          "typeName": "AFT-X",
          "isDefault": true,
          "level": 3,
          "attr": {
            "maxHp": 420,
            "atk": 60
          },
          "traitOverride": {
            "desc": "攻击造成法术伤害",
            "descRaw": "攻击造成法术伤害",
            "bb": {
              "attack_speed": 8
            },
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "未阻挡敌人时攻击速度+8"
          },
          "talentChanges": [
            {
              "talentIndex": 1,
              "name": "寒暑觉知",
              "desc": "未受到伤害时，每6秒随机治疗自身一定（攻击力的50%~200%）生命值，并闪避下次物理与法术攻击",
              "bb": {
                "stack_time": 6,
                "heal_atk_scale_min": 50,
                "heal_atk_scale_max": 201
              },
              "bbStr": {},
              "rangeGrid": null,
              "hidden": false
            }
          ]
        }
      ],
      "assets": {
        "avatar": "char_1050_chen3_2",
        "portrait": "char_1050_chen3_2",
        "spine": "char_1050_chen3",
        "skillIcon": "skchr_chen3_3",
        "subProfIcon": "sub_artsfghter_icon"
      },
      "expansionBatch": "arknights-expansion-v1"
    },
    "chess_rm_monstr_a": {
      "chessId": "chess_rm_monstr_a",
      "baseId": "chess_rm_monstr_a",
      "goldenId": "chess_rm_monstr_b",
      "isGolden": false,
      "tier": 6,
      "identifier": 16003,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1506,
      "charId": "char_4179_monstr",
      "name": "Mon3tr",
      "appellation": "Mon3tr",
      "rarity": "TIER_6",
      "profession": "MEDIC",
      "subProfessionId": "chainhealer",
      "subProfessionName": "链愈师",
      "position": "RANGED",
      "nationId": "rhodes",
      "teamId": null,
      "bonds": [
        "rhodesShip",
        "deputShip"
      ],
      "garrisonIds": [],
      "price": 4,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_rm_monstr_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 1492,
        "atk": 422,
        "def": 176,
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
        "maxHp": 1492,
        "atk": 422,
        "def": 176,
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
          "attack@chain.atk_scale": 0.75
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "恢复友方单位生命，且会在3个友方单位间跳跃，每次跳跃治疗量降低25%",
        "descRaw": "恢复友方单位生命，且会在3个友方单位间跳跃，每次跳跃治疗量降低25%",
        "bb": {
          "attack@chain.max_target": 3,
          "attack@chain.atk_scale": 0.75
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "自我修复",
          "desc": "可以在攻击范围内的地面使用一个仅可被自身治疗的重构体，重构体周围友方单位的攻击力+15%，重构体受到自身和Mon3tr治疗时，可额外进行一次不会衰减的治疗跳跃",
          "descRaw": "可以在攻击范围内的地面使用一个仅可被自身治疗的重构体，重构体周围友方单位的攻击力+15%，重构体受到自身和Mon3tr治疗时，可额外进行一次不会衰减的治疗跳跃",
          "bb": {
            "cnt": 1,
            "atk": 0.15
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": "token_10050_monstr_prosts",
          "fromModule": false
        },
        {
          "index": 1,
          "name": "战术协同",
          "desc": "自身或重构体造成治疗时，使目标及自身的攻击速度+20，持续10秒（无法叠加）",
          "descRaw": "自身或重构体造成治疗时，使目标及自身的攻击速度+20，持续10秒（无法叠加）",
          "bb": {
            "buff_duration": 10,
            "attack_speed": 20
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": "token_10050_monstr_prosts",
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "自我修复",
          "desc": "可以在攻击范围内的地面使用一个仅可被自身治疗的重构体，重构体周围友方单位的攻击力+15%，重构体受到自身和Mon3tr治疗时，可额外进行一次不会衰减的治疗跳跃",
          "descRaw": "可以在攻击范围内的地面使用一个仅可被自身治疗的重构体，重构体周围友方单位的攻击力+15%，重构体受到自身和Mon3tr治疗时，可额外进行一次不会衰减的治疗跳跃",
          "bb": {
            "cnt": 1,
            "atk": 0.15
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": "token_10050_monstr_prosts",
          "fromModule": false
        },
        {
          "index": 1,
          "name": "战术协同",
          "desc": "自身或重构体造成治疗时，使目标及自身的攻击速度+20，持续10秒（无法叠加）",
          "descRaw": "自身或重构体造成治疗时，使目标及自身的攻击速度+20，持续10秒（无法叠加）",
          "bb": {
            "buff_duration": 10,
            "attack_speed": 20
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": "token_10050_monstr_prosts",
          "fromModule": false
        }
      ],
      "tokens": [
        "token_10050_monstr_prosts"
      ],
      "skill": {
        "skillId": "skchr_monstr_2",
        "iconId": "skchr_monstr_2",
        "name": "策略：超负荷",
        "level": 4,
        "desc": "技能期间优先治疗重构体，重构体每受到一次Mon3tr的治疗，就会进行一次跳跃治疗，第二天赋的效果提升至1.8倍",
        "descRaw": "技能期间优先治疗重构体，重构体每受到一次Mon3tr的治疗，就会进行一次跳跃治疗，第二天赋的效果提升至1.8倍",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 30,
        "spType": "INCREASE_WHEN_ATTACK",
        "spCost": 15,
        "initSp": 7,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "talent_scale": 1.8
        },
        "bbStr": {},
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
        "prefabId": "skchr_monstr_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_monstr_1",
          "iconId": "skchr_monstr_1",
          "name": "策略：超压链接",
          "level": 4,
          "desc": "下次治疗可以恢复相当于攻击力135%的生命，治疗的跳跃次数+1",
          "descRaw": "下次治疗可以恢复相当于攻击力135%的生命，治疗的跳跃次数+1",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": -1,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 5,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "heal_scale": 1.35,
            "chain.max_target": 4
          },
          "bbStr": {},
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
          "prefabId": "skchr_monstr_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_monstr_2",
          "iconId": "skchr_monstr_2",
          "name": "策略：超负荷",
          "level": 4,
          "desc": "技能期间优先治疗重构体，重构体每受到一次Mon3tr的治疗，就会进行一次跳跃治疗，第二天赋的效果提升至1.8倍",
          "descRaw": "技能期间优先治疗重构体，重构体每受到一次Mon3tr的治疗，就会进行一次跳跃治疗，第二天赋的效果提升至1.8倍",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 30,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 15,
          "initSp": 7,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "talent_scale": 1.8
          },
          "bbStr": {},
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
          "prefabId": "skchr_monstr_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        },
        {
          "skillId": "skchr_monstr_3",
          "iconId": "skchr_monstr_3",
          "name": "策略：熔毁",
          "level": 4,
          "desc": "攻击范围改变，移动至重构体位置，攻击力+250%，攻击间隔降低，阻挡数+2，生命上限+5000，每秒流失80点生命值，同时攻击阻挡的所有敌人，伤害类型变为真实，攻击治疗自身相当于攻击力50%的生命值\n技能结束或受到致命伤害时，返回初始位置",
          "descRaw": "攻击范围改变，移动至重构体位置，攻击力+250%，攻击间隔降低，阻挡数+2，生命上限+5000，每秒流失80点生命值，同时攻击阻挡的所有敌人，伤害类型变为真实，攻击治疗自身相当于攻击力50%的生命值\n技能结束或受到致命伤害时，返回初始位置",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 25,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 15,
          "initSp": 5,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 2.5,
            "damage_per_second": 80,
            "max_hp": 5000,
            "block_cnt": 2,
            "base_attack_time": -1.5,
            "attack@heal_scale": 0.5
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
          "prefabId": "skchr_monstr_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": false
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_4179_monstr",
        "portrait": "char_4179_monstr_1",
        "spine": "char_4179_monstr",
        "skillIcon": "skchr_monstr_2",
        "subProfIcon": "sub_chainhealer_icon"
      },
      "expansionBatch": "rhodes-mujica-v1"
    },
    "chess_rm_monstr_b": {
      "chessId": "chess_rm_monstr_b",
      "baseId": "chess_rm_monstr_a",
      "goldenId": "chess_rm_monstr_b",
      "isGolden": true,
      "tier": 6,
      "identifier": 16003,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1506,
      "charId": "char_4179_monstr",
      "name": "Mon3tr",
      "appellation": "Mon3tr",
      "rarity": "TIER_6",
      "profession": "MEDIC",
      "subProfessionId": "chainhealer",
      "subProfessionName": "链愈师",
      "position": "RANGED",
      "nationId": "rhodes",
      "teamId": null,
      "bonds": [
        "rhodesShip",
        "deputShip"
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
        "equipLevel": 3
      },
      "stats": {
        "maxHp": 1653,
        "atk": 557,
        "def": 246,
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
        "maxHp": 1653,
        "atk": 492,
        "def": 206,
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
          "attack@chain.atk_scale": 0.85
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "恢复友方单位生命，且会在3个友方单位间跳跃，每次跳跃治疗量降低25%",
        "descRaw": "恢复友方单位生命，且会在3个友方单位间跳跃，每次跳跃治疗量降低25%",
        "bb": {
          "attack@chain.max_target": 3,
          "attack@chain.atk_scale": 0.75
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "自我修复",
          "desc": "可以在攻击范围内的地面使用一个仅可被自身治疗的重构体，重构体周围友方单位的攻击力+15%，重构体受到自身和Mon3tr治疗时，可额外进行一次不会衰减的治疗跳跃",
          "descRaw": "可以在攻击范围内的地面使用一个仅可被自身治疗的重构体，重构体周围友方单位的攻击力+15%，重构体受到自身和Mon3tr治疗时，可额外进行一次不会衰减的治疗跳跃",
          "bb": {
            "cnt": 1,
            "atk": 0.15
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": "token_10050_monstr_prosts",
          "fromModule": false
        },
        {
          "index": 1,
          "name": "战术协同",
          "desc": "自身或重构体造成治疗时，使目标及自身的攻击速度+20，持续10秒（无法叠加）",
          "descRaw": "自身或重构体造成治疗时，使目标及自身的攻击速度+20，持续10秒（无法叠加）",
          "bb": {
            "buff_duration": 10,
            "attack_speed": 20
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": "token_10050_monstr_prosts",
          "fromModule": false
        },
        {
          "index": -1,
          "talentIndex": -1,
          "name": null,
          "desc": "",
          "bb": {
            "attack@chain.max_target": 3,
            "attack@chain.atk_scale": 0.85
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "fromModule": true
        },
        {
          "index": 0,
          "talentIndex": 0,
          "name": "自我修复",
          "desc": "可以在攻击范围内的地面使用一个仅可被自身治疗的重构体，重构体周围友方单位的攻击力+25%，重构体受到自身和Mon3tr治疗时，可额外进行一次不会衰减的治疗跳跃，且下次跳跃也不衰减",
          "bb": {
            "cnt": 1,
            "atk": 0.25,
            "attack@chain.extra_cnt": 1
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
          "name": "自我修复",
          "desc": "可以在攻击范围内的地面使用一个仅可被自身治疗的重构体，重构体周围友方单位的攻击力+15%，重构体受到自身和Mon3tr治疗时，可额外进行一次不会衰减的治疗跳跃",
          "descRaw": "可以在攻击范围内的地面使用一个仅可被自身治疗的重构体，重构体周围友方单位的攻击力+15%，重构体受到自身和Mon3tr治疗时，可额外进行一次不会衰减的治疗跳跃",
          "bb": {
            "cnt": 1,
            "atk": 0.15
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": "token_10050_monstr_prosts",
          "fromModule": false
        },
        {
          "index": 1,
          "name": "战术协同",
          "desc": "自身或重构体造成治疗时，使目标及自身的攻击速度+20，持续10秒（无法叠加）",
          "descRaw": "自身或重构体造成治疗时，使目标及自身的攻击速度+20，持续10秒（无法叠加）",
          "bb": {
            "buff_duration": 10,
            "attack_speed": 20
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": "token_10050_monstr_prosts",
          "fromModule": false
        }
      ],
      "tokens": [
        "token_10050_monstr_prosts"
      ],
      "skill": {
        "skillId": "skchr_monstr_2",
        "iconId": "skchr_monstr_2",
        "name": "策略：超负荷",
        "level": 7,
        "desc": "技能期间优先治疗重构体，重构体每受到一次Mon3tr的治疗，就会进行一次跳跃治疗，第二天赋的效果提升至2.3倍",
        "descRaw": "技能期间优先治疗重构体，重构体每受到一次Mon3tr的治疗，就会进行一次跳跃治疗，第二天赋的效果提升至2.3倍",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 30,
        "spType": "INCREASE_WHEN_ATTACK",
        "spCost": 15,
        "initSp": 8,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "talent_scale": 2.3
        },
        "bbStr": {},
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
        "prefabId": "skchr_monstr_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_monstr_1",
          "iconId": "skchr_monstr_1",
          "name": "策略：超压链接",
          "level": 7,
          "desc": "下次治疗可以恢复相当于攻击力170%的生命，治疗的跳跃次数+1",
          "descRaw": "下次治疗可以恢复相当于攻击力170%的生命，治疗的跳跃次数+1",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": -1,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 3,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "heal_scale": 1.7,
            "chain.max_target": 4
          },
          "bbStr": {},
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
          "prefabId": "skchr_monstr_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_monstr_2",
          "iconId": "skchr_monstr_2",
          "name": "策略：超负荷",
          "level": 7,
          "desc": "技能期间优先治疗重构体，重构体每受到一次Mon3tr的治疗，就会进行一次跳跃治疗，第二天赋的效果提升至2.3倍",
          "descRaw": "技能期间优先治疗重构体，重构体每受到一次Mon3tr的治疗，就会进行一次跳跃治疗，第二天赋的效果提升至2.3倍",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 30,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 15,
          "initSp": 8,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "talent_scale": 2.3
          },
          "bbStr": {},
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
          "prefabId": "skchr_monstr_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        },
        {
          "skillId": "skchr_monstr_3",
          "iconId": "skchr_monstr_3",
          "name": "策略：熔毁",
          "level": 7,
          "desc": "攻击范围改变，移动至重构体位置，攻击力+280%，攻击间隔降低，阻挡数+2，生命上限+5000，每秒流失80点生命值，同时攻击阻挡的所有敌人，伤害类型变为真实，攻击治疗自身相当于攻击力50%的生命值\n技能结束或受到致命伤害时，返回初始位置",
          "descRaw": "攻击范围改变，移动至重构体位置，攻击力+280%，攻击间隔降低，阻挡数+2，生命上限+5000，每秒流失80点生命值，同时攻击阻挡的所有敌人，伤害类型变为真实，攻击治疗自身相当于攻击力50%的生命值\n技能结束或受到致命伤害时，返回初始位置",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 25,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 15,
          "initSp": 7,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 2.8,
            "damage_per_second": 80,
            "max_hp": 5000,
            "block_cnt": 2,
            "base_attack_time": -1.5,
            "attack@heal_scale": 0.5
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
          "prefabId": "skchr_monstr_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": false
        }
      ],
      "module": {
        "id": "uniequip_002_monstr",
        "name": "记忆存档",
        "type": "XAH-X",
        "level": 3,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_monstr",
          "name": "记忆存档",
          "typeName": "XAH-X",
          "isDefault": true,
          "level": 3,
          "attr": {
            "atk": 65,
            "def": 40
          },
          "traitOverride": {
            "desc": "恢复友方单位生命，且会在3个友方单位间跳跃，每次跳跃治疗量降低15%",
            "descRaw": "恢复友方单位生命，且会在3个友方单位间跳跃，每次跳跃治疗量降低25%",
            "bb": {
              "attack@chain.max_target": 3,
              "attack@chain.atk_scale": 0.85
            },
            "bbStr": {},
            "rangeGrid": null
          },
          "talentChanges": [
            {
              "talentIndex": -1,
              "name": null,
              "desc": "",
              "bb": {
                "attack@chain.max_target": 3,
                "attack@chain.atk_scale": 0.85
              },
              "bbStr": {},
              "rangeGrid": null,
              "hidden": false
            },
            {
              "talentIndex": 0,
              "name": "自我修复",
              "desc": "可以在攻击范围内的地面使用一个仅可被自身治疗的重构体，重构体周围友方单位的攻击力+25%，重构体受到自身和Mon3tr治疗时，可额外进行一次不会衰减的治疗跳跃，且下次跳跃也不衰减",
              "bb": {
                "cnt": 1,
                "atk": 0.25,
                "attack@chain.extra_cnt": 1
              },
              "bbStr": {},
              "rangeGrid": null,
              "hidden": false
            }
          ]
        }
      ],
      "assets": {
        "avatar": "char_4179_monstr_2",
        "portrait": "char_4179_monstr_2",
        "spine": "char_4179_monstr",
        "skillIcon": "skchr_monstr_2",
        "subProfIcon": "sub_chainhealer_icon"
      },
      "expansionBatch": "rhodes-mujica-v1"
    }
  },
  "garrisons": {},
  "tokens": {
    "token_10050_monstr_prosts": {
      "tokenId": "token_10050_monstr_prosts",
      "name": "重构体",
      "kind": "summon",
      "profession": "TOKEN",
      "subProfessionId": "notchar1",
      "position": "MELEE",
      "displayType": "DEFAULT",
      "placeable": true,
      "ownerRange": true,
      "owners": [
        "chess_rm_monstr_a",
        "chess_rm_monstr_b"
      ],
      "count": 1,
      "deployLimit": 1,
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
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": null,
          "desc": "",
          "descRaw": "",
          "bb": {},
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
          "hidden": true,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": null,
          "desc": "",
          "descRaw": "",
          "bb": {},
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
          "hidden": true,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "sources": [
        "talent",
        "display"
      ],
      "skill": null,
      "variants": {
        "chess_rm_monstr_a": {
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
            "bbStr": {},
            "rangeGrid": null
          },
          "talents": [
            {
              "index": 0,
              "name": null,
              "desc": "",
              "descRaw": "",
              "bb": {},
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
              "hidden": true,
              "tokenKey": null,
              "fromModule": false
            },
            {
              "index": 1,
              "name": null,
              "desc": "",
              "descRaw": "",
              "bb": {},
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
              "hidden": true,
              "tokenKey": null,
              "fromModule": false
            }
          ],
          "count": 1,
          "sources": [
            "talent",
            "display"
          ],
          "skill": null
        },
        "chess_rm_monstr_b": {
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
            "bbStr": {},
            "rangeGrid": null
          },
          "talents": [
            {
              "index": 0,
              "name": null,
              "desc": "",
              "descRaw": "",
              "bb": {},
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
              "hidden": true,
              "tokenKey": null,
              "fromModule": false
            },
            {
              "index": 1,
              "name": null,
              "desc": "",
              "descRaw": "",
              "bb": {},
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
              "hidden": true,
              "tokenKey": null,
              "fromModule": false
            }
          ],
          "count": 1,
          "sources": [
            "talent",
            "display"
          ],
          "skill": null
        }
      },
      "abnormal": [
        "healOnlyBySelf"
      ],
      "dmgType": "heal",
      "attackKind": "ranged",
      "projectile": "none",
      "canHitFly": false,
      "expansionBatch": "rhodes-mujica-v1",
      "desc": "仅可被所属Mon3tr和自身治疗；每秒流失80点生命；不计盟约人数。",
      "descRaw": "仅可被所属Mon3tr和自身治疗；每秒流失80点生命；不计盟约人数。"
    }
  },
  "oldMembers": []
};
