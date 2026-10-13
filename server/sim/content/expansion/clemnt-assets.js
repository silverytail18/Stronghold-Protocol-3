// Verified pinned native battle assets.
export const CLEMNT_ASSETS={
  "chars": {
    "char_4231_clemnt": {
      "spine": {
        "front": {
          "skel": "/assets/spine/op/char_4231_clemnt/front/char_4231_clemnt.skel",
          "atlas": "/assets/spine/op/char_4231_clemnt/front/char_4231_clemnt.atlas",
          "textures": [
            "/assets/spine/op/char_4231_clemnt/front/char_4231_clemnt.png"
          ],
          "pma": false,
          "anims": {
            "idle": "Idle",
            "deploy": "Start",
            "attack": {
              "begin": null,
              "loop": "Attack",
              "end": null
            },
            "attackDown": {
              "begin": null,
              "loop": "Attack_Down",
              "end": null
            },
            "skill": {
              "begin": null,
              "loop": "Skill_1",
              "end": null,
              "index": 0,
              "idle": null
            },
            "die": "Die",
            "move": null,
            "stun": null,
            "skills": {
              "0": {
                "begin": null,
                "loop": "Skill_1",
                "end": null,
                "index": 0,
                "idle": null
              },
              "1": {
                "begin": "Skill_2_Begin",
                "loop": "Skill_2_Loop",
                "end": "Skill_2_End",
                "index": 1,
                "idle": "Skill_2_Idle"
              },
              "2": {
                "begin": "Skill_3_Begin",
                "loop": "Skill_3_Loop",
                "end": "Skill_3_End",
                "index": 2,
                "idle": "Skill_3_Idle"
              }
            }
          },
          "animations": {
            "Attack": 1.2,
            "Attack_Down": 1.2,
            "Default": 0,
            "Die": 1,
            "Idle": 2.4,
            "Skill_1": 1.2,
            "Skill_2_Begin": 0.6,
            "Skill_2_End": 0.2,
            "Skill_2_Idle": 2.4,
            "Skill_2_Loop": 1.2,
            "Skill_3_Begin": 0.2,
            "Skill_3_End": 0.2,
            "Skill_3_Idle": 2.4,
            "Skill_3_Loop": 1.2,
            "Skill_Down_2_Begin": 0.6,
            "Skill_Down_2_End": 0.2,
            "Skill_Down_2_Idle": 2.4,
            "Skill_Down_2_Loop": 1.2,
            "Skill_Down_3_Begin": 0.2,
            "Skill_Down_3_End": 0.2,
            "Skill_Down_3_Idle": 2.4,
            "Skill_Down_3_Loop": 1.2,
            "Start": 1
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack": [
              0.367
            ],
            "Attack_Down": [
              0.367
            ],
            "Skill_1": [
              0.367
            ],
            "Skill_2_Begin": [
              0.233
            ],
            "Skill_2_Loop": [
              0.4
            ],
            "Skill_3_Loop": [
              0.433
            ],
            "Skill_Down_2_Begin": [
              0.233
            ],
            "Skill_Down_2_Loop": [
              0.4
            ],
            "Skill_Down_3_Loop": [
              0.433
            ]
          },
          "bounds": {
            "x": -214.712,
            "y": -12.635,
            "width": 481.838,
            "height": 455.018
          }
        },
        "back": {
          "skel": "/assets/spine/op/char_4231_clemnt/back/char_4231_clemnt.skel",
          "atlas": "/assets/spine/op/char_4231_clemnt/back/char_4231_clemnt.atlas",
          "textures": [
            "/assets/spine/op/char_4231_clemnt/back/char_4231_clemnt.png"
          ],
          "pma": false,
          "anims": {
            "idle": "Idle",
            "deploy": "Start",
            "attack": {
              "begin": null,
              "loop": "Attack",
              "end": null
            },
            "attackDown": null,
            "skill": {
              "begin": null,
              "loop": "Skill_1",
              "end": null,
              "index": 0,
              "idle": null
            },
            "die": null,
            "move": null,
            "stun": null,
            "skills": {
              "0": {
                "begin": null,
                "loop": "Skill_1",
                "end": null,
                "index": 0,
                "idle": null
              },
              "1": {
                "begin": "Skill_2_Begin",
                "loop": "Skill_2_Loop",
                "end": "Skill_2_End",
                "index": 1,
                "idle": "Skill_2_Idle"
              },
              "2": {
                "begin": "Skill_3_Begin",
                "loop": "Skill_3_Loop",
                "end": "Skill_3_End",
                "index": 2,
                "idle": "Skill_3_Idle"
              }
            }
          },
          "animations": {
            "Attack": 1.2,
            "Default": 0,
            "Idle": 2.4,
            "Skill_1": 1.2,
            "Skill_2_Begin": 0.6,
            "Skill_2_End": 0.2,
            "Skill_2_Idle": 2.4,
            "Skill_2_Loop": 1.2,
            "Skill_3_Begin": 0.2,
            "Skill_3_End": 0.2,
            "Skill_3_Idle": 2.4,
            "Skill_3_Loop": 1.2,
            "Start": 1
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack": [
              0.367
            ],
            "Skill_1": [
              0.367
            ],
            "Skill_2_Begin": [
              0.233
            ],
            "Skill_2_Loop": [
              0.4
            ],
            "Skill_3_Loop": [
              0.433
            ]
          },
          "bounds": {
            "x": -214.712,
            "y": -12.635,
            "width": 481.838,
            "height": 455.018
          }
        }
      },
      "avatar": "/assets/char/avatar/char_4231_clemnt.png",
      "avatarE2": "/assets/char/avatar/char_4231_clemnt_2.png",
      "portrait": "/assets/char/portrait/char_4231_clemnt_1.png",
      "portraitE2": "/assets/char/portrait/char_4231_clemnt_2.png",
      "portraitKind": "illustration"
    }
  },
  "skills": {
    "skchr_clemnt_1": "/assets/skill/skchr_clemnt_1.png",
    "skchr_clemnt_2": "/assets/skill/skchr_clemnt_2.png",
    "skchr_clemnt_3": "/assets/skill/skchr_clemnt_3.png"
  },
  "skillsById": {
    "skchr_clemnt_1": "skchr_clemnt_1",
    "skchr_clemnt_2": "skchr_clemnt_2",
    "skchr_clemnt_3": "skchr_clemnt_3"
  },
  "modules": {},
  "bonds": {}
};
