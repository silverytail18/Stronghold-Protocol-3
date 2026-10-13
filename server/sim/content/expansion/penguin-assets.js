// Generated only inside the C1 lab.
export const PENGUIN_ASSETS = {
  "version": 1,
  "chars": {
    "char_201_moeshd": {
      "avatar": "/assets/char/avatar/char_201_moeshd.png",
      "avatarE2": "/assets/char/avatar/char_201_moeshd_2.png",
      "portrait": "/assets/char/portrait/char_201_moeshd_1.png",
      "portraitE2": "/assets/char/portrait/char_201_moeshd_2.png",
      "spine": {
        "front": {
          "skel": "/assets/spine/op/char_201_moeshd/front/char_201_moeshd.skel",
          "atlas": "/assets/spine/op/char_201_moeshd/front/char_201_moeshd.atlas",
          "textures": [
            "/assets/spine/op/char_201_moeshd/front/char_201_moeshd.png"
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
              "loop": "Skill",
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
                "loop": "Skill",
                "end": null,
                "index": 0,
                "idle": null
              },
              "1": {
                "begin": null,
                "loop": "Skill",
                "end": null,
                "index": 1,
                "idle": null
              }
            }
          },
          "animations": {
            "Attack": 1.333,
            "Default": 0,
            "Die": 1,
            "Idle": 2,
            "Skill": 1.167,
            "Start": 0.833
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack": [
              0.8
            ],
            "Skill": [
              0.733
            ]
          },
          "bounds": {
            "x": -147.369,
            "y": -1.187,
            "width": 401.936,
            "height": 372.574
          }
        },
        "back": {
          "skel": "/assets/spine/op/char_201_moeshd/back/char_201_moeshd.skel",
          "atlas": "/assets/spine/op/char_201_moeshd/back/char_201_moeshd.atlas",
          "textures": [
            "/assets/spine/op/char_201_moeshd/back/char_201_moeshd.png"
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
              "loop": "Attack",
              "end": null,
              "via": "attack",
              "index": 0,
              "idle": null
            },
            "die": null,
            "move": null,
            "stun": null,
            "skills": {
              "0": {
                "begin": null,
                "loop": "Attack",
                "end": null,
                "via": "attack",
                "index": 0,
                "idle": null
              },
              "1": {
                "begin": null,
                "loop": "Attack",
                "end": null,
                "via": "attack",
                "index": 1,
                "idle": null
              }
            }
          },
          "animations": {
            "Attack": 1.333,
            "Default": 0,
            "Idle": 2,
            "Start": 0.833
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack": [
              0.8
            ]
          },
          "bounds": {
            "x": -147.269,
            "y": -2.238,
            "width": 407.508,
            "height": 373.365
          }
        }
      }
    },
    "char_101_sora": {
      "avatar": "/assets/char/avatar/char_101_sora.png",
      "avatarE2": "/assets/char/avatar/char_101_sora_2.png",
      "portrait": "/assets/char/portrait/char_101_sora_1.png",
      "portraitE2": "/assets/char/portrait/char_101_sora_2.png",
      "spine": {
        "front": {
          "skel": "/assets/spine/op/char_101_sora/front/char_101_sora.skel",
          "atlas": "/assets/spine/op/char_101_sora/front/char_101_sora.atlas",
          "textures": [
            "/assets/spine/op/char_101_sora/front/char_101_sora.png"
          ],
          "pma": false,
          "anims": {
            "idle": "Idle",
            "deploy": "Start",
            "attack": {
              "begin": null,
              "loop": "Idle",
              "end": null,
              "via": "idle"
            },
            "attackDown": null,
            "skill": {
              "begin": null,
              "loop": "Idle",
              "end": null,
              "via": "attack",
              "index": 1,
              "idle": null
            },
            "die": "Die",
            "move": null,
            "stun": {
              "begin": null,
              "loop": "Stun",
              "end": null
            },
            "skills": {
              "0": {
                "begin": null,
                "loop": "Idle",
                "end": null,
                "via": "attack",
                "index": 0,
                "idle": null
              },
              "1": {
                "begin": null,
                "loop": "Idle",
                "end": null,
                "via": "attack",
                "index": 1,
                "idle": null
              }
            }
          },
          "animations": {
            "Default": 0,
            "Die": 1,
            "Idle": 10.633,
            "Start": 3.467,
            "Stun": 1
          },
          "events": [
            "beat"
          ],
          "hits": {},
          "bounds": {
            "x": -243.236,
            "y": -197.648,
            "width": 436.043,
            "height": 706.203
          }
        },
        "back": {
          "skel": "/assets/spine/op/char_101_sora/front/char_101_sora.skel",
          "atlas": "/assets/spine/op/char_101_sora/front/char_101_sora.atlas",
          "textures": [
            "/assets/spine/op/char_101_sora/front/char_101_sora.png"
          ],
          "pma": false,
          "anims": {
            "idle": "Idle",
            "deploy": "Start",
            "attack": {
              "begin": null,
              "loop": "Idle",
              "end": null,
              "via": "idle"
            },
            "attackDown": null,
            "skill": {
              "begin": null,
              "loop": "Idle",
              "end": null,
              "via": "attack",
              "index": 1,
              "idle": null
            },
            "die": "Die",
            "move": null,
            "stun": {
              "begin": null,
              "loop": "Stun",
              "end": null
            },
            "skills": {
              "0": {
                "begin": null,
                "loop": "Idle",
                "end": null,
                "via": "attack",
                "index": 0,
                "idle": null
              },
              "1": {
                "begin": null,
                "loop": "Idle",
                "end": null,
                "via": "attack",
                "index": 1,
                "idle": null
              }
            }
          },
          "animations": {
            "Default": 0,
            "Die": 1,
            "Idle": 10.633,
            "Start": 3.467,
            "Stun": 1
          },
          "events": [
            "beat"
          ],
          "hits": {},
          "bounds": {
            "x": -243.236,
            "y": -197.648,
            "width": 436.043,
            "height": 706.203
          }
        }
      }
    }
  },
  "bonds": {
    "penguinShip": "/assets/bond/icon_penguinShip.png"
  },
  "skills": {
    "skchr_moeshd_1": "/assets/skill/skchr_moeshd_1.png",
    "skchr_moeshd_2": "/assets/skill/skchr_moeshd_2.png",
    "skchr_sora_1": "/assets/skill/skchr_sora_1.png",
    "skchr_sora_2": "/assets/skill/skchr_sora_2.png"
  },
  "skillsById": {
    "skchr_moeshd_1": "skchr_moeshd_1",
    "skchr_moeshd_2": "skchr_moeshd_2",
    "skchr_sora_1": "skchr_sora_1",
    "skchr_sora_2": "skchr_sora_2"
  },
  "modules": {
    "uniequip_002_moeshd": "/assets/module/uniequip_002_moeshd.png",
    "uniequip_002_sora": "/assets/module/uniequip_002_sora.png"
  }
};
