// Pinned native battle assets; Nearl proof in docs/NEARL-ASSETS.json.
export const ASSETS={
  "chars": {
    "char_123_fang": {
      "spine": {
        "front": {
          "skel": "/assets/spine/op/char_123_fang/front/char_123_fang.skel",
          "atlas": "/assets/spine/op/char_123_fang/front/char_123_fang.atlas",
          "textures": [
            "/assets/spine/op/char_123_fang/front/char_123_fang.png"
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
              "loop": "Attack",
              "end": null,
              "via": "attack",
              "index": 0,
              "idle": null
            },
            "die": "Die",
            "move": null,
            "stun": null
          },
          "animations": {
            "Attack": 1,
            "Attack_Down": 1,
            "Default": 0,
            "Die": 1,
            "Idle": 2,
            "Start": 1
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack": [
              0.433
            ],
            "Attack_Down": [
              0.433
            ]
          },
          "bounds": {
            "x": -118.839,
            "y": -11.752,
            "width": 387.075,
            "height": 406.24
          }
        },
        "back": {
          "skel": "/assets/spine/op/char_123_fang/back/char_123_fang.skel",
          "atlas": "/assets/spine/op/char_123_fang/back/char_123_fang.atlas",
          "textures": [
            "/assets/spine/op/char_123_fang/back/char_123_fang.png"
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
            "stun": null
          },
          "animations": {
            "Attack": 1,
            "Attack_Up": 1,
            "Default": 0,
            "Idle": 2,
            "Start": 1
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack": [
              0.433
            ],
            "Attack_Up": [
              0.433
            ]
          },
          "bounds": {
            "x": -118.602,
            "y": -10.1,
            "width": 385.019,
            "height": 404.413
          }
        }
      },
      "avatar": "/assets/char/avatar/char_123_fang.png",
      "avatarE2": "/assets/char/avatar/char_123_fang.png",
      "portrait": "/assets/char/portrait/char_123_fang_1.png",
      "portraitE2": "/assets/char/portrait/char_123_fang_1.png"
    },
    "char_122_beagle": {
      "spine": {
        "front": {
          "skel": "/assets/spine/op/char_122_beagle/front/char_122_beagle.skel",
          "atlas": "/assets/spine/op/char_122_beagle/front/char_122_beagle.atlas",
          "textures": [
            "/assets/spine/op/char_122_beagle/front/char_122_beagle.png"
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
              "loop": "Skill",
              "end": null,
              "index": 0,
              "idle": null
            },
            "die": "Die",
            "move": null,
            "stun": null
          },
          "animations": {
            "Attack": 1,
            "Attack_Down": 1,
            "Default": 0,
            "Die": 1,
            "Idle": 2,
            "Skill": 1,
            "Start": 1
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack": [
              0.5
            ],
            "Attack_Down": [
              0.5
            ],
            "Skill": [
              0.467
            ]
          },
          "bounds": {
            "x": -154.877,
            "y": -6.532,
            "width": 415.092,
            "height": 399.096
          }
        },
        "back": {
          "skel": "/assets/spine/op/char_122_beagle/back/char_122_beagle.skel",
          "atlas": "/assets/spine/op/char_122_beagle/back/char_122_beagle.atlas",
          "textures": [
            "/assets/spine/op/char_122_beagle/back/char_122_beagle.png"
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
            "die": null,
            "move": null,
            "stun": null
          },
          "animations": {
            "Attack": 1,
            "Attack_Up": 1,
            "Default": 0,
            "Idle": 2,
            "Skill": 1,
            "Start": 1
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack": [
              0.467
            ],
            "Attack_Up": [
              0.467
            ],
            "Skill": [
              0.467
            ]
          },
          "bounds": {
            "x": -154.615,
            "y": 0.069,
            "width": 411.093,
            "height": 393.291
          }
        }
      },
      "avatar": "/assets/char/avatar/char_122_beagle.png",
      "avatarE2": "/assets/char/avatar/char_122_beagle.png",
      "portrait": "/assets/char/portrait/char_122_beagle_1.png",
      "portraitE2": "/assets/char/portrait/char_122_beagle_1.png"
    },
    "char_002_amiya": {
      "spine": {
        "front": {
          "skel": "/assets/spine/op/char_002_amiya/front/char_002_amiya.skel",
          "atlas": "/assets/spine/op/char_002_amiya/front/char_002_amiya.atlas",
          "textures": [
            "/assets/spine/op/char_002_amiya/front/char_002_amiya.png"
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
              "begin": "Skill_Begin",
              "loop": "Skill",
              "end": "Skill_End",
              "index": 0,
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
                "begin": "Skill_Begin",
                "loop": "Skill",
                "end": "Skill_End",
                "index": 0,
                "idle": null
              },
              "1": {
                "begin": "Skill_2_Begin",
                "loop": "Skill_2",
                "end": "Skill_2_End",
                "index": 1,
                "idle": null
              },
              "2": {
                "begin": "Skill_Begin",
                "loop": "Skill",
                "end": "Skill_End",
                "index": 2,
                "idle": null
              }
            }
          },
          "animations": {
            "Attack": 1.767,
            "Attack_Begin": 0.133,
            "Attack_End": 0.133,
            "Default": 0,
            "Die": 1,
            "Idle": 1,
            "Skill": 1,
            "Skill_2": 0.4,
            "Skill_2_Begin": 0.133,
            "Skill_2_End": 0.133,
            "Skill_Begin": 0.167,
            "Skill_End": 0.167,
            "Start": 1,
            "Stun": 0.8
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack": [
              0.633
            ],
            "Skill": [
              0
            ],
            "Skill_2": [
              0
            ]
          },
          "bounds": {
            "x": -125.402,
            "y": -2.956,
            "width": 287.041,
            "height": 436.5
          }
        },
        "back": {
          "skel": "/assets/spine/op/char_002_amiya/back/char_002_amiya.skel",
          "atlas": "/assets/spine/op/char_002_amiya/back/char_002_amiya.atlas",
          "textures": [
            "/assets/spine/op/char_002_amiya/back/char_002_amiya.png"
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
              "begin": "Skill_Begin",
              "loop": "Skill",
              "end": "Skill_End",
              "index": 0,
              "idle": null
            },
            "die": null,
            "move": null,
            "stun": null,
            "skills": {
              "0": {
                "begin": "Skill_Begin",
                "loop": "Skill",
                "end": "Skill_End",
                "index": 0,
                "idle": null
              },
              "1": {
                "begin": "Skill_2_Begin",
                "loop": "Skill_2",
                "end": "Skill_2_End",
                "index": 1,
                "idle": null
              },
              "2": {
                "begin": "Skill_Begin",
                "loop": "Skill",
                "end": "Skill_End",
                "index": 2,
                "idle": null
              }
            }
          },
          "animations": {
            "Attack": 1.767,
            "Attack_Begin": 0.133,
            "Attack_End": 0.133,
            "Default": 0,
            "Idle": 1,
            "Skill": 1,
            "Skill_2": 0.4,
            "Skill_2_Begin": 0.133,
            "Skill_2_End": 0.133,
            "Skill_Begin": 0.167,
            "Skill_End": 0.167,
            "Start": 1
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack": [
              0.633
            ],
            "Skill": [
              0
            ],
            "Skill_2": [
              0
            ]
          },
          "bounds": {
            "x": -124.577,
            "y": -1.608,
            "width": 231.498,
            "height": 437
          }
        }
      },
      "avatar": "/assets/char/avatar/char_002_amiya.png",
      "avatarE2": "/assets/char/avatar/char_002_amiya_2.png",
      "portrait": "/assets/char/portrait/char_002_amiya_1.png",
      "portraitE2": "/assets/char/portrait/char_002_amiya_2.png"
    },
    "char_4184_dolris": {
      "spine": {
        "front": {
          "skel": "/assets/spine/op/char_4184_dolris/front/char_4184_dolris.skel",
          "atlas": "/assets/spine/op/char_4184_dolris/front/char_4184_dolris.atlas",
          "textures": [
            "/assets/spine/op/char_4184_dolris/front/char_4184_dolris.png"
          ],
          "pma": false,
          "anims": {
            "idle": "Idle",
            "deploy": "Start",
            "attack": {
              "begin": null,
              "loop": "Skill_1_Loop",
              "end": null,
              "via": "skill"
            },
            "attackDown": null,
            "skill": {
              "begin": "Skill_1_Begin",
              "loop": "Skill_1_Loop",
              "end": "Skill_1_End",
              "index": 0,
              "idle": null
            },
            "die": "Die",
            "move": null,
            "stun": null,
            "skills": {
              "0": {
                "begin": "Skill_1_Begin",
                "loop": "Skill_1_Loop",
                "end": "Skill_1_End",
                "index": 0,
                "idle": null
              },
              "1": {
                "begin": "Skill_2_Begin",
                "loop": "Skill_2_Loop",
                "end": "Skill_2_End",
                "index": 1,
                "idle": null
              }
            }
          },
          "animations": {
            "Default": 0,
            "Die": 1,
            "Idle": 4,
            "Skill_1_Begin": 1.333,
            "Skill_1_End": 0.667,
            "Skill_1_Loop": 3.333,
            "Skill_2_Begin": 0.333,
            "Skill_2_End": 1.167,
            "Skill_2_Loop": 1.333,
            "Start": 1
          },
          "events": [
            "OnStart"
          ],
          "hits": {},
          "bounds": {
            "x": -106.383,
            "y": -1.32,
            "width": 265.655,
            "height": 362.132
          }
        }
      },
      "avatar": "/assets/char/avatar/char_4184_dolris.png",
      "avatarE2": "/assets/char/avatar/char_4184_dolris_2.png",
      "portrait": "/assets/char/portrait/char_4184_dolris_1.png",
      "portraitE2": "/assets/char/portrait/char_4184_dolris_2.png"
    },
    "char_4185_amoris": {
      "spine": {
        "front": {
          "skel": "/assets/spine/op/char_4185_amoris/front/char_4185_amoris.skel",
          "atlas": "/assets/spine/op/char_4185_amoris/front/char_4185_amoris.atlas",
          "textures": [
            "/assets/spine/op/char_4185_amoris/front/char_4185_amoris.png"
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
                "begin": null,
                "loop": "Skill_2",
                "end": null,
                "index": 1,
                "idle": null
              }
            }
          },
          "animations": {
            "Attack": 1.8,
            "Default": 0,
            "Die": 1,
            "Idle": 1,
            "Skill_1": 1.8,
            "Skill_2": 1.8,
            "Start": 1
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack": [
              0.667
            ],
            "Skill_1": [
              0.267,
              0.867,
              1.467
            ],
            "Skill_2": [
              0.1,
              0.333,
              0.567,
              0.8,
              1,
              1.233,
              1.467,
              1.7
            ]
          },
          "bounds": {
            "x": -1413.23,
            "y": -11.3,
            "width": 1550.098,
            "height": 371.42
          }
        },
        "back": {
          "skel": "/assets/spine/op/char_4185_amoris/back/char_4185_amoris.skel",
          "atlas": "/assets/spine/op/char_4185_amoris/back/char_4185_amoris.atlas",
          "textures": [
            "/assets/spine/op/char_4185_amoris/back/char_4185_amoris.png"
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
                "begin": null,
                "loop": "Skill_2",
                "end": null,
                "index": 1,
                "idle": null
              }
            }
          },
          "animations": {
            "Attack": 1.8,
            "Default": 0,
            "Die": 1,
            "Idle": 1,
            "Skill_1": 1.8,
            "Skill_2": 1.8,
            "Start": 1
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack": [
              0.667
            ],
            "Skill_1": [
              0.267,
              0.867,
              1.467
            ],
            "Skill_2": [
              0.1,
              0.333,
              0.567,
              0.8,
              1,
              1.233,
              1.467,
              1.7
            ]
          },
          "bounds": {
            "x": -1413.23,
            "y": -11.3,
            "width": 1550.098,
            "height": 371.09
          }
        }
      },
      "avatar": "/assets/char/avatar/char_4185_amoris.png",
      "avatarE2": "/assets/char/avatar/char_4185_amoris_2.png",
      "portrait": "/assets/char/portrait/char_4185_amoris_1.png",
      "portraitE2": "/assets/char/portrait/char_4185_amoris_2.png"
    },
    "char_4183_mortis": {
      "spine": {
        "front": {
          "skel": "/assets/spine/op/char_4183_mortis/front/char_4183_mortis.skel",
          "atlas": "/assets/spine/op/char_4183_mortis/front/char_4183_mortis.atlas",
          "textures": [
            "/assets/spine/op/char_4183_mortis/front/char_4183_mortis.png"
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
            "die": "Doll_Die",
            "move": null,
            "stun": {
              "begin": null,
              "loop": "Stun",
              "end": null
            },
            "skills": {
              "0": {
                "begin": null,
                "loop": "Skill_1",
                "end": null,
                "index": 0,
                "idle": null
              },
              "1": {
                "begin": null,
                "loop": "Skill_2",
                "end": null,
                "index": 1,
                "idle": null
              }
            }
          },
          "animations": {
            "Attack": 1.2,
            "Default": 0,
            "Doll_Default": 0,
            "Doll_Die": 1,
            "Doll_Idle": 18.133,
            "Doll_SwitchOut": 1,
            "Doll_Switchin": 1,
            "Idle": 6.667,
            "Skill_1": 1.2,
            "Skill_2": 0.9,
            "Start": 1,
            "Stun": 1,
            "SwitchOut": 1
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack": [
              0.433
            ],
            "Skill_1": [
              0.433
            ],
            "Skill_2": [
              0.333
            ]
          },
          "bounds": {
            "x": -103.376,
            "y": -1.014,
            "width": 582.708,
            "height": 387.679
          }
        },
        "back": {
          "skel": "/assets/spine/op/char_4183_mortis/back/char_4183_mortis.skel",
          "atlas": "/assets/spine/op/char_4183_mortis/back/char_4183_mortis.atlas",
          "textures": [
            "/assets/spine/op/char_4183_mortis/back/char_4183_mortis.png"
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
                "begin": null,
                "loop": "Skill_2",
                "end": null,
                "index": 1,
                "idle": null
              }
            }
          },
          "animations": {
            "Attack": 1.2,
            "Default": 0,
            "Doll_Default": 0,
            "Doll_Idle": 18.133,
            "Doll_SwitchOut": 1,
            "Doll_Switchin": 1,
            "Idle": 6.667,
            "Skill_1": 1.2,
            "Skill_2": 0.9,
            "Start": 1
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack": [
              0.433
            ],
            "Skill_1": [
              0.433
            ],
            "Skill_2": [
              0.333
            ]
          },
          "bounds": {
            "x": -103.376,
            "y": -1.014,
            "width": 582.708,
            "height": 387.679
          }
        }
      },
      "avatar": "/assets/char/avatar/char_4183_mortis.png",
      "avatarE2": "/assets/char/avatar/char_4183_mortis_2.png",
      "portrait": "/assets/char/portrait/char_4183_mortis_1.png",
      "portraitE2": "/assets/char/portrait/char_4183_mortis_2.png"
    },
    "char_4186_tmoris": {
      "spine": {
        "front": {
          "skel": "/assets/spine/op/char_4186_tmoris/front/char_4186_tmoris.skel",
          "atlas": "/assets/spine/op/char_4186_tmoris/front/char_4186_tmoris.atlas",
          "textures": [
            "/assets/spine/op/char_4186_tmoris/front/char_4186_tmoris.png"
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
                "idle": null
              }
            }
          },
          "animations": {
            "Attack": 1,
            "Default": 0,
            "Die": 1,
            "Idle": 4,
            "Skill_1": 1.5,
            "Skill_2_Begin": 0.333,
            "Skill_2_End": 0.667,
            "Skill_2_Loop": 2,
            "Start": 1
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack": [
              0.467
            ],
            "Skill_1": [
              0.367,
              0.5,
              0.633,
              0.767,
              0.9
            ]
          },
          "bounds": {
            "x": -201.437,
            "y": -1.159,
            "width": 388.26,
            "height": 361.572
          }
        },
        "back": {
          "skel": "/assets/spine/op/char_4186_tmoris/back/char_4186_tmoris.skel",
          "atlas": "/assets/spine/op/char_4186_tmoris/back/char_4186_tmoris.atlas",
          "textures": [
            "/assets/spine/op/char_4186_tmoris/back/char_4186_tmoris.png"
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
                "idle": null
              }
            }
          },
          "animations": {
            "Attack": 1,
            "Default": 0,
            "Idle": 4,
            "Skill_1": 1.5,
            "Skill_2_Begin": 0.333,
            "Skill_2_End": 0.667,
            "Skill_2_Loop": 2,
            "Start": 1
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack": [
              0.467
            ],
            "Skill_1": [
              0.367,
              0.5,
              0.633,
              0.767,
              0.9
            ]
          },
          "bounds": {
            "x": -201.437,
            "y": -1.144,
            "width": 298.711,
            "height": 360.55
          }
        }
      },
      "avatar": "/assets/char/avatar/char_4186_tmoris.png",
      "avatarE2": "/assets/char/avatar/char_4186_tmoris_2.png",
      "portrait": "/assets/char/portrait/char_4186_tmoris_1.png",
      "portraitE2": "/assets/char/portrait/char_4186_tmoris_2.png"
    },
    "char_4182_oblvns": {
      "spine": {
        "front": {
          "skel": "/assets/spine/op/char_4182_oblvns/front/char_4182_oblvns.skel",
          "atlas": "/assets/spine/op/char_4182_oblvns/front/char_4182_oblvns.atlas",
          "textures": [
            "/assets/spine/op/char_4182_oblvns/front/char_4182_oblvns.png"
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
                "begin": "Skill_2_Start",
                "loop": "Skill_2_Idle_A",
                "end": null,
                "index": 1,
                "idle": null
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
            "Attack": 1.3,
            "Combat": 1.3,
            "Default": 0,
            "Die": 1,
            "Idle": 4,
            "Skill_1": 1.3,
            "Skill_2_Idle_A": 4,
            "Skill_2_Idle_B": 4,
            "Skill_2_Loop_A": 1.3,
            "Skill_2_Loop_B": 1.3,
            "Skill_2_Start": 1,
            "Skill_2_Trans_A": 0.333,
            "Skill_2_Trans_B": 0.333,
            "Skill_3_Begin": 0.333,
            "Skill_3_End": 0.333,
            "Skill_3_Idle": 3.667,
            "Skill_3_Loop": 1.167,
            "Start": 1
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack": [
              0.267
            ],
            "Combat": [
              0.267
            ],
            "Skill_1": [
              0.267
            ],
            "Skill_2_Loop_A": [
              0.267
            ],
            "Skill_2_Loop_B": [
              0.267
            ],
            "Skill_3_Loop": [
              0.2,
              0.3
            ]
          },
          "bounds": {
            "x": -1363.64,
            "y": -1.919,
            "width": 2765.07,
            "height": 692.659
          }
        },
        "back": {
          "skel": "/assets/spine/op/char_4182_oblvns/back/char_4182_oblvns.skel",
          "atlas": "/assets/spine/op/char_4182_oblvns/back/char_4182_oblvns.atlas",
          "textures": [
            "/assets/spine/op/char_4182_oblvns/back/char_4182_oblvns.png"
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
                "begin": "Skill_2_Start",
                "loop": "Skill_2_Idle_A",
                "end": null,
                "index": 1,
                "idle": null
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
            "Attack": 1.3,
            "Combat": 1.3,
            "Default": 0,
            "Die": 1,
            "Idle": 4,
            "Skill_1": 1.3,
            "Skill_2_Idle_A": 4,
            "Skill_2_Idle_B": 4,
            "Skill_2_Loop_A": 1.3,
            "Skill_2_Loop_B": 1.3,
            "Skill_2_Start": 1,
            "Skill_2_Trans_A": 0.333,
            "Skill_2_Trans_B": 0.333,
            "Skill_3_Begin": 0.333,
            "Skill_3_End": 0.333,
            "Skill_3_Idle": 3.667,
            "Skill_3_Loop": 1.167,
            "Start": 1
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack": [
              0.267
            ],
            "Combat": [
              0.267
            ],
            "Skill_1": [
              0.267
            ],
            "Skill_2_Loop_A": [
              0.267
            ],
            "Skill_2_Loop_B": [
              0.267
            ],
            "Skill_3_Loop": [
              0.2,
              0.3
            ]
          },
          "bounds": {
            "x": -1363.64,
            "y": -1.919,
            "width": 2765.07,
            "height": 692.659
          }
        }
      },
      "avatar": "/assets/char/avatar/char_4182_oblvns.png",
      "avatarE2": "/assets/char/avatar/char_4182_oblvns_2.png",
      "portrait": "/assets/char/portrait/char_4182_oblvns_1.png",
      "portraitE2": "/assets/char/portrait/char_4182_oblvns_2.png"
    },
    "char_2013_cerber": {
      "spine": {
        "front": {
          "skel": "/assets/spine/op/char_2013_cerber/front/char_2013_cerber.skel",
          "atlas": "/assets/spine/op/char_2013_cerber/front/char_2013_cerber.atlas",
          "textures": [
            "/assets/spine/op/char_2013_cerber/front/char_2013_cerber.png"
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
                "begin": null,
                "loop": "Skill_3",
                "end": null,
                "index": 2,
                "idle": null
              }
            }
          },
          "animations": {
            "Attack": 1.6,
            "Default": 0,
            "Die": 1,
            "Idle": 3.2,
            "Skill_1": 1.6,
            "Skill_2_Begin": 0.333,
            "Skill_2_End": 0.333,
            "Skill_2_Idle": 1,
            "Skill_2_Loop": 0.633,
            "Skill_3": 1.6,
            "Start": 1
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack": [
              0.7
            ],
            "Skill_1": [
              0.967
            ],
            "Skill_2_Loop": [
              0.233
            ],
            "Skill_3": [
              0.967
            ]
          },
          "bounds": {
            "x": -187.07,
            "y": -1.152,
            "width": 530.403,
            "height": 460.006
          }
        },
        "back": {
          "skel": "/assets/spine/op/char_2013_cerber/back/char_2013_cerber.skel",
          "atlas": "/assets/spine/op/char_2013_cerber/back/char_2013_cerber.atlas",
          "textures": [
            "/assets/spine/op/char_2013_cerber/back/char_2013_cerber.png"
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
                "begin": null,
                "loop": "Skill_3",
                "end": null,
                "index": 2,
                "idle": null
              }
            }
          },
          "animations": {
            "Attack": 1.6,
            "Default": 0,
            "Idle": 3.2,
            "Skill_1": 1.6,
            "Skill_2_Begin": 0.333,
            "Skill_2_End": 0.333,
            "Skill_2_Idle": 1,
            "Skill_2_Loop": 0.633,
            "Skill_3": 1.6,
            "Start": 1
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack": [
              0.7
            ],
            "Skill_1": [
              0.967
            ],
            "Skill_2_Loop": [
              0.233
            ],
            "Skill_3": [
              0.967
            ]
          },
          "bounds": {
            "x": -187.07,
            "y": -1.152,
            "width": 530.403,
            "height": 460.006
          }
        }
      },
      "avatar": "/assets/char/avatar/char_2013_cerber.png",
      "avatarE2": "/assets/char/avatar/char_2013_cerber_2.png",
      "portrait": "/assets/char/portrait/char_2013_cerber_1.png",
      "portraitE2": "/assets/char/portrait/char_2013_cerber_2.png"
    },
    "char_1052_kalts2": {
      "spine": {
        "front": {
          "skel": "/assets/spine/op/char_1052_kalts2/front/char_1052_kalts2.skel",
          "atlas": "/assets/spine/op/char_1052_kalts2/front/char_1052_kalts2.atlas",
          "textures": [
            "/assets/spine/op/char_1052_kalts2/front/char_1052_kalts2.png",
            "/assets/spine/op/char_1052_kalts2/front/char_1052_kalts22.png"
          ],
          "pma": false,
          "anims": {
            "idle": "Idle",
            "deploy": "Start",
            "attack": {
              "begin": "Attack_Begin",
              "loop": "Attack_Loop",
              "end": "Attack_End"
            },
            "attackDown": {
              "begin": null,
              "loop": "Attack_Down_Loop",
              "end": null
            },
            "skill": {
              "begin": "Attack_Begin",
              "loop": "Attack_Loop",
              "end": "Attack_End",
              "via": "attack",
              "index": 0,
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
                "begin": "Attack_Begin",
                "loop": "Attack_Loop",
                "end": "Attack_End",
                "via": "attack",
                "index": 0,
                "idle": null
              },
              "1": {
                "begin": "Skill_2_Begin",
                "loop": "Skill_2_Attack",
                "end": "Skill_2_End",
                "index": 1,
                "idle": "Skill_2_Idle"
              },
              "2": {
                "begin": null,
                "loop": "Skill_3_Attack",
                "end": "Skill_3_End",
                "index": 2,
                "idle": "Skill_3_Idle"
              }
            }
          },
          "animations": {
            "Attack_Begin": 0.333,
            "Attack_Down_Loop": 3,
            "Attack_End": 0.333,
            "Attack_Loop": 3,
            "Default": 0,
            "Die": 1,
            "Idle": 2,
            "Skill_2_Attack": 3,
            "Skill_2_Begin": 0.667,
            "Skill_2_End": 0.667,
            "Skill_2_Idle": 2,
            "Skill_3_Attack": 1.333,
            "Skill_3_End": 0.5,
            "Skill_3_Idle": 1.333,
            "Skill_3_Restart_Begin": 1,
            "Skill_3_Restart_End": 1,
            "Skill_Down_2_Attack": 3,
            "Skill_Down_3_Attack": 1.333,
            "Start": 1,
            "Stun": 2
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack_Down_Loop": [
              0.6
            ],
            "Attack_Loop": [
              0.6
            ],
            "Skill_2_Attack": [
              0.533
            ],
            "Skill_3_Attack": [
              0.4
            ],
            "Skill_3_Restart_Begin": [
              0.667
            ],
            "Skill_Down_2_Attack": [
              0.533
            ],
            "Skill_Down_3_Attack": [
              0.433
            ]
          },
          "bounds": {
            "x": -1133.371,
            "y": 26.373,
            "width": 1290.307,
            "height": 906.006
          }
        },
        "back": {
          "skel": "/assets/spine/op/char_1052_kalts2/back/char_1052_kalts2.skel",
          "atlas": "/assets/spine/op/char_1052_kalts2/back/char_1052_kalts2.atlas",
          "textures": [
            "/assets/spine/op/char_1052_kalts2/back/char_1052_kalts2.png",
            "/assets/spine/op/char_1052_kalts2/back/char_1052_kalts22.png"
          ],
          "pma": false,
          "anims": {
            "idle": "Idle",
            "deploy": "Start",
            "attack": {
              "begin": "Attack_Begin",
              "loop": "Attack_Loop",
              "end": "Attack_End"
            },
            "attackDown": null,
            "skill": {
              "begin": "Attack_Begin",
              "loop": "Attack_Loop",
              "end": "Attack_End",
              "via": "attack",
              "index": 0,
              "idle": null
            },
            "die": null,
            "move": null,
            "stun": null,
            "skills": {
              "0": {
                "begin": "Attack_Begin",
                "loop": "Attack_Loop",
                "end": "Attack_End",
                "via": "attack",
                "index": 0,
                "idle": null
              },
              "1": {
                "begin": "Skill_2_Begin",
                "loop": "Skill_2_Attack",
                "end": "Skill_2_End",
                "index": 1,
                "idle": "Skill_2_Idle"
              },
              "2": {
                "begin": null,
                "loop": "Skill_3_Attack",
                "end": "Skill_3_End",
                "index": 2,
                "idle": "Skill_3_Idle"
              }
            }
          },
          "animations": {
            "Attack_Begin": 0.333,
            "Attack_End": 0.333,
            "Attack_Loop": 3,
            "Default": 0,
            "Idle": 2,
            "Skill_2_Attack": 3,
            "Skill_2_Begin": 0.667,
            "Skill_2_End": 0.667,
            "Skill_2_Idle": 2,
            "Skill_3_Attack": 1.333,
            "Skill_3_End": 0.5,
            "Skill_3_Idle": 1.333,
            "Skill_3_Restart_Begin": 1,
            "Skill_3_Restart_End": 1,
            "Start": 1
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack_Loop": [
              0.6
            ],
            "Skill_2_Attack": [
              0.533
            ],
            "Skill_3_Attack": [
              0.433
            ],
            "Skill_3_Restart_Begin": [
              0.667
            ]
          },
          "bounds": {
            "x": -1133.371,
            "y": 26.373,
            "width": 1290.307,
            "height": 906.006
          }
        }
      },
      "avatar": "/assets/char/avatar/char_1052_kalts2.png",
      "avatarE2": "/assets/char/avatar/char_1052_kalts2_2.png",
      "portrait": "/assets/char/portrait/char_1052_kalts2_1.png",
      "portraitE2": "/assets/char/portrait/char_1052_kalts2_2.png",
      "portraitKind": "illustration"
    },
    "char_148_nearl": {
      "spine": {
        "front": {
          "skel": "/assets/spine/op/char_148_nearl/front/char_148_nearl.skel",
          "atlas": "/assets/spine/op/char_148_nearl/front/char_148_nearl.atlas",
          "textures": [
            "/assets/spine/op/char_148_nearl/front/char_148_nearl.png"
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
            "Attack": 1,
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
              0.467
            ],
            "Skill": [
              0.533
            ]
          },
          "bounds": {
            "x": -183.053,
            "y": -2.599,
            "width": 413.136,
            "height": 411.14
          }
        },
        "back": {
          "skel": "/assets/spine/op/char_148_nearl/back/char_148_nearl.skel",
          "atlas": "/assets/spine/op/char_148_nearl/back/char_148_nearl.atlas",
          "textures": [
            "/assets/spine/op/char_148_nearl/back/char_148_nearl.png"
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
            "Attack": 1,
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
              0.467
            ]
          },
          "bounds": {
            "x": -172.839,
            "y": -2.268,
            "width": 398.596,
            "height": 411.309
          }
        }
      },
      "avatar": "/assets/char/avatar/char_148_nearl.png",
      "avatarE2": "/assets/char/avatar/char_148_nearl_2.png",
      "portrait": "/assets/char/portrait/char_148_nearl_1.png",
      "portraitE2": "/assets/char/portrait/char_148_nearl_2.png"
    }
  },
  "bonds": {
    "rhodesShip": "/assets/bond/icon_rhodesShip.png",
    "girlbandShip": "/assets/bond/icon_girlbandShip.png"
  },
  "bands": {
    "band_rm_kaltsit": "/assets/band/band_rm_kaltsit.png",
    "band_rm_closure": "/assets/band/band_rm_closure.png"
  },
  "skills": {
    "skcom_charge_cost[1]": "/assets/skill/skcom_charge_cost[1].png",
    "skcom_def_up[1]": "/assets/skill/skcom_def_up[1].png",
    "skcom_magic_rage[3]": "/assets/skill/skcom_magic_rage[3].png",
    "skchr_amiya_2": "/assets/skill/skchr_amiya_2.png",
    "skchr_amiya_3": "/assets/skill/skchr_amiya_3.png",
    "skchr_dolris_1": "/assets/skill/skchr_dolris_1.png",
    "skchr_dolris_2": "/assets/skill/skchr_dolris_2.png",
    "skchr_amoris_1": "/assets/skill/skchr_amoris_1.png",
    "skchr_amoris_2": "/assets/skill/skchr_amoris_2.png",
    "skchr_mortis_1": "/assets/skill/skchr_mortis_1.png",
    "skchr_mortis_2": "/assets/skill/skchr_mortis_2.png",
    "skchr_tmoris_1": "/assets/skill/skchr_tmoris_1.png",
    "skchr_tmoris_2": "/assets/skill/skchr_tmoris_2.png",
    "skchr_oblvns_1": "/assets/skill/skchr_oblvns_1.png",
    "skchr_oblvns_2": "/assets/skill/skchr_oblvns_2.png",
    "skchr_oblvns_3": "/assets/skill/skchr_oblvns_3.png",
    "skchr_cerber_1": "/assets/skill/skchr_cerber_1.png",
    "skchr_cerber_2": "/assets/skill/skchr_cerber_2.png",
    "skchr_cerber_3": "/assets/skill/skchr_cerber_3.png",
    "skchr_kalts2_1": "/assets/skill/skchr_kalts2_1.png",
    "skchr_kalts2_2": "/assets/skill/skchr_kalts2_2.png",
    "skchr_kalts2_3": "/assets/skill/skchr_kalts2_3.png",
    "skchr_nearl_1": "/assets/skill/skchr_nearl_1.png",
    "skchr_nearl_2": "/assets/skill/skchr_nearl_2.png"
  },
  "skillsById": {
    "skcom_charge_cost[1]": "skcom_charge_cost[1]",
    "skcom_def_up[1]": "skcom_def_up[1]",
    "skcom_magic_rage[3]": "skcom_magic_rage[3]",
    "skchr_amiya_2": "skchr_amiya_2",
    "skchr_amiya_3": "skchr_amiya_3",
    "skchr_dolris_1": "skchr_dolris_1",
    "skchr_dolris_2": "skchr_dolris_2",
    "skchr_amoris_1": "skchr_amoris_1",
    "skchr_amoris_2": "skchr_amoris_2",
    "skchr_mortis_1": "skchr_mortis_1",
    "skchr_mortis_2": "skchr_mortis_2",
    "skchr_tmoris_1": "skchr_tmoris_1",
    "skchr_tmoris_2": "skchr_tmoris_2",
    "skchr_oblvns_1": "skchr_oblvns_1",
    "skchr_oblvns_2": "skchr_oblvns_2",
    "skchr_oblvns_3": "skchr_oblvns_3",
    "skchr_cerber_1": "skchr_cerber_1",
    "skchr_cerber_2": "skchr_cerber_2",
    "skchr_cerber_3": "skchr_cerber_3",
    "skchr_kalts2_1": "skchr_kalts2_1",
    "skchr_kalts2_2": "skchr_kalts2_2",
    "skchr_kalts2_3": "skchr_kalts2_3",
    "skchr_nearl_1": "skchr_nearl_1",
    "skchr_nearl_2": "skchr_nearl_2"
  },
  "modules": {
    "uniequip_002_amiya": "/assets/module/uniequip_002_amiya.png",
    "uniequip_002_dolris": "/assets/module/uniequip_002_dolris.png",
    "uniequip_002_amoris": "/assets/module/uniequip_002_amoris.png",
    "uniequip_002_mortis": "/assets/module/uniequip_002_mortis.png",
    "uniequip_002_tmoris": "/assets/module/uniequip_002_tmoris.png",
    "uniequip_002_oblvns": "/assets/module/uniequip_002_oblvns.png",
    "uniequip_002_cerber": "/assets/module/uniequip_002_cerber.png",
    "uniequip_003_cerber": "/assets/module/uniequip_003_cerber.png",
    "uniequip_002_nearl": "/assets/module/uniequip_002_nearl.png"
  }
};
