// Generated from original GameData by tools/build-iberia.mjs.
export const OVERLAY = {
  "id": "iberia-expansion-v1",
  "version": "iberia-test-5",
  "chess": {
    "chess_iberia_elysm_a": {
      "chessId": "chess_iberia_elysm_a",
      "baseId": "chess_iberia_elysm_a",
      "goldenId": "chess_iberia_elysm_b",
      "isGolden": false,
      "tier": 1,
      "identifier": 16001,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1601,
      "charId": "char_401_elysm",
      "name": "极境",
      "appellation": "Elysium",
      "rarity": "TIER_5",
      "profession": "PIONEER",
      "subProfessionId": "bearer",
      "subProfessionName": "bearer",
      "position": "MELEE",
      "nationId": "rhodes",
      "teamId": null,
      "bonds": [
        "iberiaShip",
        "visiShip"
      ],
      "garrisonIds": [],
      "price": 2,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_iberia_elysm_b",
      "status": {
        "phase": 1,
        "level": 55,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 1162,
        "atk": 424,
        "def": 269,
        "res": 0,
        "cost": 11,
        "blockCnt": 1,
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
        "maxHp": 1162,
        "atk": 424,
        "def": 269,
        "res": 0,
        "cost": 11,
        "blockCnt": 1,
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
        "desc": "技能发动期间阻挡数变为0",
        "descRaw": "技能发动期间阻挡数变为0",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "技能发动期间阻挡数变为0",
        "descRaw": "技能发动期间阻挡数变为0",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "狙击支援",
          "desc": "在场时，所有【狙击】干员的部署费用-1，且技能开启时所有【狙击】干员的攻击速度+10",
          "descRaw": "在场时，所有【狙击】干员的部署费用-1，且技能开启时所有【狙击】干员的攻击速度+10",
          "bb": {
            "value": -1,
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
          "name": "狙击支援",
          "desc": "在场时，所有【狙击】干员的部署费用-1，且技能开启时所有【狙击】干员的攻击速度+10",
          "descRaw": "在场时，所有【狙击】干员的部署费用-1，且技能开启时所有【狙击】干员的攻击速度+10",
          "bb": {
            "value": -1,
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
        "skillId": "skchr_elysm_2",
        "iconId": "skchr_elysm_2",
        "name": "聆听",
        "level": 4,
        "desc": "停止攻击，逐渐回复总共20点部署费用，并在持续时间内锁定周围至多3个敌人\n被锁定的单位移动速度-60%，防御力-22%，失去隐匿效果",
        "descRaw": "停止攻击，逐渐回复总共20点部署费用，并在持续时间内锁定周围至多3个敌人\n被锁定的单位移动速度-60%，防御力-22%，失去隐匿效果",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 15,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 37,
        "initSp": 8,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "max_target": 3,
          "move_speed": -0.6,
          "def": -0.22,
          "value": 20,
          "interval": 0.75,
          "cost": 1
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
        "prefabId": "skchr_elysm_2",
        "trigger": {
          "rule": "ALWAYS"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skcom_assist_cost[3]",
          "iconId": "skcom_assist_cost[3]",
          "name": "支援号令·γ型",
          "level": 4,
          "desc": "停止攻击，持续时间内回复总共18点部署费用",
          "descRaw": "停止攻击，持续时间内回复总共18点部署费用",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 8,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 32,
          "initSp": 11,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "value": 18,
            "interval": 0.44,
            "cost": 1
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": null,
          "trigger": {
            "rule": "ALWAYS"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_elysm_2",
          "iconId": "skchr_elysm_2",
          "name": "聆听",
          "level": 4,
          "desc": "停止攻击，逐渐回复总共20点部署费用，并在持续时间内锁定周围至多3个敌人\n被锁定的单位移动速度-60%，防御力-22%，失去隐匿效果",
          "descRaw": "停止攻击，逐渐回复总共20点部署费用，并在持续时间内锁定周围至多3个敌人\n被锁定的单位移动速度-60%，防御力-22%，失去隐匿效果",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 15,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 37,
          "initSp": 8,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "max_target": 3,
            "move_speed": -0.6,
            "def": -0.22,
            "value": 20,
            "interval": 0.75,
            "cost": 1
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
          "prefabId": "skchr_elysm_2",
          "trigger": {
            "rule": "ALWAYS"
          },
          "index": 1,
          "isDefault": true
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_401_elysm",
        "portrait": "char_401_elysm_1",
        "spine": "char_401_elysm",
        "skillIcon": "skchr_elysm_2",
        "subProfIcon": "sub_bearer_icon"
      },
      "expansionBatch": "iberia-expansion-v1"
    },
    "chess_iberia_elysm_b": {
      "chessId": "chess_iberia_elysm_b",
      "baseId": "chess_iberia_elysm_a",
      "goldenId": "chess_iberia_elysm_b",
      "isGolden": true,
      "tier": 1,
      "identifier": 16001,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1601,
      "charId": "char_401_elysm",
      "name": "极境",
      "appellation": "Elysium",
      "rarity": "TIER_5",
      "profession": "PIONEER",
      "subProfessionId": "bearer",
      "subProfessionName": "bearer",
      "position": "MELEE",
      "nationId": "rhodes",
      "teamId": null,
      "bonds": [
        "iberiaShip",
        "visiShip"
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
        "maxHp": 1608,
        "atk": 500,
        "def": 356,
        "res": 0,
        "cost": 11,
        "blockCnt": 1,
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
        "maxHp": 1498,
        "atk": 500,
        "def": 316,
        "res": 0,
        "cost": 11,
        "blockCnt": 1,
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
        "desc": "技能发动期间阻挡数变为0，但使身前一名干员阻挡数+1",
        "descRaw": "技能发动期间阻挡数变为0",
        "bb": {
          "block_cnt": 1
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "技能发动期间阻挡数变为0",
        "descRaw": "技能发动期间阻挡数变为0",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "狙击支援",
          "desc": "在场时，所有【狙击】干员的部署费用-2，且技能开启时所有【狙击】干员的攻击速度+20",
          "descRaw": "在场时，所有【狙击】干员的部署费用-2，且技能开启时所有【狙击】干员的攻击速度+20",
          "bb": {
            "value": -2,
            "attack_speed": 20
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
          "name": "狙击支援",
          "desc": "在场时，所有【狙击】干员的部署费用-2，且技能开启时所有【狙击】干员的攻击速度+20",
          "descRaw": "在场时，所有【狙击】干员的部署费用-2，且技能开启时所有【狙击】干员的攻击速度+20",
          "bb": {
            "value": -2,
            "attack_speed": 20
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
        "skillId": "skchr_elysm_2",
        "iconId": "skchr_elysm_2",
        "name": "聆听",
        "level": 7,
        "desc": "停止攻击，逐渐回复总共20点部署费用，并在持续时间内锁定周围至多4个敌人\n被锁定的单位移动速度-60%，防御力-25%，失去隐匿效果",
        "descRaw": "停止攻击，逐渐回复总共20点部署费用，并在持续时间内锁定周围至多4个敌人\n被锁定的单位移动速度-60%，防御力-25%，失去隐匿效果",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 15,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 34,
        "initSp": 10,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "max_target": 4,
          "move_speed": -0.6,
          "def": -0.25,
          "value": 20,
          "interval": 0.75,
          "cost": 1
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
        "prefabId": "skchr_elysm_2",
        "trigger": {
          "rule": "ALWAYS"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skcom_assist_cost[3]",
          "iconId": "skcom_assist_cost[3]",
          "name": "支援号令·γ型",
          "level": 7,
          "desc": "停止攻击，持续时间内回复总共18点部署费用",
          "descRaw": "停止攻击，持续时间内回复总共18点部署费用",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 8,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 29,
          "initSp": 12,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "value": 18,
            "interval": 0.44,
            "cost": 1
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": null,
          "trigger": {
            "rule": "ALWAYS"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_elysm_2",
          "iconId": "skchr_elysm_2",
          "name": "聆听",
          "level": 7,
          "desc": "停止攻击，逐渐回复总共20点部署费用，并在持续时间内锁定周围至多4个敌人\n被锁定的单位移动速度-60%，防御力-25%，失去隐匿效果",
          "descRaw": "停止攻击，逐渐回复总共20点部署费用，并在持续时间内锁定周围至多4个敌人\n被锁定的单位移动速度-60%，防御力-25%，失去隐匿效果",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 15,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 34,
          "initSp": 10,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "max_target": 4,
            "move_speed": -0.6,
            "def": -0.25,
            "value": 20,
            "interval": 0.75,
            "cost": 1
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
          "prefabId": "skchr_elysm_2",
          "trigger": {
            "rule": "ALWAYS"
          },
          "index": 1,
          "isDefault": true
        }
      ],
      "module": {
        "id": "uniequip_002_elysm",
        "name": "应急通讯指南",
        "type": "BEA-X",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_elysm",
          "name": "应急通讯指南",
          "typeName": "BEA-X",
          "isDefault": true,
          "level": 1,
          "attr": {
            "maxHp": 110,
            "def": 40
          },
          "traitOverride": {
            "desc": "技能发动期间阻挡数变为0，但使身前一名干员阻挡数+1",
            "descRaw": "技能发动期间阻挡数变为0",
            "bb": {
              "block_cnt": 1
            },
            "bbStr": {},
            "rangeGrid": null
          },
          "talentChanges": []
        }
      ],
      "assets": {
        "avatar": "char_401_elysm_2",
        "portrait": "char_401_elysm_2",
        "spine": "char_401_elysm",
        "skillIcon": "skchr_elysm_2",
        "subProfIcon": "sub_bearer_icon"
      },
      "expansionBatch": "iberia-expansion-v1"
    },
    "chess_iberia_highmo_a": {
      "chessId": "chess_iberia_highmo_a",
      "baseId": "chess_iberia_highmo_a",
      "goldenId": "chess_iberia_highmo_b",
      "isGolden": false,
      "tier": 2,
      "identifier": 16002,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1602,
      "charId": "char_4066_highmo",
      "name": "海沫",
      "appellation": "Highmore",
      "rarity": "TIER_5",
      "profession": "WARRIOR",
      "subProfessionId": "reaper",
      "subProfessionName": "reaper",
      "position": "MELEE",
      "nationId": "iberia",
      "teamId": null,
      "bonds": [
        "iberiaShip",
        "indomShip"
      ],
      "garrisonIds": [],
      "price": 3,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_iberia_highmo_b",
      "status": {
        "phase": 1,
        "level": 60,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 1705,
        "atk": 550,
        "def": 373,
        "res": 0,
        "cost": 20,
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
        "maxHp": 1705,
        "atk": 550,
        "def": 373,
        "res": 0,
        "cost": 20,
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
      "rangeId": "1-3",
      "rangeGrid": [
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
      "canHitFly": false,
      "targetPriority": null,
      "trait": {
        "desc": "无法被友方角色治疗，攻击造成群体伤害，每攻击到一个敌人回复自身50生命，最大生效数等于阻挡数",
        "descRaw": "无法被友方角色治疗，攻击造成群体伤害，每攻击到一个敌人回复自身50生命，最大生效数等于阻挡数",
        "bb": {
          "value": 50
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "无法被友方角色治疗，攻击造成群体伤害，每攻击到一个敌人回复自身50生命，最大生效数等于阻挡数",
        "descRaw": "无法被友方角色治疗，攻击造成群体伤害，每攻击到一个敌人回复自身50生命，最大生效数等于阻挡数",
        "bb": {
          "value": 50
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "收割，给养",
          "desc": "每攻击到一个敌人回复自身18元素损伤，最大生效数等于阻挡数",
          "descRaw": "每攻击到一个敌人回复自身18元素损伤，最大生效数等于阻挡数",
          "bb": {
            "value": 18
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "罹患，浸染",
          "desc": "在【水月与深蓝之树】中，攻击速度+10，阻挡数+1",
          "descRaw": "在【水月与深蓝之树】中，攻击速度+10，阻挡数+1",
          "bb": {
            "attack_speed": 10,
            "block_cnt": 1
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
          "name": "收割，给养",
          "desc": "每攻击到一个敌人回复自身18元素损伤，最大生效数等于阻挡数",
          "descRaw": "每攻击到一个敌人回复自身18元素损伤，最大生效数等于阻挡数",
          "bb": {
            "value": 18
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "罹患，浸染",
          "desc": "在【水月与深蓝之树】中，攻击速度+10，阻挡数+1",
          "descRaw": "在【水月与深蓝之树】中，攻击速度+10，阻挡数+1",
          "bb": {
            "attack_speed": 10,
            "block_cnt": 1
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
        "skillId": "skchr_highmo_2",
        "iconId": "skchr_highmo_2",
        "name": "泡影，殆尽",
        "level": 4,
        "desc": "攻击力+40%，获得45%的物理闪避，攻击范围内有敌人倒下时，恢复自身最大生命值的6%",
        "descRaw": "攻击力+40%，获得45%的物理闪避，攻击范围内有敌人倒下时，恢复自身最大生命值的6%",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 20,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 37,
        "initSp": 12,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk": 0.4,
          "prob": 0.45,
          "hp_ratio": 0.06
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_highmo_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_highmo_1",
          "iconId": "skchr_highmo_1",
          "name": "回首，断舍",
          "level": 4,
          "desc": "下次攻击的攻击力提升至120%，并连续攻击两次",
          "descRaw": "下次攻击的攻击力提升至120%，并连续攻击两次",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 3,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 1.2
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_highmo_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_highmo_2",
          "iconId": "skchr_highmo_2",
          "name": "泡影，殆尽",
          "level": 4,
          "desc": "攻击力+40%，获得45%的物理闪避，攻击范围内有敌人倒下时，恢复自身最大生命值的6%",
          "descRaw": "攻击力+40%，获得45%的物理闪避，攻击范围内有敌人倒下时，恢复自身最大生命值的6%",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 20,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 37,
          "initSp": 12,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.4,
            "prob": 0.45,
            "hp_ratio": 0.06
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_highmo_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_4066_highmo",
        "portrait": "char_4066_highmo_1",
        "spine": "char_4066_highmo",
        "skillIcon": "skchr_highmo_2",
        "subProfIcon": "sub_reaper_icon"
      },
      "expansionBatch": "iberia-expansion-v1"
    },
    "chess_iberia_highmo_b": {
      "chessId": "chess_iberia_highmo_b",
      "baseId": "chess_iberia_highmo_a",
      "goldenId": "chess_iberia_highmo_b",
      "isGolden": true,
      "tier": 2,
      "identifier": 16002,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1602,
      "charId": "char_4066_highmo",
      "name": "海沫",
      "appellation": "Highmore",
      "rarity": "TIER_5",
      "profession": "WARRIOR",
      "subProfessionId": "reaper",
      "subProfessionName": "reaper",
      "position": "MELEE",
      "nationId": "iberia",
      "teamId": null,
      "bonds": [
        "iberiaShip",
        "indomShip"
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
        "maxHp": 2166,
        "atk": 638,
        "def": 432,
        "res": 0,
        "cost": 22,
        "blockCnt": 2,
        "bat": 1.3,
        "aspd": 104,
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
        "maxHp": 2006,
        "atk": 638,
        "def": 432,
        "res": 0,
        "cost": 22,
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
      "rangeId": "1-3",
      "rangeGrid": [
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
      "canHitFly": false,
      "targetPriority": null,
      "trait": {
        "desc": "无法被友方角色治疗，攻击造成群体伤害，每攻击到一个敌人回复自身60生命，最大生效数等于阻挡数",
        "descRaw": "无法被友方角色治疗，攻击造成群体伤害，每攻击到一个敌人回复自身50生命，最大生效数等于阻挡数",
        "bb": {
          "value": 60
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "无法被友方角色治疗，攻击造成群体伤害，每攻击到一个敌人回复自身50生命，最大生效数等于阻挡数",
        "descRaw": "无法被友方角色治疗，攻击造成群体伤害，每攻击到一个敌人回复自身50生命，最大生效数等于阻挡数",
        "bb": {
          "value": 50
        },
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "收割，给养",
          "desc": "每攻击到一个敌人回复自身30元素损伤，最大生效数等于阻挡数",
          "descRaw": "每攻击到一个敌人回复自身30元素损伤，最大生效数等于阻挡数",
          "bb": {
            "value": 30
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "罹患，浸染",
          "desc": "在【水月与深蓝之树】中，攻击速度+25，阻挡数+1",
          "descRaw": "在【水月与深蓝之树】中，攻击速度+25，阻挡数+1",
          "bb": {
            "attack_speed": 25,
            "block_cnt": 1
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
          "name": "收割，给养",
          "desc": "每攻击到一个敌人回复自身30元素损伤，最大生效数等于阻挡数",
          "descRaw": "每攻击到一个敌人回复自身30元素损伤，最大生效数等于阻挡数",
          "bb": {
            "value": 30
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "罹患，浸染",
          "desc": "在【水月与深蓝之树】中，攻击速度+25，阻挡数+1",
          "descRaw": "在【水月与深蓝之树】中，攻击速度+25，阻挡数+1",
          "bb": {
            "attack_speed": 25,
            "block_cnt": 1
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
        "skillId": "skchr_highmo_2",
        "iconId": "skchr_highmo_2",
        "name": "泡影，殆尽",
        "level": 7,
        "desc": "攻击力+50%，获得50%的物理闪避，攻击范围内有敌人倒下时，恢复自身最大生命值的7%",
        "descRaw": "攻击力+50%，获得50%的物理闪避，攻击范围内有敌人倒下时，恢复自身最大生命值的7%",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 20,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 34,
        "initSp": 14,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk": 0.5,
          "prob": 0.5,
          "hp_ratio": 0.07
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_highmo_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_highmo_1",
          "iconId": "skchr_highmo_1",
          "name": "回首，断舍",
          "level": 7,
          "desc": "下次攻击的攻击力提升至135%，并连续攻击两次",
          "descRaw": "下次攻击的攻击力提升至135%，并连续攻击两次",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 3,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 1.35
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_highmo_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_highmo_2",
          "iconId": "skchr_highmo_2",
          "name": "泡影，殆尽",
          "level": 7,
          "desc": "攻击力+50%，获得50%的物理闪避，攻击范围内有敌人倒下时，恢复自身最大生命值的7%",
          "descRaw": "攻击力+50%，获得50%的物理闪避，攻击范围内有敌人倒下时，恢复自身最大生命值的7%",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 20,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 34,
          "initSp": 14,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.5,
            "prob": 0.5,
            "hp_ratio": 0.07
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_highmo_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        }
      ],
      "module": {
        "id": "uniequip_002_highmo",
        "name": "“启航”",
        "type": "REA-X",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_highmo",
          "name": "“启航”",
          "typeName": "REA-X",
          "isDefault": true,
          "level": 1,
          "attr": {
            "maxHp": 160,
            "aspd": 4
          },
          "traitOverride": {
            "desc": "无法被友方角色治疗，攻击造成群体伤害，每攻击到一个敌人回复自身60生命，最大生效数等于阻挡数",
            "descRaw": "无法被友方角色治疗，攻击造成群体伤害，每攻击到一个敌人回复自身50生命，最大生效数等于阻挡数",
            "bb": {
              "value": 60
            },
            "bbStr": {},
            "rangeGrid": null
          },
          "talentChanges": []
        }
      ],
      "assets": {
        "avatar": "char_4066_highmo_2",
        "portrait": "char_4066_highmo_2",
        "spine": "char_4066_highmo",
        "skillIcon": "skchr_highmo_2",
        "subProfIcon": "sub_reaper_icon"
      },
      "expansionBatch": "iberia-expansion-v1"
    },
    "chess_iberia_bluep_a": {
      "chessId": "chess_iberia_bluep_a",
      "baseId": "chess_iberia_bluep_a",
      "goldenId": "chess_iberia_bluep_b",
      "isGolden": false,
      "tier": 2,
      "identifier": 16003,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1602,
      "charId": "char_129_bluep",
      "name": "蓝毒",
      "appellation": "Blue Poison",
      "rarity": "TIER_5",
      "profession": "SNIPER",
      "subProfessionId": "fastshot",
      "subProfessionName": "fastshot",
      "position": "RANGED",
      "nationId": "iberia",
      "teamId": null,
      "bonds": [
        "iberiaShip",
        "preciShip"
      ],
      "garrisonIds": [],
      "price": 3,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_iberia_bluep_b",
      "status": {
        "phase": 1,
        "level": 60,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 953,
        "atk": 418,
        "def": 104,
        "res": 5,
        "cost": 13,
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
        "maxHp": 953,
        "atk": 418,
        "def": 104,
        "res": 5,
        "cost": 13,
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
      "dmgType": "phys",
      "attackKind": "ranged",
      "projectile": "bolt",
      "canHitFly": true,
      "targetPriority": null,
      "trait": {
        "desc": "优先攻击空中单位",
        "descRaw": "优先攻击空中单位",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "优先攻击空中单位",
        "descRaw": "优先攻击空中单位",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "神经毒素",
          "desc": "攻击使目标中毒，在3秒内每秒受到30点法术伤害",
          "descRaw": "攻击使目标中毒，在3秒内每秒受到30点法术伤害",
          "bb": {
            "duration": 3.1,
            "poison_damage": 30
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
          "name": "神经毒素",
          "desc": "攻击使目标中毒，在3秒内每秒受到30点法术伤害",
          "descRaw": "攻击使目标中毒，在3秒内每秒受到30点法术伤害",
          "bb": {
            "duration": 3.1,
            "poison_damage": 30
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
        "skillId": "skchr_bluep_1",
        "iconId": "skchr_bluep_1",
        "name": "二重射击·自动",
        "level": 4,
        "desc": "下次攻击额外攻击一个目标，造成相当于攻击力140%的物理伤害",
        "descRaw": "下次攻击额外攻击一个目标，造成相当于攻击力140%的物理伤害",
        "skillType": "AUTO",
        "durationType": "NONE",
        "duration": -1,
        "spType": "INCREASE_WHEN_ATTACK",
        "spCost": 3,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk_scale": 1.4
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_bluep_1",
        "trigger": {
          "rule": "SP_FULL"
        },
        "index": 0,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_bluep_1",
          "iconId": "skchr_bluep_1",
          "name": "二重射击·自动",
          "level": 4,
          "desc": "下次攻击额外攻击一个目标，造成相当于攻击力140%的物理伤害",
          "descRaw": "下次攻击额外攻击一个目标，造成相当于攻击力140%的物理伤害",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": -1,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 3,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 1.4
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_bluep_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": true
        },
        {
          "skillId": "skchr_bluep_2",
          "iconId": "skchr_bluep_2",
          "name": "毒液散射",
          "level": 4,
          "desc": "攻击力+20%，每次攻击额外攻击2个目标",
          "descRaw": "攻击力+20%，每次攻击额外攻击2个目标",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 23,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 50,
          "initSp": 15,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.2,
            "attack@times": 1
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_bluep_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_129_bluep",
        "portrait": "char_129_bluep_1",
        "spine": "char_129_bluep",
        "skillIcon": "skchr_bluep_1",
        "subProfIcon": "sub_fastshot_icon"
      },
      "expansionBatch": "iberia-expansion-v1"
    },
    "chess_iberia_bluep_b": {
      "chessId": "chess_iberia_bluep_b",
      "baseId": "chess_iberia_bluep_a",
      "goldenId": "chess_iberia_bluep_b",
      "isGolden": true,
      "tier": 2,
      "identifier": 16003,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1602,
      "charId": "char_129_bluep",
      "name": "蓝毒",
      "appellation": "Blue Poison",
      "rarity": "TIER_5",
      "profession": "SNIPER",
      "subProfessionId": "fastshot",
      "subProfessionName": "fastshot",
      "position": "RANGED",
      "nationId": "iberia",
      "teamId": null,
      "bonds": [
        "iberiaShip",
        "preciShip"
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
        "maxHp": 1152,
        "atk": 524,
        "def": 123,
        "res": 5,
        "cost": 13,
        "blockCnt": 1,
        "bat": 1,
        "aspd": 102,
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
        "maxHp": 1152,
        "atk": 504,
        "def": 123,
        "res": 5,
        "cost": 13,
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
      "dmgType": "phys",
      "attackKind": "ranged",
      "projectile": "bolt",
      "canHitFly": true,
      "targetPriority": null,
      "trait": {
        "desc": "优先攻击空中单位",
        "descRaw": "优先攻击空中单位",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null,
        "moduleDesc": "范围内存在地面敌人时攻击速度+8"
      },
      "traitBase": {
        "desc": "优先攻击空中单位",
        "descRaw": "优先攻击空中单位",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "神经毒素",
          "desc": "攻击使目标中毒，在3秒内每秒受到75点法术伤害",
          "descRaw": "攻击使目标中毒，在3秒内每秒受到75点法术伤害",
          "bb": {
            "duration": 3.1,
            "poison_damage": 75
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
            "attack_speed": 8
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
          "name": "神经毒素",
          "desc": "攻击使目标中毒，在3秒内每秒受到75点法术伤害",
          "descRaw": "攻击使目标中毒，在3秒内每秒受到75点法术伤害",
          "bb": {
            "duration": 3.1,
            "poison_damage": 75
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
        "skillId": "skchr_bluep_1",
        "iconId": "skchr_bluep_1",
        "name": "二重射击·自动",
        "level": 7,
        "desc": "下次攻击额外攻击一个目标，造成相当于攻击力155%的物理伤害",
        "descRaw": "下次攻击额外攻击一个目标，造成相当于攻击力155%的物理伤害",
        "skillType": "AUTO",
        "durationType": "NONE",
        "duration": -1,
        "spType": "INCREASE_WHEN_ATTACK",
        "spCost": 3,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk_scale": 1.55
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_bluep_1",
        "trigger": {
          "rule": "SP_FULL"
        },
        "index": 0,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_bluep_1",
          "iconId": "skchr_bluep_1",
          "name": "二重射击·自动",
          "level": 7,
          "desc": "下次攻击额外攻击一个目标，造成相当于攻击力155%的物理伤害",
          "descRaw": "下次攻击额外攻击一个目标，造成相当于攻击力155%的物理伤害",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": -1,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 3,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 1.55
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_bluep_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": true
        },
        {
          "skillId": "skchr_bluep_2",
          "iconId": "skchr_bluep_2",
          "name": "毒液散射",
          "level": 7,
          "desc": "攻击力+30%，每次攻击额外攻击2个目标",
          "descRaw": "攻击力+30%，每次攻击额外攻击2个目标",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 26,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 50,
          "initSp": 20,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.3,
            "attack@times": 1
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_bluep_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false
        }
      ],
      "module": {
        "id": "uniequip_002_bluep",
        "name": "标准比色卡",
        "type": "MAR-Y",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_bluep",
          "name": "标准比色卡",
          "typeName": "MAR-Y",
          "isDefault": true,
          "level": 1,
          "attr": {
            "atk": 20,
            "aspd": 2
          },
          "traitOverride": {
            "desc": "优先攻击空中单位",
            "descRaw": "优先攻击空中单位",
            "bb": {},
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "范围内存在地面敌人时攻击速度+8"
          },
          "talentChanges": [
            {
              "talentIndex": -1,
              "name": null,
              "desc": "",
              "bb": {
                "attack_speed": 8
              },
              "bbStr": {},
              "rangeGrid": null,
              "hidden": true
            }
          ]
        }
      ],
      "assets": {
        "avatar": "char_129_bluep_2",
        "portrait": "char_129_bluep_2",
        "spine": "char_129_bluep",
        "skillIcon": "skchr_bluep_1",
        "subProfIcon": "sub_fastshot_icon"
      },
      "expansionBatch": "iberia-expansion-v1"
    },
    "chess_iberia_rosesa_a": {
      "chessId": "chess_iberia_rosesa_a",
      "baseId": "chess_iberia_rosesa_a",
      "goldenId": "chess_iberia_rosesa_b",
      "isGolden": false,
      "tier": 5,
      "identifier": 16004,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1605,
      "charId": "char_4163_rosesa",
      "name": "瑰盐",
      "appellation": "Rose Salt",
      "rarity": "TIER_5",
      "profession": "MEDIC",
      "subProfessionId": "ringhealer",
      "subProfessionName": "群愈师",
      "position": "RANGED",
      "nationId": "iberia",
      "teamId": null,
      "bonds": [
        "iberiaShip",
        "deputShip"
      ],
      "garrisonIds": [],
      "price": 4,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_iberia_rosesa_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 1323,
        "atk": 264,
        "def": 125,
        "res": 0,
        "cost": 19,
        "blockCnt": 1,
        "bat": 2.85,
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
        "maxHp": 1323,
        "atk": 264,
        "def": 125,
        "res": 0,
        "cost": 19,
        "blockCnt": 1,
        "bat": 2.85,
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
        "desc": "同时恢复三个友方单位的生命",
        "descRaw": "同时恢复三个友方单位的生命",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "同时恢复三个友方单位的生命",
        "descRaw": "同时恢复三个友方单位的生命",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "最好的草药医生",
          "desc": "自身攻击力-5%，但攻击范围内的友方干员受到的治疗效果提升15%",
          "descRaw": "自身攻击力-5%，但攻击范围内的友方干员受到的治疗效果提升15%",
          "bb": {
            "atk": -0.05,
            "heal_scale": 1.15
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
          "name": "最好的草药医生",
          "desc": "自身攻击力-5%，但攻击范围内的友方干员受到的治疗效果提升15%",
          "descRaw": "自身攻击力-5%，但攻击范围内的友方干员受到的治疗效果提升15%",
          "bb": {
            "atk": -0.05,
            "heal_scale": 1.15
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
        "skillId": "skchr_rosesa_2",
        "iconId": "skchr_rosesa_2",
        "name": "绝妙的长效药呀",
        "level": 4,
        "desc": "攻击间隔小幅度缩短，攻击范围内的友方干员受到的物理与法术伤害的20%变为持续5秒的生命流失",
        "descRaw": "攻击间隔小幅度缩短，攻击范围内的友方干员受到的物理与法术伤害的20%变为持续5秒的生命流失",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 27,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 43,
        "initSp": 19,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "attack@interval": 1,
          "attack@final_duration": 5,
          "base_attack_time": -1.05,
          "attack@damage_scale": 0.8,
          "damage_reduce_scale_display": 0.2
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_rosesa_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_rosesa_1",
          "iconId": "skchr_rosesa_1",
          "name": "上佳的应急药呀",
          "level": 4,
          "desc": "下次治疗可以恢复相当于攻击力150%的生命\n可充能1次",
          "descRaw": "下次治疗可以恢复相当于攻击力150%的生命\n可充能1次",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 10,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "heal_scale": 1.5,
            "ct": 1
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_rosesa_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_rosesa_2",
          "iconId": "skchr_rosesa_2",
          "name": "绝妙的长效药呀",
          "level": 4,
          "desc": "攻击间隔小幅度缩短，攻击范围内的友方干员受到的物理与法术伤害的20%变为持续5秒的生命流失",
          "descRaw": "攻击间隔小幅度缩短，攻击范围内的友方干员受到的物理与法术伤害的20%变为持续5秒的生命流失",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 27,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 43,
          "initSp": 19,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "attack@interval": 1,
            "attack@final_duration": 5,
            "base_attack_time": -1.05,
            "attack@damage_scale": 0.8,
            "damage_reduce_scale_display": 0.2
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_rosesa_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_4163_rosesa",
        "portrait": "char_4163_rosesa_1",
        "spine": "char_4163_rosesa",
        "skillIcon": "skchr_rosesa_2",
        "subProfIcon": "sub_ringhealer_icon"
      },
      "expansionBatch": "iberia-expansion-v1"
    },
    "chess_iberia_rosesa_b": {
      "chessId": "chess_iberia_rosesa_b",
      "baseId": "chess_iberia_rosesa_a",
      "goldenId": "chess_iberia_rosesa_b",
      "isGolden": true,
      "tier": 5,
      "identifier": 16004,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1605,
      "charId": "char_4163_rosesa",
      "name": "瑰盐",
      "appellation": "Rose Salt",
      "rarity": "TIER_5",
      "profession": "MEDIC",
      "subProfessionId": "ringhealer",
      "subProfessionName": "群愈师",
      "position": "RANGED",
      "nationId": "iberia",
      "teamId": null,
      "bonds": [
        "iberiaShip",
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
        "equipLevel": 1
      },
      "stats": {
        "maxHp": 1656,
        "atk": 338,
        "def": 144,
        "res": 0,
        "cost": 19,
        "blockCnt": 1,
        "bat": 2.85,
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
        "maxHp": 1586,
        "atk": 313,
        "def": 144,
        "res": 0,
        "cost": 19,
        "blockCnt": 1,
        "bat": 2.85,
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
        "desc": "同时恢复三个友方单位的生命",
        "descRaw": "同时恢复三个友方单位的生命",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null,
        "moduleDesc": "攻击范围扩大"
      },
      "traitBase": {
        "desc": "同时恢复三个友方单位的生命",
        "descRaw": "同时恢复三个友方单位的生命",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "最好的草药医生",
          "desc": "自身攻击力-5%，但攻击范围内的友方干员受到的治疗效果提升15%",
          "descRaw": "自身攻击力-5%，但攻击范围内的友方干员受到的治疗效果提升15%",
          "bb": {
            "atk": -0.05,
            "heal_scale": 1.15
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
              0,
              3
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
          "hidden": true,
          "fromModule": true
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "最好的草药医生",
          "desc": "自身攻击力-5%，但攻击范围内的友方干员受到的治疗效果提升15%",
          "descRaw": "自身攻击力-5%，但攻击范围内的友方干员受到的治疗效果提升15%",
          "bb": {
            "atk": -0.05,
            "heal_scale": 1.15
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
        "skillId": "skchr_rosesa_2",
        "iconId": "skchr_rosesa_2",
        "name": "绝妙的长效药呀",
        "level": 7,
        "desc": "攻击间隔缩短，攻击范围内的友方干员受到的物理与法术伤害的30%变为持续5秒的生命流失",
        "descRaw": "攻击间隔缩短，攻击范围内的友方干员受到的物理与法术伤害的30%变为持续5秒的生命流失",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 27,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 40,
        "initSp": 21,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "attack@interval": 1,
          "attack@final_duration": 5,
          "base_attack_time": -1.35,
          "attack@damage_scale": 0.7,
          "damage_reduce_scale_display": 0.3
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_rosesa_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_rosesa_1",
          "iconId": "skchr_rosesa_1",
          "name": "上佳的应急药呀",
          "level": 7,
          "desc": "下次治疗可以恢复相当于攻击力165%的生命\n可充能1次",
          "descRaw": "下次治疗可以恢复相当于攻击力165%的生命\n可充能1次",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 10,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "heal_scale": 1.65,
            "ct": 1
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_rosesa_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_rosesa_2",
          "iconId": "skchr_rosesa_2",
          "name": "绝妙的长效药呀",
          "level": 7,
          "desc": "攻击间隔缩短，攻击范围内的友方干员受到的物理与法术伤害的30%变为持续5秒的生命流失",
          "descRaw": "攻击间隔缩短，攻击范围内的友方干员受到的物理与法术伤害的30%变为持续5秒的生命流失",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 27,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 40,
          "initSp": 21,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "attack@interval": 1,
            "attack@final_duration": 5,
            "base_attack_time": -1.35,
            "attack@damage_scale": 0.7,
            "damage_reduce_scale_display": 0.3
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_rosesa_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        }
      ],
      "module": {
        "id": "uniequip_002_rosesa",
        "name": "多彩盐漠生活",
        "type": "RIN-X",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_rosesa",
          "name": "多彩盐漠生活",
          "typeName": "RIN-X",
          "isDefault": true,
          "level": 1,
          "attr": {
            "maxHp": 70,
            "atk": 25
          },
          "traitOverride": {
            "desc": "同时恢复三个友方单位的生命",
            "descRaw": "同时恢复三个友方单位的生命",
            "bb": {},
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "攻击范围扩大"
          },
          "talentChanges": [
            {
              "talentIndex": -1,
              "name": null,
              "desc": "",
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
                  0,
                  3
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
              "hidden": true
            }
          ]
        }
      ],
      "assets": {
        "avatar": "char_4163_rosesa_2",
        "portrait": "char_4163_rosesa_2",
        "spine": "char_4163_rosesa",
        "skillIcon": "skchr_rosesa_2",
        "subProfIcon": "sub_ringhealer_icon"
      },
      "expansionBatch": "iberia-expansion-v1"
    },
    "chess_iberia_glacus_a": {
      "chessId": "chess_iberia_glacus_a",
      "baseId": "chess_iberia_glacus_a",
      "goldenId": "chess_iberia_glacus_b",
      "isGolden": false,
      "tier": 3,
      "identifier": 16005,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1603,
      "charId": "char_326_glacus",
      "name": "格劳克斯",
      "appellation": "Glaucus",
      "rarity": "TIER_5",
      "profession": "SUPPORT",
      "subProfessionId": "slower",
      "subProfessionName": "凝滞师",
      "position": "RANGED",
      "nationId": "iberia",
      "teamId": null,
      "bonds": [
        "iberiaShip",
        "arcaneShip"
      ],
      "garrisonIds": [],
      "price": 3,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_iberia_glacus_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 1013,
        "atk": 419,
        "def": 84,
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
        "maxHp": 1013,
        "atk": 419,
        "def": 84,
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
          "name": "反制装置",
          "desc": "优先攻击【无人机】单位，且攻击【无人机】时攻击力提升至150%",
          "descRaw": "优先攻击【无人机】单位，且攻击【无人机】时攻击力提升至150%",
          "bb": {
            "atk_scale": 1.5
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
          "name": "反制装置",
          "desc": "优先攻击【无人机】单位，且攻击【无人机】时攻击力提升至150%",
          "descRaw": "优先攻击【无人机】单位，且攻击【无人机】时攻击力提升至150%",
          "bb": {
            "atk_scale": 1.5
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
        "skillId": "skchr_glacus_2",
        "iconId": "skchr_glacus_2",
        "name": "反制电磁脉冲",
        "level": 4,
        "desc": "向周围发射一道冲击波，击中的所有敌人受到攻击力260%的法术伤害并束缚4秒；如果目标是【无人机】，受到的伤害加倍并将效果改为晕眩",
        "descRaw": "向周围发射一道冲击波，击中的所有敌人受到攻击力260%的法术伤害并束缚4秒；如果目标是【无人机】，受到的伤害加倍并将效果改为晕眩",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 0,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 37,
        "initSp": 13,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk_scale[drone]": 5.2,
          "atk_scale[normal]": 2.6,
          "frozen": 4,
          "stun": 4
        },
        "bbStr": {},
        "rangeId": "x-3",
        "rangeGrid": [
          [
            3,
            0
          ],
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
            -3
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
            0,
            3
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
          ],
          [
            -3,
            0
          ]
        ],
        "prefabId": "skchr_glacus_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_glacus_1",
          "iconId": "skchr_glacus_1",
          "name": "双线装填",
          "level": 4,
          "desc": "攻击力+30%，额外攻击一个目标",
          "descRaw": "攻击力+30%，额外攻击一个目标",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 19,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 35,
          "initSp": 6,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.3,
            "attack@max_target": 2
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_glacus_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_glacus_2",
          "iconId": "skchr_glacus_2",
          "name": "反制电磁脉冲",
          "level": 4,
          "desc": "向周围发射一道冲击波，击中的所有敌人受到攻击力260%的法术伤害并束缚4秒；如果目标是【无人机】，受到的伤害加倍并将效果改为晕眩",
          "descRaw": "向周围发射一道冲击波，击中的所有敌人受到攻击力260%的法术伤害并束缚4秒；如果目标是【无人机】，受到的伤害加倍并将效果改为晕眩",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 37,
          "initSp": 13,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale[drone]": 5.2,
            "atk_scale[normal]": 2.6,
            "frozen": 4,
            "stun": 4
          },
          "bbStr": {},
          "rangeId": "x-3",
          "rangeGrid": [
            [
              3,
              0
            ],
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
              -3
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
              0,
              3
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
            ],
            [
              -3,
              0
            ]
          ],
          "prefabId": "skchr_glacus_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_326_glacus",
        "portrait": "char_326_glacus_1",
        "spine": "char_326_glacus",
        "skillIcon": "skchr_glacus_2",
        "subProfIcon": "sub_slower_icon"
      },
      "expansionBatch": "iberia-expansion-v1"
    },
    "chess_iberia_glacus_b": {
      "chessId": "chess_iberia_glacus_b",
      "baseId": "chess_iberia_glacus_a",
      "goldenId": "chess_iberia_glacus_b",
      "isGolden": true,
      "tier": 3,
      "identifier": 16005,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1603,
      "charId": "char_326_glacus",
      "name": "格劳克斯",
      "appellation": "Glaucus",
      "rarity": "TIER_5",
      "profession": "SUPPORT",
      "subProfessionId": "slower",
      "subProfessionName": "凝滞师",
      "position": "RANGED",
      "nationId": "iberia",
      "teamId": null,
      "bonds": [
        "iberiaShip",
        "arcaneShip"
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
        "maxHp": 1293,
        "atk": 513,
        "def": 96,
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
        "maxHp": 1203,
        "atk": 483,
        "def": 96,
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
        "rangeGrid": null,
        "moduleDesc": "攻击范围内存在敌人时技力自然恢复速度+0.2/秒"
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
          "name": "反制装置",
          "desc": "优先攻击【无人机】单位，且攻击【无人机】时攻击力提升至150%",
          "descRaw": "优先攻击【无人机】单位，且攻击【无人机】时攻击力提升至150%",
          "bb": {
            "atk_scale": 1.5
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
            "sp_recovery_per_sec": 0.2
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
          "name": "反制装置",
          "desc": "优先攻击【无人机】单位，且攻击【无人机】时攻击力提升至150%",
          "descRaw": "优先攻击【无人机】单位，且攻击【无人机】时攻击力提升至150%",
          "bb": {
            "atk_scale": 1.5
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
        "skillId": "skchr_glacus_2",
        "iconId": "skchr_glacus_2",
        "name": "反制电磁脉冲",
        "level": 7,
        "desc": "向周围发射一道冲击波，击中的所有敌人受到攻击力320%的法术伤害并束缚4.5秒；如果目标是【无人机】，受到的伤害加倍并将效果改为晕眩",
        "descRaw": "向周围发射一道冲击波，击中的所有敌人受到攻击力320%的法术伤害并束缚4.5秒；如果目标是【无人机】，受到的伤害加倍并将效果改为晕眩",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 0,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 34,
        "initSp": 16,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk_scale[drone]": 6.4,
          "atk_scale[normal]": 3.2,
          "frozen": 4.5,
          "stun": 4.5
        },
        "bbStr": {},
        "rangeId": "x-3",
        "rangeGrid": [
          [
            3,
            0
          ],
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
            -3
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
            0,
            3
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
          ],
          [
            -3,
            0
          ]
        ],
        "prefabId": "skchr_glacus_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_glacus_1",
          "iconId": "skchr_glacus_1",
          "name": "双线装填",
          "level": 7,
          "desc": "攻击力+40%，额外攻击一个目标",
          "descRaw": "攻击力+40%，额外攻击一个目标",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 22,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 35,
          "initSp": 12,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.4,
            "attack@max_target": 2
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_glacus_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_glacus_2",
          "iconId": "skchr_glacus_2",
          "name": "反制电磁脉冲",
          "level": 7,
          "desc": "向周围发射一道冲击波，击中的所有敌人受到攻击力320%的法术伤害并束缚4.5秒；如果目标是【无人机】，受到的伤害加倍并将效果改为晕眩",
          "descRaw": "向周围发射一道冲击波，击中的所有敌人受到攻击力320%的法术伤害并束缚4.5秒；如果目标是【无人机】，受到的伤害加倍并将效果改为晕眩",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 34,
          "initSp": 16,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale[drone]": 6.4,
            "atk_scale[normal]": 3.2,
            "frozen": 4.5,
            "stun": 4.5
          },
          "bbStr": {},
          "rangeId": "x-3",
          "rangeGrid": [
            [
              3,
              0
            ],
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
              -3
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
              0,
              3
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
            ],
            [
              -3,
              0
            ]
          ],
          "prefabId": "skchr_glacus_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        }
      ],
      "module": {
        "id": "uniequip_002_glacus",
        "name": "外骨骼装备",
        "type": "DEC-X",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_glacus",
          "name": "外骨骼装备",
          "typeName": "DEC-X",
          "isDefault": true,
          "level": 1,
          "attr": {
            "maxHp": 90,
            "atk": 30
          },
          "traitOverride": {
            "desc": "攻击造成法术伤害，并对敌人造成短暂的停顿",
            "descRaw": "攻击造成法术伤害，并对敌人造成短暂的停顿",
            "bb": {
              "sluggish": 0.8
            },
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "攻击范围内存在敌人时技力自然恢复速度+0.2/秒"
          },
          "talentChanges": [
            {
              "talentIndex": -1,
              "name": null,
              "desc": "",
              "bb": {
                "sp_recovery_per_sec": 0.2
              },
              "bbStr": {},
              "rangeGrid": null,
              "hidden": true
            }
          ]
        }
      ],
      "assets": {
        "avatar": "char_326_glacus_2",
        "portrait": "char_326_glacus_2",
        "spine": "char_326_glacus",
        "skillIcon": "skchr_glacus_2",
        "subProfIcon": "sub_slower_icon"
      },
      "expansionBatch": "iberia-expansion-v1"
    },
    "chess_iberia_toledo_a": {
      "chessId": "chess_iberia_toledo_a",
      "baseId": "chess_iberia_toledo_a",
      "goldenId": "chess_iberia_toledo_b",
      "isGolden": false,
      "tier": 4,
      "identifier": 16006,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1604,
      "charId": "char_393_toledo",
      "name": "德·托莱多",
      "appellation": "de Toledo",
      "rarity": "TIER_5",
      "profession": "SUPPORT",
      "subProfessionId": "underminer",
      "subProfessionName": "underminer",
      "position": "RANGED",
      "nationId": "iberia",
      "teamId": null,
      "bonds": [
        "iberiaShip",
        "steadShip"
      ],
      "garrisonIds": [],
      "price": 3,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_iberia_toledo_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 1212,
        "atk": 361,
        "def": 96,
        "res": 25,
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
        "maxHp": 1212,
        "atk": 361,
        "def": 96,
        "res": 25,
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
      "rangeId": "y-6",
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
          "name": "“贵族血统”",
          "desc": "攻击范围内被阻挡的敌人获得16%的脆弱效果",
          "descRaw": "攻击范围内被阻挡的敌人获得16%的脆弱效果",
          "bb": {
            "damage_scale": 1.16
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
          "name": "“贵族血统”",
          "desc": "攻击范围内被阻挡的敌人获得16%的脆弱效果",
          "descRaw": "攻击范围内被阻挡的敌人获得16%的脆弱效果",
          "bb": {
            "damage_scale": 1.16
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [
        "token_10067_toledo_tldptm"
      ],
      "skill": {
        "skillId": "skchr_toledo_2",
        "iconId": "skchr_toledo_2",
        "name": "危言耸听",
        "level": 4,
        "desc": "天赋效果提升至1.4倍，在攻击范围内的近战部署位召唤一个可以阻挡敌人的征服者传说，征服者传说在出现时会使附近的敌人战栗3秒",
        "descRaw": "天赋效果提升至1.4倍，在攻击范围内的近战部署位召唤一个可以阻挡敌人的征服者传说，征服者传说在出现时会使附近的敌人战栗3秒",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 20,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 40,
        "initSp": 9,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "talent@s2_talent_scale": 1.4,
          "not_combat": 3
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_toledo_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_toledo_1",
          "iconId": "skchr_toledo_1",
          "name": "以假乱真",
          "level": 4,
          "desc": "攻击力+66%，攻击范围内被阻挡的敌人获得17%虚弱效果",
          "descRaw": "攻击力+66%，攻击范围内被阻挡的敌人获得17%虚弱效果",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 24,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 55,
          "initSp": 23,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.66,
            "attack@atk": -0.17
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_toledo_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_toledo_2",
          "iconId": "skchr_toledo_2",
          "name": "危言耸听",
          "level": 4,
          "desc": "天赋效果提升至1.4倍，在攻击范围内的近战部署位召唤一个可以阻挡敌人的征服者传说，征服者传说在出现时会使附近的敌人战栗3秒",
          "descRaw": "天赋效果提升至1.4倍，在攻击范围内的近战部署位召唤一个可以阻挡敌人的征服者传说，征服者传说在出现时会使附近的敌人战栗3秒",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 20,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 40,
          "initSp": 9,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "talent@s2_talent_scale": 1.4,
            "not_combat": 3
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_toledo_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_393_toledo",
        "portrait": "char_393_toledo_1",
        "spine": "char_393_toledo",
        "skillIcon": "skchr_toledo_2",
        "subProfIcon": "sub_underminer_icon"
      },
      "expansionBatch": "iberia-expansion-v1"
    },
    "chess_iberia_toledo_b": {
      "chessId": "chess_iberia_toledo_b",
      "baseId": "chess_iberia_toledo_a",
      "goldenId": "chess_iberia_toledo_b",
      "isGolden": true,
      "tier": 4,
      "identifier": 16006,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1604,
      "charId": "char_393_toledo",
      "name": "德·托莱多",
      "appellation": "de Toledo",
      "rarity": "TIER_5",
      "profession": "SUPPORT",
      "subProfessionId": "underminer",
      "subProfessionName": "underminer",
      "position": "RANGED",
      "nationId": "iberia",
      "teamId": null,
      "bonds": [
        "iberiaShip",
        "steadShip"
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
        "maxHp": 1603,
        "atk": 416,
        "def": 119,
        "res": 25,
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
        "maxHp": 1468,
        "atk": 416,
        "def": 106,
        "res": 25,
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
      "rangeId": "y-6",
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
        "moduleDesc": "攻击范围内存在精英或领袖敌人时技力自然恢复速度+0.25/秒"
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
          "name": "“贵族血统”",
          "desc": "攻击范围内被阻挡的敌人获得16%的脆弱效果",
          "descRaw": "攻击范围内被阻挡的敌人获得16%的脆弱效果",
          "bb": {
            "damage_scale": 1.16
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
            "sp_recovery_per_sec": 0.25
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
          "name": "“贵族血统”",
          "desc": "攻击范围内被阻挡的敌人获得16%的脆弱效果",
          "descRaw": "攻击范围内被阻挡的敌人获得16%的脆弱效果",
          "bb": {
            "damage_scale": 1.16
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        }
      ],
      "tokens": [
        "token_10067_toledo_tldptm"
      ],
      "skill": {
        "skillId": "skchr_toledo_2",
        "iconId": "skchr_toledo_2",
        "name": "危言耸听",
        "level": 7,
        "desc": "天赋效果提升至1.7倍，在攻击范围内的近战部署位召唤一个可以阻挡敌人的征服者传说，征服者传说在出现时会使附近的敌人战栗4秒",
        "descRaw": "天赋效果提升至1.7倍，在攻击范围内的近战部署位召唤一个可以阻挡敌人的征服者传说，征服者传说在出现时会使附近的敌人战栗4秒",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 20,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 40,
        "initSp": 12,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "talent@s2_talent_scale": 1.7,
          "not_combat": 4
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_toledo_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_toledo_1",
          "iconId": "skchr_toledo_1",
          "name": "以假乱真",
          "level": 7,
          "desc": "攻击力+75%，攻击范围内被阻挡的敌人获得19%虚弱效果",
          "descRaw": "攻击力+75%，攻击范围内被阻挡的敌人获得19%虚弱效果",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 27,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 55,
          "initSp": 26,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.75,
            "attack@atk": -0.19
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_toledo_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_toledo_2",
          "iconId": "skchr_toledo_2",
          "name": "危言耸听",
          "level": 7,
          "desc": "天赋效果提升至1.7倍，在攻击范围内的近战部署位召唤一个可以阻挡敌人的征服者传说，征服者传说在出现时会使附近的敌人战栗4秒",
          "descRaw": "天赋效果提升至1.7倍，在攻击范围内的近战部署位召唤一个可以阻挡敌人的征服者传说，征服者传说在出现时会使附近的敌人战栗4秒",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 20,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 40,
          "initSp": 12,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "talent@s2_talent_scale": 1.7,
            "not_combat": 4
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_toledo_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        }
      ],
      "module": {
        "id": "uniequip_002_toledo",
        "name": "贵族义务",
        "type": "UMD-Y",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_toledo",
          "name": "贵族义务",
          "typeName": "UMD-Y",
          "isDefault": true,
          "level": 1,
          "attr": {
            "maxHp": 135,
            "def": 13
          },
          "traitOverride": {
            "desc": "攻击造成法术伤害",
            "descRaw": "攻击造成法术伤害",
            "bb": {},
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "攻击范围内存在精英或领袖敌人时技力自然恢复速度+0.25/秒"
          },
          "talentChanges": [
            {
              "talentIndex": -1,
              "name": null,
              "desc": "",
              "bb": {
                "sp_recovery_per_sec": 0.25
              },
              "bbStr": {},
              "rangeGrid": null,
              "hidden": true
            }
          ]
        }
      ],
      "assets": {
        "avatar": "char_393_toledo_2",
        "portrait": "char_393_toledo_2",
        "spine": "char_393_toledo",
        "skillIcon": "skchr_toledo_2",
        "subProfIcon": "sub_underminer_icon"
      },
      "expansionBatch": "iberia-expansion-v1"
    },
    "chess_iberia_hbound_a": {
      "chessId": "chess_iberia_hbound_a",
      "baseId": "chess_iberia_hbound_a",
      "goldenId": "chess_iberia_hbound_b",
      "isGolden": false,
      "tier": 4,
      "identifier": 16007,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1604,
      "charId": "char_4232_hbound",
      "name": "旅骨",
      "appellation": "Homebound",
      "rarity": "TIER_5",
      "profession": "SPECIAL",
      "subProfessionId": "alchemist",
      "subProfessionName": "alchemist",
      "position": "RANGED",
      "nationId": "iberia",
      "teamId": null,
      "bonds": [
        "iberiaShip",
        "swiftShip"
      ],
      "garrisonIds": [],
      "price": 3,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_iberia_hbound_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 916,
        "atk": 373,
        "def": 84,
        "res": 30,
        "cost": 19,
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
        "maxHp": 916,
        "atk": 373,
        "def": 84,
        "res": 30,
        "cost": 19,
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
      "rangeId": "3-5",
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
        "desc": "可以投掷炼金单元协助作战",
        "descRaw": "可以投掷炼金单元协助作战",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "可以投掷炼金单元协助作战",
        "descRaw": "可以投掷炼金单元协助作战",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "潜水作业",
          "desc": "使自身炼金单元影响范围内地面敌人的物理和法术命中率-9%；若敌人重量大于等于3，改为物理和法术命中率-13%",
          "descRaw": "使自身炼金单元影响范围内地面敌人的物理和法术命中率-9%；若敌人重量大于等于3，改为物理和法术命中率-13%",
          "bb": {
            "hitrate": -0.09,
            "heavy_hitrate": -0.13,
            "value": 3
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
          "name": "潜水作业",
          "desc": "使自身炼金单元影响范围内地面敌人的物理和法术命中率-9%；若敌人重量大于等于3，改为物理和法术命中率-13%",
          "descRaw": "使自身炼金单元影响范围内地面敌人的物理和法术命中率-9%；若敌人重量大于等于3，改为物理和法术命中率-13%",
          "bb": {
            "hitrate": -0.09,
            "heavy_hitrate": -0.13,
            "value": 3
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
        "skillId": "skchr_hbound_2",
        "iconId": "skchr_hbound_2",
        "name": "座浅",
        "level": 4,
        "desc": "投掷一个炼金单元，在31秒内使落点周围的地面敌人每秒受到相当于攻击力14%的法术伤害；重量大于等于3的敌人移动速度-60%，每秒额外受到相当于攻击力120%的法术伤害",
        "descRaw": "投掷一个炼金单元，在31秒内使落点周围的地面敌人每秒受到相当于攻击力14%的法术伤害；重量大于等于3的敌人移动速度-60%，每秒额外受到相当于攻击力120%的法术伤害",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": -1,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 57,
        "initSp": 26,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "projectile_delay_time": 31,
          "atk_scale": 0.14,
          "projectile_range": 2,
          "interval": 1,
          "move_speed": -0.6,
          "heavy_atk_scale": 1.2,
          "value": 3
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_hbound_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_hbound_1",
          "iconId": "skchr_hbound_1",
          "name": "触礁",
          "level": 4,
          "desc": "投掷一个炼金单元，在8秒内使落点周围的地面敌人移动速度-30%，每秒受到相当于攻击力40%的法术伤害\n可充能1次",
          "descRaw": "投掷一个炼金单元，在8秒内使落点周围的地面敌人移动速度-30%，每秒受到相当于攻击力40%的法术伤害\n可充能1次",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": -1,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 19,
          "initSp": 4,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "projectile_delay_time": 8,
            "atk_scale": 0.4,
            "projectile_range": 1.5,
            "interval": 1,
            "move_speed": -0.3
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_hbound_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_hbound_2",
          "iconId": "skchr_hbound_2",
          "name": "座浅",
          "level": 4,
          "desc": "投掷一个炼金单元，在31秒内使落点周围的地面敌人每秒受到相当于攻击力14%的法术伤害；重量大于等于3的敌人移动速度-60%，每秒额外受到相当于攻击力120%的法术伤害",
          "descRaw": "投掷一个炼金单元，在31秒内使落点周围的地面敌人每秒受到相当于攻击力14%的法术伤害；重量大于等于3的敌人移动速度-60%，每秒额外受到相当于攻击力120%的法术伤害",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": -1,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 57,
          "initSp": 26,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "projectile_delay_time": 31,
            "atk_scale": 0.14,
            "projectile_range": 2,
            "interval": 1,
            "move_speed": -0.6,
            "heavy_atk_scale": 1.2,
            "value": 3
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_hbound_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_4232_hbound",
        "portrait": "char_4232_hbound_1",
        "spine": "char_4232_hbound",
        "skillIcon": "skchr_hbound_2",
        "subProfIcon": "sub_alchemist_icon"
      },
      "expansionBatch": "iberia-expansion-v1"
    },
    "chess_iberia_hbound_b": {
      "chessId": "chess_iberia_hbound_b",
      "baseId": "chess_iberia_hbound_a",
      "goldenId": "chess_iberia_hbound_b",
      "isGolden": true,
      "tier": 4,
      "identifier": 16007,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1604,
      "charId": "char_4232_hbound",
      "name": "旅骨",
      "appellation": "Homebound",
      "rarity": "TIER_5",
      "profession": "SPECIAL",
      "subProfessionId": "alchemist",
      "subProfessionName": "alchemist",
      "position": "RANGED",
      "nationId": "iberia",
      "teamId": null,
      "bonds": [
        "iberiaShip",
        "swiftShip"
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
        "maxHp": 1198,
        "atk": 459,
        "def": 96,
        "res": 30,
        "cost": 19,
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
        "maxHp": 1098,
        "atk": 439,
        "def": 96,
        "res": 30,
        "cost": 19,
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
      "rangeId": "3-5",
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
        "desc": "可以投掷炼金单元协助作战",
        "descRaw": "可以投掷炼金单元协助作战",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null,
        "moduleDesc": "场上存在炼金单元时，技力自然恢复速度+0.1/秒"
      },
      "traitBase": {
        "desc": "可以投掷炼金单元协助作战",
        "descRaw": "可以投掷炼金单元协助作战",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "潜水作业",
          "desc": "使自身炼金单元影响范围内地面敌人的物理和法术命中率-9%；若敌人重量大于等于3，改为物理和法术命中率-13%",
          "descRaw": "使自身炼金单元影响范围内地面敌人的物理和法术命中率-9%；若敌人重量大于等于3，改为物理和法术命中率-13%",
          "bb": {
            "hitrate": -0.09,
            "heavy_hitrate": -0.13,
            "value": 3
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
            "sp_recovery_per_sec": 0.1
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
          "name": "潜水作业",
          "desc": "使自身炼金单元影响范围内地面敌人的物理和法术命中率-9%；若敌人重量大于等于3，改为物理和法术命中率-13%",
          "descRaw": "使自身炼金单元影响范围内地面敌人的物理和法术命中率-9%；若敌人重量大于等于3，改为物理和法术命中率-13%",
          "bb": {
            "hitrate": -0.09,
            "heavy_hitrate": -0.13,
            "value": 3
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
        "skillId": "skchr_hbound_2",
        "iconId": "skchr_hbound_2",
        "name": "座浅",
        "level": 7,
        "desc": "投掷一个炼金单元，在32秒内使落点周围的地面敌人每秒受到相当于攻击力17%的法术伤害；重量大于等于3的敌人移动速度-70%，每秒额外受到相当于攻击力150%的法术伤害",
        "descRaw": "投掷一个炼金单元，在32秒内使落点周围的地面敌人每秒受到相当于攻击力17%的法术伤害；重量大于等于3的敌人移动速度-70%，每秒额外受到相当于攻击力150%的法术伤害",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": -1,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 54,
        "initSp": 29,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "projectile_delay_time": 32,
          "atk_scale": 0.17,
          "projectile_range": 2,
          "interval": 1,
          "move_speed": -0.7,
          "heavy_atk_scale": 1.5,
          "value": 3
        },
        "bbStr": {},
        "rangeId": null,
        "rangeGrid": null,
        "prefabId": "skchr_hbound_2",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 1,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_hbound_1",
          "iconId": "skchr_hbound_1",
          "name": "触礁",
          "level": 7,
          "desc": "投掷一个炼金单元，在9秒内使落点周围的地面敌人移动速度-40%，每秒受到相当于攻击力60%的法术伤害\n可充能2次",
          "descRaw": "投掷一个炼金单元，在9秒内使落点周围的地面敌人移动速度-40%，每秒受到相当于攻击力60%的法术伤害\n可充能2次",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": -1,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 18,
          "initSp": 5,
          "maxChargeTime": 2,
          "increment": 1,
          "bb": {
            "projectile_delay_time": 9,
            "atk_scale": 0.6,
            "projectile_range": 1.5,
            "interval": 1,
            "move_speed": -0.4
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_hbound_1",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_hbound_2",
          "iconId": "skchr_hbound_2",
          "name": "座浅",
          "level": 7,
          "desc": "投掷一个炼金单元，在32秒内使落点周围的地面敌人每秒受到相当于攻击力17%的法术伤害；重量大于等于3的敌人移动速度-70%，每秒额外受到相当于攻击力150%的法术伤害",
          "descRaw": "投掷一个炼金单元，在32秒内使落点周围的地面敌人每秒受到相当于攻击力17%的法术伤害；重量大于等于3的敌人移动速度-70%，每秒额外受到相当于攻击力150%的法术伤害",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": -1,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 54,
          "initSp": 29,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "projectile_delay_time": 32,
            "atk_scale": 0.17,
            "projectile_range": 2,
            "interval": 1,
            "move_speed": -0.7,
            "heavy_atk_scale": 1.5,
            "value": 3
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_hbound_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": true
        }
      ],
      "module": {
        "id": "uniequip_002_hbound",
        "name": "看不见的大海",
        "type": "ALC-X",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_hbound",
          "name": "看不见的大海",
          "typeName": "ALC-X",
          "isDefault": true,
          "level": 1,
          "attr": {
            "maxHp": 100,
            "atk": 20
          },
          "traitOverride": {
            "desc": "可以投掷炼金单元协助作战",
            "descRaw": "可以投掷炼金单元协助作战",
            "bb": {},
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "场上存在炼金单元时，技力自然恢复速度+0.1/秒"
          },
          "talentChanges": [
            {
              "talentIndex": -1,
              "name": null,
              "desc": "",
              "bb": {
                "sp_recovery_per_sec": 0.1
              },
              "bbStr": {},
              "rangeGrid": null,
              "hidden": true
            }
          ]
        }
      ],
      "assets": {
        "avatar": "char_4232_hbound_2",
        "portrait": "char_4232_hbound_2",
        "spine": "char_4232_hbound",
        "skillIcon": "skchr_hbound_2",
        "subProfIcon": "sub_alchemist_icon"
      },
      "expansionBatch": "iberia-expansion-v1"
    },
    "chess_iberia_thorns_a": {
      "chessId": "chess_iberia_thorns_a",
      "baseId": "chess_iberia_thorns_a",
      "goldenId": "chess_iberia_thorns_b",
      "isGolden": false,
      "tier": 4,
      "identifier": 16008,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1604,
      "charId": "char_293_thorns",
      "name": "棘刺",
      "appellation": "Thorns",
      "rarity": "TIER_6",
      "profession": "WARRIOR",
      "subProfessionId": "lord",
      "subProfessionName": "领主",
      "position": "MELEE",
      "nationId": "iberia",
      "teamId": null,
      "bonds": [
        "iberiaShip",
        "skillfulShip"
      ],
      "garrisonIds": [],
      "price": 3,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_iberia_thorns_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 2063,
        "atk": 575,
        "def": 333,
        "res": 10,
        "cost": 20,
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
        "maxHp": 2063,
        "atk": 575,
        "def": 333,
        "res": 10,
        "cost": 20,
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
      "attackKind": "ranged",
      "projectile": "bolt",
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
          "name": "神经腐蚀",
          "desc": "攻击使目标中毒，在3秒内每秒受到125点法术伤害（对会远程攻击的目标伤害加倍）",
          "descRaw": "攻击使目标中毒，在3秒内每秒受到125点法术伤害（对会远程攻击的目标伤害加倍）",
          "bb": {
            "damage[normal]": 125,
            "damage[ranged]": 250,
            "duration": 3
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "故土潮声",
          "desc": "如果2秒内没有主动攻击过，每秒恢复最大生命3.5%的生命",
          "descRaw": "如果2秒内没有主动攻击过，每秒恢复最大生命3.5%的生命",
          "bb": {
            "delay": 2,
            "hp_recovery_per_sec_by_max_hp_ratio": 0.035
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
          "name": "神经腐蚀",
          "desc": "攻击使目标中毒，在3秒内每秒受到125点法术伤害（对会远程攻击的目标伤害加倍）",
          "descRaw": "攻击使目标中毒，在3秒内每秒受到125点法术伤害（对会远程攻击的目标伤害加倍）",
          "bb": {
            "damage[normal]": 125,
            "damage[ranged]": 250,
            "duration": 3
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "故土潮声",
          "desc": "如果2秒内没有主动攻击过，每秒恢复最大生命3.5%的生命",
          "descRaw": "如果2秒内没有主动攻击过，每秒恢复最大生命3.5%的生命",
          "bb": {
            "delay": 2,
            "hp_recovery_per_sec_by_max_hp_ratio": 0.035
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
        "skillId": "skchr_thorns_3",
        "iconId": "skchr_thorns_3",
        "name": "至高之术",
        "level": 4,
        "desc": "攻击范围扩大，攻击力+33%，攻击速度+14，远程攻击不再降低攻击力\n第二次及以后使用时能力加成变为最初的两倍，且持续时间无限",
        "descRaw": "攻击范围扩大，攻击力+33%，攻击速度+14，远程攻击不再降低攻击力\n第二次及以后使用时能力加成变为最初的两倍，且持续时间无限",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 30,
        "spType": "INCREASE_WHEN_ATTACK",
        "spCost": 15,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk": 0.33,
          "attack_speed": 14,
          "thorns_s_3[b].atk": 0.66,
          "thorns_s_3[b].attack_speed": 28,
          "thorns_s_3[b].duration": -1
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
        "prefabId": "skchr_thorns_3",
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
          "skillId": "skchr_thorns_2",
          "iconId": "skchr_thorns_2",
          "name": "护身尖刺",
          "level": 4,
          "desc": "停止攻击，攻击力+30%，防御力+55%，受到敌人普通攻击时释放尖刺对前方最多4名敌人进行一次远程攻击（每0.8秒最多触发一次）",
          "descRaw": "停止攻击，攻击力+30%，防御力+55%，受到敌人普通攻击时释放尖刺对前方最多4名敌人进行一次远程攻击（每0.8秒最多触发一次）",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 33,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 32,
          "initSp": 10,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.3,
            "def": 0.55,
            "cooldown": 0.8,
            "max_target": 4
          },
          "bbStr": {},
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
          "prefabId": "skchr_thorns_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false
        },
        {
          "skillId": "skchr_thorns_3",
          "iconId": "skchr_thorns_3",
          "name": "至高之术",
          "level": 4,
          "desc": "攻击范围扩大，攻击力+33%，攻击速度+14，远程攻击不再降低攻击力\n第二次及以后使用时能力加成变为最初的两倍，且持续时间无限",
          "descRaw": "攻击范围扩大，攻击力+33%，攻击速度+14，远程攻击不再降低攻击力\n第二次及以后使用时能力加成变为最初的两倍，且持续时间无限",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 30,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 15,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.33,
            "attack_speed": 14,
            "thorns_s_3[b].atk": 0.66,
            "thorns_s_3[b].attack_speed": 28,
            "thorns_s_3[b].duration": -1
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
          "prefabId": "skchr_thorns_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": true
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_293_thorns",
        "portrait": "char_293_thorns_1",
        "spine": "char_293_thorns",
        "skillIcon": "skchr_thorns_3",
        "subProfIcon": "sub_lord_icon"
      },
      "expansionBatch": "iberia-expansion-v1"
    },
    "chess_iberia_thorns_b": {
      "chessId": "chess_iberia_thorns_b",
      "baseId": "chess_iberia_thorns_a",
      "goldenId": "chess_iberia_thorns_b",
      "isGolden": true,
      "tier": 4,
      "identifier": 16008,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1604,
      "charId": "char_293_thorns",
      "name": "棘刺",
      "appellation": "Thorns",
      "rarity": "TIER_6",
      "profession": "WARRIOR",
      "subProfessionId": "lord",
      "subProfessionName": "领主",
      "position": "MELEE",
      "nationId": "iberia",
      "teamId": null,
      "bonds": [
        "iberiaShip",
        "skillfulShip"
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
        "maxHp": 2587,
        "atk": 704,
        "def": 379,
        "res": 10,
        "cost": 20,
        "blockCnt": 2,
        "bat": 1.3,
        "aspd": 105,
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
        "maxHp": 2427,
        "atk": 665,
        "def": 379,
        "res": 10,
        "cost": 20,
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
      "attackKind": "ranged",
      "projectile": "bolt",
      "canHitFly": true,
      "targetPriority": null,
      "trait": {
        "desc": "可以进行远程攻击，但此时攻击力降低至80%",
        "descRaw": "可以进行远程攻击，但此时攻击力降低至80%",
        "bb": {
          "atk_scale": 0.8,
          "atk_scale_m": 0.1
        },
        "bbStr": {},
        "rangeGrid": null,
        "moduleDesc": "攻击附带10%攻击力的法术伤害"
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
          "name": "神经腐蚀",
          "desc": "攻击使目标中毒，在3秒内每秒受到125点法术伤害（对会远程攻击的目标伤害加倍）",
          "descRaw": "攻击使目标中毒，在3秒内每秒受到125点法术伤害（对会远程攻击的目标伤害加倍）",
          "bb": {
            "damage[normal]": 125,
            "damage[ranged]": 250,
            "duration": 3
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "故土潮声",
          "desc": "如果2秒内没有主动攻击过，每秒恢复最大生命3.5%的生命",
          "descRaw": "如果2秒内没有主动攻击过，每秒恢复最大生命3.5%的生命",
          "bb": {
            "delay": 2,
            "hp_recovery_per_sec_by_max_hp_ratio": 0.035
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
          "name": "神经腐蚀",
          "desc": "攻击使目标中毒，在3秒内每秒受到125点法术伤害（对会远程攻击的目标伤害加倍）",
          "descRaw": "攻击使目标中毒，在3秒内每秒受到125点法术伤害（对会远程攻击的目标伤害加倍）",
          "bb": {
            "damage[normal]": 125,
            "damage[ranged]": 250,
            "duration": 3
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "故土潮声",
          "desc": "如果2秒内没有主动攻击过，每秒恢复最大生命3.5%的生命",
          "descRaw": "如果2秒内没有主动攻击过，每秒恢复最大生命3.5%的生命",
          "bb": {
            "delay": 2,
            "hp_recovery_per_sec_by_max_hp_ratio": 0.035
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
        "skillId": "skchr_thorns_3",
        "iconId": "skchr_thorns_3",
        "name": "至高之术",
        "level": 7,
        "desc": "攻击范围扩大，攻击力+40%，攻击速度+16，远程攻击不再降低攻击力\n第二次及以后使用时能力加成变为最初的两倍，且持续时间无限",
        "descRaw": "攻击范围扩大，攻击力+40%，攻击速度+16，远程攻击不再降低攻击力\n第二次及以后使用时能力加成变为最初的两倍，且持续时间无限",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 30,
        "spType": "INCREASE_WHEN_ATTACK",
        "spCost": 15,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk": 0.4,
          "attack_speed": 16,
          "thorns_s_3[b].atk": 0.8,
          "thorns_s_3[b].attack_speed": 32,
          "thorns_s_3[b].duration": -1
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
        "prefabId": "skchr_thorns_3",
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
          "skillId": "skchr_thorns_2",
          "iconId": "skchr_thorns_2",
          "name": "护身尖刺",
          "level": 7,
          "desc": "停止攻击，攻击力+40%，防御力+70%，受到敌人普通攻击时释放尖刺对前方最多4名敌人进行一次远程攻击（每0.75秒最多触发一次）",
          "descRaw": "停止攻击，攻击力+40%，防御力+70%，受到敌人普通攻击时释放尖刺对前方最多4名敌人进行一次远程攻击（每0.75秒最多触发一次）",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 36,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 29,
          "initSp": 10,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.4,
            "def": 0.7,
            "cooldown": 0.75,
            "max_target": 4
          },
          "bbStr": {},
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
          "prefabId": "skchr_thorns_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false
        },
        {
          "skillId": "skchr_thorns_3",
          "iconId": "skchr_thorns_3",
          "name": "至高之术",
          "level": 7,
          "desc": "攻击范围扩大，攻击力+40%，攻击速度+16，远程攻击不再降低攻击力\n第二次及以后使用时能力加成变为最初的两倍，且持续时间无限",
          "descRaw": "攻击范围扩大，攻击力+40%，攻击速度+16，远程攻击不再降低攻击力\n第二次及以后使用时能力加成变为最初的两倍，且持续时间无限",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 30,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 15,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk": 0.4,
            "attack_speed": 16,
            "thorns_s_3[b].atk": 0.8,
            "thorns_s_3[b].attack_speed": 32,
            "thorns_s_3[b].duration": -1
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
          "prefabId": "skchr_thorns_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": true
        }
      ],
      "module": {
        "id": "uniequip_002_thorns",
        "name": "“盐与沙”",
        "type": "LOR-X",
        "level": 1,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_thorns",
          "name": "“盐与沙”",
          "typeName": "LOR-X",
          "isDefault": true,
          "level": 1,
          "attr": {
            "maxHp": 160,
            "atk": 39,
            "aspd": 5
          },
          "traitOverride": {
            "desc": "可以进行远程攻击，但此时攻击力降低至80%",
            "descRaw": "可以进行远程攻击，但此时攻击力降低至80%",
            "bb": {
              "atk_scale": 0.8,
              "atk_scale_m": 0.1
            },
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "攻击附带10%攻击力的法术伤害"
          },
          "talentChanges": []
        },
        {
          "uniEquipId": "uniequip_003_thorns",
          "name": "沙蚀",
          "typeName": "LOR-D",
          "isDefault": false,
          "level": 1,
          "attr": {
            "maxHp": 80,
            "atk": 60,
            "aspd": 5
          },
          "traitOverride": {
            "desc": "可以进行远程攻击，但此时攻击力降低至80%",
            "descRaw": "可以进行远程攻击，但此时攻击力降低至80%",
            "bb": {
              "atk_scale": 0.8,
              "ep_damage_ratio": 0.1
            },
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "造成伤害时附带相当于10%伤害的神经损伤"
          },
          "talentChanges": [
            {
              "talentIndex": -1,
              "name": null,
              "desc": "",
              "bb": {
                "ep_damage_ratio": 0.1
              },
              "bbStr": {},
              "rangeGrid": null,
              "hidden": true
            }
          ]
        }
      ],
      "assets": {
        "avatar": "char_293_thorns_2",
        "portrait": "char_293_thorns_2",
        "spine": "char_293_thorns",
        "skillIcon": "skchr_thorns_3",
        "subProfIcon": "sub_lord_icon"
      },
      "expansionBatch": "iberia-expansion-v1"
    },
    "chess_iberia_irene_a": {
      "chessId": "chess_iberia_irene_a",
      "baseId": "chess_iberia_irene_a",
      "goldenId": "chess_iberia_irene_b",
      "isGolden": false,
      "tier": 6,
      "identifier": 16009,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1606,
      "charId": "char_4009_irene",
      "name": "艾丽妮",
      "appellation": "Irene",
      "rarity": "TIER_6",
      "profession": "WARRIOR",
      "subProfessionId": "sword",
      "subProfessionName": "sword",
      "position": "MELEE",
      "nationId": "iberia",
      "teamId": null,
      "bonds": [
        "iberiaShip",
        "swiftShip"
      ],
      "garrisonIds": [],
      "price": 4,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_iberia_irene_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0
      },
      "stats": {
        "maxHp": 2201,
        "atk": 484,
        "def": 282,
        "res": 0,
        "cost": 23,
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
        "maxHp": 2201,
        "atk": 484,
        "def": 282,
        "res": 0,
        "cost": 23,
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
        "desc": "普通攻击连续造成两次伤害",
        "descRaw": "普通攻击连续造成两次伤害",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "traitBase": {
        "desc": "普通攻击连续造成两次伤害",
        "descRaw": "普通攻击连续造成两次伤害",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "审判之火",
          "desc": "对敌人造成物理伤害时有50%概率无视其50%防御力，对空中单位概率提升至100%",
          "descRaw": "对敌人造成物理伤害时有50%概率无视其50%防御力，对空中单位概率提升至100%",
          "bb": {
            "prob": 0.5,
            "def_penetrate": 0.5
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "净化之剑",
          "desc": "攻击速度+18，场上有【海怪】敌人时效果翻倍",
          "descRaw": "攻击速度+18，场上有【海怪】敌人时效果翻倍",
          "bb": {
            "attack_speed": 18,
            "atk": 0
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
          "name": "审判之火",
          "desc": "对敌人造成物理伤害时有50%概率无视其50%防御力，对空中单位概率提升至100%",
          "descRaw": "对敌人造成物理伤害时有50%概率无视其50%防御力，对空中单位概率提升至100%",
          "bb": {
            "prob": 0.5,
            "def_penetrate": 0.5
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "净化之剑",
          "desc": "攻击速度+18，场上有【海怪】敌人时效果翻倍",
          "descRaw": "攻击速度+18，场上有【海怪】敌人时效果翻倍",
          "bb": {
            "attack_speed": 18,
            "atk": 0
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
        "skillId": "skchr_irene_3",
        "iconId": "skchr_irene_3",
        "name": "判决",
        "level": 4,
        "desc": "对周围所有地面敌人造成相当于攻击力250%的物理伤害并使其浮空2秒，然后快速轰击10次，每次对随机目标周围小范围内所有敌人造成相当于攻击力200%的物理伤害",
        "descRaw": "对周围所有地面敌人造成相当于攻击力250%的物理伤害并使其浮空2秒，然后快速轰击10次，每次对随机目标周围小范围内所有敌人造成相当于攻击力200%的物理伤害",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 0,
        "spType": "INCREASE_WHEN_ATTACK",
        "spCost": 32,
        "initSp": 8,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk_scale": 2.5,
          "levitate": 2,
          "multi_atk_scale": 2,
          "multi_times": 10,
          "multi_hit_interval": 0.3
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
        "prefabId": "skchr_irene_3",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 2,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_irene_1",
          "iconId": "skchr_irene_1",
          "name": "起风",
          "level": 4,
          "desc": "下一次攻击对目标造成相当于攻击力130%的物理伤害并使其浮空1秒，再对其追加一次相当于攻击力130%的物理伤害",
          "descRaw": "下一次攻击对目标造成相当于攻击力130%的物理伤害并使其浮空1秒，再对其追加一次相当于攻击力130%的物理伤害",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 6,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 1.3,
            "levitate": 1
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_irene_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_irene_2",
          "iconId": "skchr_irene_2",
          "name": "裂潮",
          "level": 4,
          "desc": "对前方范围内最多5名地面敌人造成相当于攻击力310%的物理伤害并使其中重量小于等于3的目标浮空2秒\n可充能2次",
          "descRaw": "对前方范围内最多5名地面敌人造成相当于攻击力310%的物理伤害并使其中重量小于等于3的目标浮空2秒\n可充能2次",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 11,
          "initSp": 0,
          "maxChargeTime": 2,
          "increment": 1,
          "bb": {
            "atk_scale": 3.1,
            "levitate": 2,
            "max_target": 5,
            "value": 3
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
          "prefabId": "skchr_irene_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false
        },
        {
          "skillId": "skchr_irene_3",
          "iconId": "skchr_irene_3",
          "name": "判决",
          "level": 4,
          "desc": "对周围所有地面敌人造成相当于攻击力250%的物理伤害并使其浮空2秒，然后快速轰击10次，每次对随机目标周围小范围内所有敌人造成相当于攻击力200%的物理伤害",
          "descRaw": "对周围所有地面敌人造成相当于攻击力250%的物理伤害并使其浮空2秒，然后快速轰击10次，每次对随机目标周围小范围内所有敌人造成相当于攻击力200%的物理伤害",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 32,
          "initSp": 8,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 2.5,
            "levitate": 2,
            "multi_atk_scale": 2,
            "multi_times": 10,
            "multi_hit_interval": 0.3
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
          "prefabId": "skchr_irene_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": true
        }
      ],
      "module": null,
      "assets": {
        "avatar": "char_4009_irene",
        "portrait": "char_4009_irene_1",
        "spine": "char_4009_irene",
        "skillIcon": "skchr_irene_3",
        "subProfIcon": "sub_sword_icon"
      },
      "expansionBatch": "iberia-expansion-v1"
    },
    "chess_iberia_irene_b": {
      "chessId": "chess_iberia_irene_b",
      "baseId": "chess_iberia_irene_a",
      "goldenId": "chess_iberia_irene_b",
      "isGolden": true,
      "tier": 6,
      "identifier": 16009,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1606,
      "charId": "char_4009_irene",
      "name": "艾丽妮",
      "appellation": "Irene",
      "rarity": "TIER_6",
      "profession": "WARRIOR",
      "subProfessionId": "sword",
      "subProfessionName": "sword",
      "position": "MELEE",
      "nationId": "iberia",
      "teamId": null,
      "bonds": [
        "iberiaShip",
        "swiftShip"
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
        "maxHp": 2688,
        "atk": 640,
        "def": 376,
        "res": 0,
        "cost": 23,
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
        "maxHp": 2688,
        "atk": 575,
        "def": 326,
        "res": 0,
        "cost": 23,
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
        "desc": "普通攻击连续造成两次伤害",
        "descRaw": "普通攻击连续造成两次伤害",
        "bb": {
          "def_penetrate_fixed": 70
        },
        "bbStr": {},
        "rangeGrid": null,
        "moduleDesc": "攻击时无视敌人70点的防御力"
      },
      "traitBase": {
        "desc": "普通攻击连续造成两次伤害",
        "descRaw": "普通攻击连续造成两次伤害",
        "bb": {},
        "bbStr": {},
        "rangeGrid": null
      },
      "talents": [
        {
          "index": 0,
          "name": "审判之火",
          "desc": "对敌人造成物理伤害时有50%概率无视其50%防御力，对空中单位概率提升至100%",
          "descRaw": "对敌人造成物理伤害时有50%概率无视其50%防御力，对空中单位概率提升至100%",
          "bb": {
            "prob": 0.5,
            "def_penetrate": 0.5
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "净化之剑",
          "desc": "攻击速度+18，场上有【海怪】敌人时效果翻倍",
          "descRaw": "攻击速度+18，场上有【海怪】敌人时效果翻倍",
          "bb": {
            "attack_speed": 18,
            "atk": 0
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "talentIndex": 1,
          "name": "净化之剑",
          "desc": "攻击速度+18，攻击力+5%，场上有【海怪】敌人时效果翻倍",
          "bb": {
            "attack_speed": 18,
            "atk": 0.05
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
          "name": "审判之火",
          "desc": "对敌人造成物理伤害时有50%概率无视其50%防御力，对空中单位概率提升至100%",
          "descRaw": "对敌人造成物理伤害时有50%概率无视其50%防御力，对空中单位概率提升至100%",
          "bb": {
            "prob": 0.5,
            "def_penetrate": 0.5
          },
          "bbStr": {},
          "rangeGrid": null,
          "hidden": false,
          "tokenKey": null,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "净化之剑",
          "desc": "攻击速度+18，场上有【海怪】敌人时效果翻倍",
          "descRaw": "攻击速度+18，场上有【海怪】敌人时效果翻倍",
          "bb": {
            "attack_speed": 18,
            "atk": 0
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
        "skillId": "skchr_irene_3",
        "iconId": "skchr_irene_3",
        "name": "判决",
        "level": 7,
        "desc": "对周围所有地面敌人造成相当于攻击力250%的物理伤害并使其浮空3秒，然后快速轰击10次，每次对随机目标周围小范围内所有敌人造成相当于攻击力230%的物理伤害",
        "descRaw": "对周围所有地面敌人造成相当于攻击力250%的物理伤害并使其浮空3秒，然后快速轰击10次，每次对随机目标周围小范围内所有敌人造成相当于攻击力230%的物理伤害",
        "skillType": "MANUAL",
        "durationType": "NONE",
        "duration": 0,
        "spType": "INCREASE_WHEN_ATTACK",
        "spCost": 30,
        "initSp": 16,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "atk_scale": 2.5,
          "levitate": 3,
          "multi_atk_scale": 2.3,
          "multi_times": 10,
          "multi_hit_interval": 0.3
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
        "prefabId": "skchr_irene_3",
        "trigger": {
          "rule": "DEFAULT"
        },
        "index": 2,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_irene_1",
          "iconId": "skchr_irene_1",
          "name": "起风",
          "level": 7,
          "desc": "下一次攻击对目标造成相当于攻击力160%的物理伤害并使其浮空1秒，再对其追加一次相当于攻击力160%的物理伤害",
          "descRaw": "下一次攻击对目标造成相当于攻击力160%的物理伤害并使其浮空1秒，再对其追加一次相当于攻击力160%的物理伤害",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 5,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 1.6,
            "levitate": 1
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_irene_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_irene_2",
          "iconId": "skchr_irene_2",
          "name": "裂潮",
          "level": 7,
          "desc": "对前方范围内最多6名地面敌人造成相当于攻击力340%的物理伤害并使其中重量小于等于3的目标浮空3秒\n可充能2次",
          "descRaw": "对前方范围内最多6名地面敌人造成相当于攻击力340%的物理伤害并使其中重量小于等于3的目标浮空3秒\n可充能2次",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 10,
          "initSp": 0,
          "maxChargeTime": 2,
          "increment": 1,
          "bb": {
            "atk_scale": 3.4,
            "levitate": 3,
            "max_target": 6,
            "value": 3
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
          "prefabId": "skchr_irene_2",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 1,
          "isDefault": false
        },
        {
          "skillId": "skchr_irene_3",
          "iconId": "skchr_irene_3",
          "name": "判决",
          "level": 7,
          "desc": "对周围所有地面敌人造成相当于攻击力250%的物理伤害并使其浮空3秒，然后快速轰击10次，每次对随机目标周围小范围内所有敌人造成相当于攻击力230%的物理伤害",
          "descRaw": "对周围所有地面敌人造成相当于攻击力250%的物理伤害并使其浮空3秒，然后快速轰击10次，每次对随机目标周围小范围内所有敌人造成相当于攻击力230%的物理伤害",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 30,
          "initSp": 16,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 2.5,
            "levitate": 3,
            "multi_atk_scale": 2.3,
            "multi_times": 10,
            "multi_hit_interval": 0.3
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
          "prefabId": "skchr_irene_3",
          "trigger": {
            "rule": "DEFAULT"
          },
          "index": 2,
          "isDefault": true
        }
      ],
      "module": {
        "id": "uniequip_002_irene",
        "name": "厚重的经卷",
        "type": "SWO-Y",
        "level": 3,
        "active": true
      },
      "modules": [
        {
          "uniEquipId": "uniequip_002_irene",
          "name": "厚重的经卷",
          "typeName": "SWO-Y",
          "isDefault": true,
          "level": 3,
          "attr": {
            "atk": 65,
            "def": 50
          },
          "traitOverride": {
            "desc": "普通攻击连续造成两次伤害",
            "descRaw": "普通攻击连续造成两次伤害",
            "bb": {
              "def_penetrate_fixed": 70
            },
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "攻击时无视敌人70点的防御力"
          },
          "talentChanges": [
            {
              "talentIndex": 1,
              "name": "净化之剑",
              "desc": "攻击速度+18，攻击力+5%，场上有【海怪】敌人时效果翻倍",
              "bb": {
                "attack_speed": 18,
                "atk": 0.05
              },
              "bbStr": {},
              "rangeGrid": null,
              "hidden": false
            }
          ]
        },
        {
          "uniEquipId": "uniequip_003_irene",
          "name": "审判官口粮",
          "typeName": "SWO-X",
          "isDefault": false,
          "level": 3,
          "attr": {
            "atk": 80,
            "aspd": 7
          },
          "traitOverride": {
            "desc": "普通攻击连续造成两次伤害",
            "descRaw": "普通攻击连续造成两次伤害",
            "bb": {
              "damage_scale": 1.1,
              "value": 0.1
            },
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "技能造成的伤害提升10%"
          },
          "talentChanges": [
            {
              "talentIndex": 0,
              "name": "审判之火",
              "desc": "对敌人造成物理伤害时有50%概率无视其55%防御力，对空中单位概率提升至100%，技能期间若击倒空中单位，技能结束时获得6点技力",
              "bb": {
                "prob": 0.5,
                "def_penetrate": 0.55,
                "sp": 6
              },
              "bbStr": {},
              "rangeGrid": null,
              "hidden": false
            }
          ]
        },
        {
          "uniEquipId": "uniequip_004_irene",
          "name": "艾丽妮特限证章",
          "typeName": "ISW-A",
          "isDefault": false,
          "level": 3,
          "attr": {
            "maxHp": 300,
            "atk": 65
          },
          "traitOverride": {
            "desc": "普通攻击连续造成两次伤害",
            "descRaw": "普通攻击连续造成两次伤害",
            "bb": {},
            "bbStr": {},
            "rangeGrid": null,
            "moduleDesc": "在集成战略中，再部署时间-60%，部署后立即获得8点技力"
          },
          "talentChanges": [
            {
              "talentIndex": 0,
              "name": "审判之火",
              "desc": "对敌人造成物理伤害时有50%概率无视其50%防御力，对空中单位概率提升至100%；\n在集成战略中，技能范围内空中敌人受到的物理伤害提升140%，此范围内部署其他干员时，使其中的地面敌人浮空3秒；自身撤退时此范围内效果持续生效，范围内敌人结束浮空状态时，若满足部署条件，待部署区的艾丽妮立即部署至原位置开启技能（不消耗费用）",
              "bb": {
                "prob": 0.5,
                "def_penetrate": 0.5
              },
              "bbStr": {},
              "rangeGrid": null,
              "hidden": false
            },
            {
              "talentIndex": -1,
              "name": null,
              "desc": "",
              "bb": {
                "sp": 8,
                "respawn_time": 0.4,
                "skill@talent_range_flag": 1
              },
              "bbStr": {},
              "rangeGrid": null,
              "hidden": true
            },
            {
              "talentIndex": 0,
              "name": null,
              "desc": "",
              "bb": {
                "prob": 0.5,
                "def_penetrate": 0.5
              },
              "bbStr": {},
              "rangeGrid": null,
              "hidden": false
            },
            {
              "talentIndex": -1,
              "name": null,
              "desc": "",
              "bb": {
                "skill@talent_range_flag": 1,
                "damage_scale": 2.4,
                "levitate_duration": 3
              },
              "bbStr": {},
              "rangeGrid": null,
              "hidden": true
            }
          ]
        }
      ],
      "assets": {
        "avatar": "char_4009_irene_2",
        "portrait": "char_4009_irene_2",
        "spine": "char_4009_irene",
        "skillIcon": "skchr_irene_3",
        "subProfIcon": "sub_sword_icon"
      },
      "expansionBatch": "iberia-expansion-v1"
    }
  },
  "garrisons": {},
  "tokens": {
    "token_10067_toledo_tldptm": {
      "tokenId": "token_10067_toledo_tldptm",
      "kind": "summon",
      "name": "征服者传说",
      "desc": "能够阻挡三个敌人",
      "descRaw": "能够阻挡三个敌人",
      "profession": "TOKEN",
      "subProfessionId": "notchar1",
      "position": "MELEE",
      "placeable": false,
      "owners": [
        "chess_iberia_toledo_a",
        "chess_iberia_toledo_b"
      ],
      "stats": {
        "maxHp": 6000,
        "atk": 82,
        "def": 450,
        "res": 20,
        "cost": 0,
        "blockCnt": 3,
        "bat": 1,
        "aspd": 100,
        "respawnTime": 0,
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
      "dmgType": "none",
      "attackKind": "melee",
      "canHitFly": false,
      "deployLimit": 1,
      "count": 1,
      "variants": {
        "chess_iberia_toledo_a": {
          "phase": 2,
          "level": 1,
          "stats": {
            "maxHp": 6000,
            "atk": 82,
            "def": 450,
            "res": 20,
            "cost": 0,
            "blockCnt": 3,
            "bat": 1,
            "aspd": 100,
            "respawnTime": 0,
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
          "trait": {
            "desc": "能够阻挡三个敌人",
            "descRaw": "能够阻挡三个敌人",
            "bb": {},
            "bbStr": {}
          },
          "dmgType": "none",
          "attackKind": "melee",
          "canHitFly": false,
          "count": 1,
          "sources": [
            "skill"
          ],
          "talents": [],
          "skill": null
        },
        "chess_iberia_toledo_b": {
          "phase": 2,
          "level": 60,
          "stats": {
            "maxHp": 6000,
            "atk": 95,
            "def": 487,
            "res": 20,
            "cost": 0,
            "blockCnt": 3,
            "bat": 1,
            "aspd": 100,
            "respawnTime": 0,
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
          "trait": {
            "desc": "能够阻挡三个敌人",
            "descRaw": "能够阻挡三个敌人",
            "bb": {},
            "bbStr": {}
          },
          "dmgType": "none",
          "attackKind": "melee",
          "canHitFly": false,
          "count": 1,
          "sources": [
            "skill"
          ],
          "talents": [],
          "skill": null
        }
      },
      "assets": {
        "avatar": "token_10067_toledo_tldptm",
        "spine": "token_10067_toledo_tldptm"
      }
    },
    "token_iberia_lighthouse": {
      "tokenId": "token_iberia_lighthouse",
      "name": "灯塔",
      "kind": "summon",
      "position": "ALL",
      "placeable": true,
      "deployLimit": 1,
      "owners": [],
      "desc": "场上伊比利亚盟约人数达到9时获得一座，低于9时消失。占用部署格，不占在场人口，无召唤者，不攻击或阻挡，不受攻击。技能消耗12技力，为自身周围3×3格内的本人伊比利亚干员各赋予1次伤害抵挡，同来源不叠加。基础每秒回复1技力；周围3×3格有敌人时每秒额外回复1技力。可接受伊比利亚点灯的技力回复。",
      "attackKind": "none",
      "dmgType": "none",
      "untargetable": true,
      "abnormal": [
        "healFree",
        "isolated"
      ],
      "rangeGrid": [
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
        ]
      ],
      "stats": {
        "maxHp": 1,
        "atk": 0,
        "def": 0,
        "res": 0,
        "blockCnt": 0,
        "cost": 0,
        "respawnTime": 0,
        "interval": 1,
        "spRecovery": 1
      },
      "skill": {
        "skillId": "iberia_lighthouse_ward",
        "name": "守望之光",
        "desc": "消耗12技力，为自身周围3×3格的本人伊比利亚干员各赋予1次次数盾，同来源不叠加。基础每秒1技力；范围内有敌人时每秒额外1技力；可接受点灯技力。",
        "level": 1,
        "skillType": "AUTO",
        "spType": "INCREASE_WITH_TIME",
        "spCost": 12,
        "initSp": 0,
        "maxChargeTime": 1,
        "increment": 1,
        "duration": 0,
        "bb": {},
        "trigger": {
          "rule": "NEVER"
        }
      },
      "assets": {
        "avatar": "token_iberia_lighthouse",
        "spine": "token_iberia_lighthouse"
      }
    }
  },
  "oldMembers": [
    {
      "ids": [
        "chess_char_1_17_a",
        "chess_char_1_17_b"
      ],
      "bonds": [
        "iberiaShip"
      ]
    },
    {
      "ids": [
        "chess_char_5_15_a",
        "chess_char_5_15_b"
      ],
      "bonds": [
        "iberiaShip"
      ]
    },
    {
      "ids": [
        "chess_char_6_14_a",
        "chess_char_6_14_b"
      ],
      "bonds": [
        "iberiaShip"
      ]
    }
  ]
};
