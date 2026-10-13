// Generated from original GameData e8588a82074bf695aa3849959037dd2de7e6e5cf.
export const CLEMNT_OVERLAY={
  "id": "arknights-expansion-v1",
  "chess": {
    "chess_exp_clemnt_a": {
      "chessId": "chess_exp_clemnt_a",
      "baseId": "chess_exp_clemnt_a",
      "goldenId": "chess_exp_clemnt_b",
      "isGolden": false,
      "tier": 6,
      "identifier": 12001,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1206,
      "charId": "char_4231_clemnt",
      "name": "克莱门莎",
      "appellation": "Clementia",
      "rarity": "TIER_6",
      "profession": "WARRIOR",
      "subProfessionId": "primguard",
      "subProfessionName": "本源近卫",
      "position": "MELEE",
      "nationId": "egir",
      "bonds": [
        "egirShip",
        "swiftShip"
      ],
      "garrisonIds": [
        "exp_clemnt_growth_a"
      ],
      "price": 4,
      "sellPrice": 1,
      "upgradeNum": 3,
      "upgradeChessId": "chess_exp_clemnt_b",
      "status": {
        "phase": 2,
        "level": 1,
        "skillLevel": 4,
        "equipLevel": 0,
        "eliteIconId": "char_elite_base_2"
      },
      "stats": {
        "maxHp": 2040,
        "atk": 763,
        "def": 315,
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
        "maxHp": 2040,
        "atk": 763,
        "def": 315,
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
      "dmgType": "phys",
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
          "name": "生死定夺",
          "desc": "造成物理伤害时有25%概率攻击力提升至135%，目标防御力低于初始值时概率提升至50%",
          "descRaw": "造成物理伤害时有25%概率攻击力提升至135%，目标防御力低于初始值时概率提升至50%",
          "bb": {
            "t1_atk_scale": 1.35,
            "prob_normal": 0.25,
            "prob_special": 0.5
          },
          "bbStr": {},
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "习得性防御",
          "desc": "受到来自自身前方单位造成的物理和法术伤害降低30%，若伤害来源为【海怪】，则降低50%",
          "descRaw": "受到来自自身前方单位造成的物理和法术伤害降低30%，若伤害来源为【海怪】，则降低50%",
          "bb": {
            "damage_resistance_normal": 0.3,
            "damage_resistance_seamonster": 0.5,
            "tag": 0
          },
          "bbStr": {
            "tag": "seamonster"
          },
          "hidden": false,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "生死定夺",
          "desc": "造成物理伤害时有25%概率攻击力提升至135%，目标防御力低于初始值时概率提升至50%",
          "descRaw": "造成物理伤害时有25%概率攻击力提升至135%，目标防御力低于初始值时概率提升至50%",
          "bb": {
            "t1_atk_scale": 1.35,
            "prob_normal": 0.25,
            "prob_special": 0.5
          },
          "bbStr": {},
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "习得性防御",
          "desc": "受到来自自身前方单位造成的物理和法术伤害降低30%，若伤害来源为【海怪】，则降低50%",
          "descRaw": "受到来自自身前方单位造成的物理和法术伤害降低30%，若伤害来源为【海怪】，则降低50%",
          "bb": {
            "damage_resistance_normal": 0.3,
            "damage_resistance_seamonster": 0.5,
            "tag": 0
          },
          "bbStr": {
            "tag": "seamonster"
          },
          "hidden": false,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_clemnt_3",
        "iconId": "skchr_clemnt_3",
        "name": "与海为敌",
        "level": 4,
        "desc": "攻击范围扩大，攻击目标数+2，每次攻击对目标造成相当于攻击力180%的物理伤害并额外造成相当于物理伤害20%的侵蚀损伤；当全场有敌人侵蚀损伤爆发时，消耗1发弹药对目标所在位置及其周围四格内所有地面敌人造成3次相当于攻击力250%的物理伤害与相当于攻击力180%的元素伤害\n技能装有10发弹药，打完后结束（可随时停止技能）",
        "descRaw": "攻击范围扩大，攻击目标数+2，每次攻击对目标造成相当于攻击力180%的物理伤害并额外造成相当于物理伤害20%的侵蚀损伤；当全场有敌人侵蚀损伤爆发时，消耗1发弹药对目标所在位置及其周围四格内所有地面敌人造成3次相当于攻击力250%的物理伤害与相当于攻击力180%的元素伤害\n技能装有10发弹药，打完后结束（可随时停止技能）",
        "skillType": "MANUAL",
        "durationType": "AMMO",
        "duration": 0,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 58,
        "initSp": 27,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "attack@max_target": 3,
          "attack@atk_scale": 1.8,
          "attack@ep_damage_ratio": 0.2,
          "attack@ep_break_duration": 1,
          "projectile_life_time": 5,
          "s3_atk_scale": 2.5,
          "ep_damage_scale": 1.8,
          "trigger_time": 10,
          "audio_trigger_cnt": 3,
          "ep_break_duration": 1
        },
        "bbStr": {},
        "rangeId": "3-2",
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
          ]
        ],
        "prefabId": "skchr_clemnt_3",
        "trigger": {
          "rule": "SKILL_RANGE"
        },
        "index": 2,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_clemnt_1",
          "iconId": "skchr_clemnt_1",
          "name": "冲蚀",
          "level": 4,
          "desc": "下次攻击的攻击力提高至205%并造成相当于物理伤害25%的侵蚀损伤",
          "descRaw": "下次攻击的攻击力提高至205%并造成相当于物理伤害25%的侵蚀损伤",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 3,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 2.05,
            "ep_damage_ratio": 0.25
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_clemnt_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_clemnt_2",
          "iconId": "skchr_clemnt_2",
          "name": "风暴潮",
          "level": 4,
          "desc": "攻击范围扩大，攻击速度+100，每次攻击对目标及其周围最多5名地面敌人造成相当于攻击力220%的物理伤害；向前方召唤浮游放逐舱，放逐舱使周围累计不超过8重量的最多15名地面敌人不断向前移动；放逐舱在移动3格后消失并留下漩涡，处于漩涡的所有敌人移动速度-70%且每秒受到200点侵蚀损伤和相当于攻击力265%的物理伤害",
          "descRaw": "攻击范围扩大，攻击速度+100，每次攻击对目标及其周围最多5名地面敌人造成相当于攻击力220%的物理伤害；向前方召唤浮游放逐舱，放逐舱使周围累计不超过8重量的最多15名地面敌人不断向前移动；放逐舱在移动3格后消失并留下漩涡，处于漩涡的所有敌人移动速度-70%且每秒受到200点侵蚀损伤和相当于攻击力265%的物理伤害",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 16,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 22,
          "initSp": 9,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "attack_speed": 100,
            "attack@aoe_atk_scale": 2.2,
            "attack@max_passenger_mass": 8,
            "attack@max_passenger_cnt": 15,
            "attack@move_speed": -0.7,
            "attack@water_element": 200,
            "attack@physical_atk_scale": 2.65,
            "attack@max_target": 5
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
          "prefabId": "skchr_clemnt_2",
          "trigger": {
            "rule": "SKILL_RANGE"
          },
          "index": 1,
          "isDefault": false
        },
        {
          "skillId": "skchr_clemnt_3",
          "iconId": "skchr_clemnt_3",
          "name": "与海为敌",
          "level": 4,
          "desc": "攻击范围扩大，攻击目标数+2，每次攻击对目标造成相当于攻击力180%的物理伤害并额外造成相当于物理伤害20%的侵蚀损伤；当全场有敌人侵蚀损伤爆发时，消耗1发弹药对目标所在位置及其周围四格内所有地面敌人造成3次相当于攻击力250%的物理伤害与相当于攻击力180%的元素伤害\n技能装有10发弹药，打完后结束（可随时停止技能）",
          "descRaw": "攻击范围扩大，攻击目标数+2，每次攻击对目标造成相当于攻击力180%的物理伤害并额外造成相当于物理伤害20%的侵蚀损伤；当全场有敌人侵蚀损伤爆发时，消耗1发弹药对目标所在位置及其周围四格内所有地面敌人造成3次相当于攻击力250%的物理伤害与相当于攻击力180%的元素伤害\n技能装有10发弹药，打完后结束（可随时停止技能）",
          "skillType": "MANUAL",
          "durationType": "AMMO",
          "duration": 0,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 58,
          "initSp": 27,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "attack@max_target": 3,
            "attack@atk_scale": 1.8,
            "attack@ep_damage_ratio": 0.2,
            "attack@ep_break_duration": 1,
            "projectile_life_time": 5,
            "s3_atk_scale": 2.5,
            "ep_damage_scale": 1.8,
            "trigger_time": 10,
            "audio_trigger_cnt": 3,
            "ep_break_duration": 1
          },
          "bbStr": {},
          "rangeId": "3-2",
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
            ]
          ],
          "prefabId": "skchr_clemnt_3",
          "trigger": {
            "rule": "SKILL_RANGE"
          },
          "index": 2,
          "isDefault": true
        }
      ],
      "module": null,
      "modules": [],
      "assets": {
        "avatar": "char_4231_clemnt",
        "portrait": "char_4231_clemnt_1",
        "spine": "char_4231_clemnt",
        "skillIcon": "skchr_clemnt_3",
        "subProfIcon": "sub_primguard_icon"
      },
      "expansionBatch": "arknights-expansion-v1"
    },
    "chess_exp_clemnt_b": {
      "chessId": "chess_exp_clemnt_b",
      "baseId": "chess_exp_clemnt_a",
      "goldenId": "chess_exp_clemnt_b",
      "isGolden": true,
      "tier": 6,
      "identifier": 12001,
      "isHidden": false,
      "isDiy": false,
      "visible": true,
      "chessType": "NORMAL",
      "shopSortId": 1206,
      "charId": "char_4231_clemnt",
      "name": "克莱门莎",
      "appellation": "Clementia",
      "rarity": "TIER_6",
      "profession": "WARRIOR",
      "subProfessionId": "primguard",
      "subProfessionName": "本源近卫",
      "position": "MELEE",
      "nationId": "egir",
      "bonds": [
        "egirShip",
        "swiftShip"
      ],
      "garrisonIds": [
        "exp_clemnt_growth_b"
      ],
      "price": 4,
      "sellPrice": 4,
      "upgradeNum": 3,
      "upgradeChessId": null,
      "status": {
        "phase": 2,
        "level": 60,
        "skillLevel": 7,
        "equipLevel": 0,
        "eliteIconId": "char_elite_gold_2"
      },
      "stats": {
        "maxHp": 2491,
        "atk": 867,
        "def": 352,
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
        "maxHp": 2491,
        "atk": 867,
        "def": 352,
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
      "dmgType": "phys",
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
          "name": "生死定夺",
          "desc": "造成物理伤害时有25%概率攻击力提升至135%，目标防御力低于初始值时概率提升至50%",
          "descRaw": "造成物理伤害时有25%概率攻击力提升至135%，目标防御力低于初始值时概率提升至50%",
          "bb": {
            "t1_atk_scale": 1.35,
            "prob_normal": 0.25,
            "prob_special": 0.5
          },
          "bbStr": {},
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "习得性防御",
          "desc": "受到来自自身前方单位造成的物理和法术伤害降低30%，若伤害来源为【海怪】，则降低50%",
          "descRaw": "受到来自自身前方单位造成的物理和法术伤害降低30%，若伤害来源为【海怪】，则降低50%",
          "bb": {
            "damage_resistance_normal": 0.3,
            "damage_resistance_seamonster": 0.5,
            "tag": 0
          },
          "bbStr": {
            "tag": "seamonster"
          },
          "hidden": false,
          "fromModule": false
        }
      ],
      "talentsBase": [
        {
          "index": 0,
          "name": "生死定夺",
          "desc": "造成物理伤害时有25%概率攻击力提升至135%，目标防御力低于初始值时概率提升至50%",
          "descRaw": "造成物理伤害时有25%概率攻击力提升至135%，目标防御力低于初始值时概率提升至50%",
          "bb": {
            "t1_atk_scale": 1.35,
            "prob_normal": 0.25,
            "prob_special": 0.5
          },
          "bbStr": {},
          "hidden": false,
          "fromModule": false
        },
        {
          "index": 1,
          "name": "习得性防御",
          "desc": "受到来自自身前方单位造成的物理和法术伤害降低30%，若伤害来源为【海怪】，则降低50%",
          "descRaw": "受到来自自身前方单位造成的物理和法术伤害降低30%，若伤害来源为【海怪】，则降低50%",
          "bb": {
            "damage_resistance_normal": 0.3,
            "damage_resistance_seamonster": 0.5,
            "tag": 0
          },
          "bbStr": {
            "tag": "seamonster"
          },
          "hidden": false,
          "fromModule": false
        }
      ],
      "tokens": [],
      "skill": {
        "skillId": "skchr_clemnt_3",
        "iconId": "skchr_clemnt_3",
        "name": "与海为敌",
        "level": 7,
        "desc": "攻击范围扩大，攻击目标数+2，每次攻击对目标造成相当于攻击力200%的物理伤害并额外造成相当于物理伤害20%的侵蚀损伤；当全场有敌人侵蚀损伤爆发时，消耗1发弹药对目标所在位置及其周围四格内所有地面敌人造成3次相当于攻击力270%的物理伤害与相当于攻击力200%的元素伤害\n技能装有10发弹药，打完后结束（可随时停止技能）",
        "descRaw": "攻击范围扩大，攻击目标数+2，每次攻击对目标造成相当于攻击力200%的物理伤害并额外造成相当于物理伤害20%的侵蚀损伤；当全场有敌人侵蚀损伤爆发时，消耗1发弹药对目标所在位置及其周围四格内所有地面敌人造成3次相当于攻击力270%的物理伤害与相当于攻击力200%的元素伤害\n技能装有10发弹药，打完后结束（可随时停止技能）",
        "skillType": "MANUAL",
        "durationType": "AMMO",
        "duration": 0,
        "spType": "INCREASE_WITH_TIME",
        "spCost": 45,
        "initSp": 28,
        "maxChargeTime": 1,
        "increment": 1,
        "bb": {
          "attack@max_target": 3,
          "attack@atk_scale": 2,
          "attack@ep_damage_ratio": 0.2,
          "attack@ep_break_duration": 1,
          "projectile_life_time": 5,
          "s3_atk_scale": 2.7,
          "ep_damage_scale": 2,
          "trigger_time": 10,
          "audio_trigger_cnt": 3,
          "ep_break_duration": 1
        },
        "bbStr": {},
        "rangeId": "3-2",
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
          ]
        ],
        "prefabId": "skchr_clemnt_3",
        "trigger": {
          "rule": "SKILL_RANGE"
        },
        "index": 2,
        "isDefault": true
      },
      "skills": [
        {
          "skillId": "skchr_clemnt_1",
          "iconId": "skchr_clemnt_1",
          "name": "冲蚀",
          "level": 7,
          "desc": "下次攻击的攻击力提高至225%并造成相当于物理伤害30%的侵蚀损伤",
          "descRaw": "下次攻击的攻击力提高至225%并造成相当于物理伤害30%的侵蚀损伤",
          "skillType": "AUTO",
          "durationType": "NONE",
          "duration": 0,
          "spType": "INCREASE_WHEN_ATTACK",
          "spCost": 3,
          "initSp": 0,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "atk_scale": 2.25,
            "ep_damage_ratio": 0.3
          },
          "bbStr": {},
          "rangeId": null,
          "rangeGrid": null,
          "prefabId": "skchr_clemnt_1",
          "trigger": {
            "rule": "SP_FULL"
          },
          "index": 0,
          "isDefault": false
        },
        {
          "skillId": "skchr_clemnt_2",
          "iconId": "skchr_clemnt_2",
          "name": "风暴潮",
          "level": 7,
          "desc": "攻击范围扩大，攻击速度+100，每次攻击对目标及其周围最多5名地面敌人造成相当于攻击力230%的物理伤害；向前方召唤浮游放逐舱，放逐舱使周围累计不超过8重量的最多15名地面敌人不断向前移动；放逐舱在移动3格后消失并留下漩涡，处于漩涡的所有敌人移动速度-70%且每秒受到200点侵蚀损伤和相当于攻击力285%的物理伤害",
          "descRaw": "攻击范围扩大，攻击速度+100，每次攻击对目标及其周围最多5名地面敌人造成相当于攻击力230%的物理伤害；向前方召唤浮游放逐舱，放逐舱使周围累计不超过8重量的最多15名地面敌人不断向前移动；放逐舱在移动3格后消失并留下漩涡，处于漩涡的所有敌人移动速度-70%且每秒受到200点侵蚀损伤和相当于攻击力285%的物理伤害",
          "skillType": "MANUAL",
          "durationType": "NONE",
          "duration": 16,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 20,
          "initSp": 12,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "attack_speed": 100,
            "attack@aoe_atk_scale": 2.3,
            "attack@max_passenger_mass": 8,
            "attack@max_passenger_cnt": 15,
            "attack@move_speed": -0.7,
            "attack@water_element": 200,
            "attack@physical_atk_scale": 2.85,
            "attack@max_target": 5
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
          "prefabId": "skchr_clemnt_2",
          "trigger": {
            "rule": "SKILL_RANGE"
          },
          "index": 1,
          "isDefault": false
        },
        {
          "skillId": "skchr_clemnt_3",
          "iconId": "skchr_clemnt_3",
          "name": "与海为敌",
          "level": 7,
          "desc": "攻击范围扩大，攻击目标数+2，每次攻击对目标造成相当于攻击力200%的物理伤害并额外造成相当于物理伤害20%的侵蚀损伤；当全场有敌人侵蚀损伤爆发时，消耗1发弹药对目标所在位置及其周围四格内所有地面敌人造成3次相当于攻击力270%的物理伤害与相当于攻击力200%的元素伤害\n技能装有10发弹药，打完后结束（可随时停止技能）",
          "descRaw": "攻击范围扩大，攻击目标数+2，每次攻击对目标造成相当于攻击力200%的物理伤害并额外造成相当于物理伤害20%的侵蚀损伤；当全场有敌人侵蚀损伤爆发时，消耗1发弹药对目标所在位置及其周围四格内所有地面敌人造成3次相当于攻击力270%的物理伤害与相当于攻击力200%的元素伤害\n技能装有10发弹药，打完后结束（可随时停止技能）",
          "skillType": "MANUAL",
          "durationType": "AMMO",
          "duration": 0,
          "spType": "INCREASE_WITH_TIME",
          "spCost": 45,
          "initSp": 28,
          "maxChargeTime": 1,
          "increment": 1,
          "bb": {
            "attack@max_target": 3,
            "attack@atk_scale": 2,
            "attack@ep_damage_ratio": 0.2,
            "attack@ep_break_duration": 1,
            "projectile_life_time": 5,
            "s3_atk_scale": 2.7,
            "ep_damage_scale": 2,
            "trigger_time": 10,
            "audio_trigger_cnt": 3,
            "ep_break_duration": 1
          },
          "bbStr": {},
          "rangeId": "3-2",
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
            ]
          ],
          "prefabId": "skchr_clemnt_3",
          "trigger": {
            "rule": "SKILL_RANGE"
          },
          "index": 2,
          "isDefault": true
        }
      ],
      "module": null,
      "modules": [],
      "assets": {
        "avatar": "char_4231_clemnt_2",
        "portrait": "char_4231_clemnt_2",
        "spine": "char_4231_clemnt",
        "skillIcon": "skchr_clemnt_3",
        "subProfIcon": "sub_primguard_icon"
      },
      "expansionBatch": "arknights-expansion-v1"
    }
  },
  "garrisons": {
    "exp_clemnt_growth_a": {
      "garrisonId": "exp_clemnt_growth_a",
      "name": "侵蚀破阵",
      "eventType": "IN_BATTLE",
      "effectKey": "exp_clemnt_growth",
      "effectType": "ADD_BOND",
      "desc": "自身引发敌人侵蚀爆发时，已激活阿戈尔增加2层、迅捷增加1层。每场战斗至多触发3次，同名普通与精锐副本共用上限，以实际引发爆发者结算；联防及最终攻势按原有成长限制。",
      "bb": {
        "egir": 2,
        "swift": 1,
        "maxTriggers": 3
      },
      "bbStr": {},
      "owners": [
        "chess_exp_clemnt_a"
      ],
      "expansionBatch": "arknights-expansion-v1"
    },
    "exp_clemnt_growth_b": {
      "garrisonId": "exp_clemnt_growth_b",
      "name": "侵蚀破阵",
      "eventType": "IN_BATTLE",
      "effectKey": "exp_clemnt_growth",
      "effectType": "ADD_BOND",
      "desc": "自身引发敌人侵蚀爆发时，已激活阿戈尔增加4层、迅捷增加2层。每场战斗至多触发3次，同名普通与精锐副本共用上限，以实际引发爆发者结算；联防及最终攻势按原有成长限制。",
      "bb": {
        "egir": 4,
        "swift": 2,
        "maxTriggers": 3
      },
      "bbStr": {},
      "owners": [
        "chess_exp_clemnt_b"
      ],
      "expansionBatch": "arknights-expansion-v1"
    }
  },
  "bonds": {},
  "tokens": {},
  "bands": {}
};
