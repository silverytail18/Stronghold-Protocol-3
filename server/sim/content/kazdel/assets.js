// Verified pinned original assets; see docs/KAZDEL-ASSETS.json.
export const ASSETS={
  "chars": {
    "char_290_vigna": {
      "spine": {
        "front": {
          "skel": "/assets/kazdel/spine/op/char_290_vigna/front/char_290_vigna.skel",
          "atlas": "/assets/kazdel/spine/op/char_290_vigna/front/char_290_vigna.atlas",
          "textures": [
            "/assets/kazdel/spine/op/char_290_vigna/front/char_290_vigna.png"
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
              0.4
            ],
            "Attack_Down": [
              0.4
            ]
          },
          "bounds": {
            "x": -159.177,
            "y": -0.791,
            "width": 502.765,
            "height": 392.647
          }
        },
        "back": {
          "skel": "/assets/kazdel/spine/op/char_290_vigna/back/char_290_vigna.skel",
          "atlas": "/assets/kazdel/spine/op/char_290_vigna/back/char_290_vigna.atlas",
          "textures": [
            "/assets/kazdel/spine/op/char_290_vigna/back/char_290_vigna.png"
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
            "Start": 1
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack": [
              0.4
            ]
          },
          "bounds": null
        }
      },
      "avatar": "/assets/kazdel/char/avatar/char_290_vigna.png",
      "avatarE2": "/assets/kazdel/char/avatar/char_290_vigna_2.png",
      "portrait": "/assets/kazdel/char/portrait/char_290_vigna_1.png",
      "portraitE2": "/assets/kazdel/char/portrait/char_290_vigna_2.png"
    },
    "char_120_hibisc": {
      "spine": {
        "front": {
          "skel": "/assets/kazdel/spine/op/char_120_hibisc/front/char_120_hibisc.skel",
          "atlas": "/assets/kazdel/spine/op/char_120_hibisc/front/char_120_hibisc.atlas",
          "textures": [
            "/assets/kazdel/spine/op/char_120_hibisc/front/char_120_hibisc.png"
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
            "die": "Die",
            "move": null,
            "stun": null
          },
          "animations": {
            "Attack": 1,
            "Default": 0,
            "Die": 1,
            "Idle": 4,
            "Start": 1
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
          "bounds": null
        },
        "back": {
          "skel": "/assets/kazdel/spine/op/char_120_hibisc/back/char_120_hibisc.skel",
          "atlas": "/assets/kazdel/spine/op/char_120_hibisc/back/char_120_hibisc.atlas",
          "textures": [
            "/assets/kazdel/spine/op/char_120_hibisc/back/char_120_hibisc.png"
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
            "Default": 0,
            "Idle": 1,
            "Start": 1
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
          "bounds": null
        }
      },
      "avatar": "/assets/kazdel/char/avatar/char_120_hibisc.png",
      "avatarE2": "/assets/kazdel/char/avatar/char_120_hibisc_2.png",
      "portrait": "/assets/kazdel/char/portrait/char_120_hibisc_1.png",
      "portraitE2": "/assets/kazdel/char/portrait/char_120_hibisc_2.png"
    },
    "char_131_flameb": {
      "spine": {
        "front": {
          "skel": "/assets/kazdel/spine/op/char_131_flameb/front/char_131_flameb.skel",
          "atlas": "/assets/kazdel/spine/op/char_131_flameb/front/char_131_flameb.atlas",
          "textures": [
            "/assets/kazdel/spine/op/char_131_flameb/front/char_131_flameb.png"
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
            "Attack": 1.5,
            "Default": 0,
            "Die": 1,
            "Idle": 4,
            "Skill_1": 1.5,
            "Skill_2": 1.333,
            "Skill_Die": 1,
            "Skill_Idle": 4,
            "Start": 1
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack": [
              0.567
            ],
            "Skill_1": [
              0.567
            ],
            "Skill_2": [
              0.467
            ]
          },
          "bounds": {
            "x": -173.798,
            "y": -1.559,
            "width": 398.998,
            "height": 563.459
          }
        },
        "back": {
          "skel": "/assets/kazdel/spine/op/char_131_flameb/back/char_131_flameb.skel",
          "atlas": "/assets/kazdel/spine/op/char_131_flameb/back/char_131_flameb.atlas",
          "textures": [
            "/assets/kazdel/spine/op/char_131_flameb/back/char_131_flameb.png"
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
            "Attack": 1.5,
            "Default": 0,
            "Idle": 4,
            "Skill_1": 1.5,
            "Skill_2": 1.333,
            "Skill_Idle": 4,
            "Start": 1
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack": [
              0.567
            ],
            "Skill_1": [
              0.567
            ],
            "Skill_2": [
              0.467
            ]
          },
          "bounds": {
            "x": -173.442,
            "y": -2.06,
            "width": 399,
            "height": 563.501
          }
        }
      },
      "avatar": "/assets/kazdel/char/avatar/char_131_flameb.png",
      "avatarE2": "/assets/kazdel/char/avatar/char_131_flameb_2.png",
      "portrait": "/assets/kazdel/char/portrait/char_131_flameb_1.png",
      "portraitE2": "/assets/kazdel/char/portrait/char_131_flameb_2.png"
    },
    "char_113_cqbw": {
      "spine": {
        "front": {
          "skel": "/assets/kazdel/spine/op/char_113_cqbw/front/char_113_cqbw.skel",
          "atlas": "/assets/kazdel/spine/op/char_113_cqbw/front/char_113_cqbw.atlas",
          "textures": [
            "/assets/kazdel/spine/op/char_113_cqbw/front/char_113_cqbw.png"
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
            "Attack": 1.467,
            "Attack_Down": 1.467,
            "Default": 0,
            "Die": 1,
            "Idle": 2.667,
            "Skill_1": 1.467,
            "Skill_2": 2.8,
            "Skill_3": 1.933,
            "Start": 1,
            "Stun": 0.833
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack": [
              0.4
            ],
            "Attack_Down": [
              0.4
            ],
            "Skill_1": [
              0.4
            ],
            "Skill_2": [
              0.267
            ],
            "Skill_3": [
              0.5
            ]
          },
          "bounds": {
            "x": -187.446,
            "y": -1.349,
            "width": 870.222,
            "height": 387.503
          }
        },
        "back": {
          "skel": "/assets/kazdel/spine/op/char_113_cqbw/back/char_113_cqbw.skel",
          "atlas": "/assets/kazdel/spine/op/char_113_cqbw/back/char_113_cqbw.atlas",
          "textures": [
            "/assets/kazdel/spine/op/char_113_cqbw/back/char_113_cqbw.png"
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
            "Attack": 1.467,
            "Default": 0,
            "Idle": 2.667,
            "Skill_1": 1.467,
            "Skill_2": 2.8,
            "Skill_3": 1.933,
            "Start": 1,
            "Stun": 0.833
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack": [
              0.4
            ],
            "Skill_1": [
              0.4
            ],
            "Skill_2": [
              0.267
            ],
            "Skill_3": [
              0.5
            ]
          },
          "bounds": {
            "x": -186.737,
            "y": -1.349,
            "width": 594.788,
            "height": 387.5
          }
        }
      },
      "avatar": "/assets/kazdel/char/avatar/char_113_cqbw.png",
      "avatarE2": "/assets/kazdel/char/avatar/char_113_cqbw_2.png",
      "portrait": "/assets/kazdel/char/portrait/char_113_cqbw_1.png",
      "portraitE2": "/assets/kazdel/char/portrait/char_113_cqbw_2.png"
    },
    "char_4088_hodrer": {
      "spine": {
        "front": {
          "skel": "/assets/kazdel/spine/op/char_4088_hodrer/front/char_4088_hodrer.skel",
          "atlas": "/assets/kazdel/spine/op/char_4088_hodrer/front/char_4088_hodrer.atlas",
          "textures": [
            "/assets/kazdel/spine/op/char_4088_hodrer/front/char_4088_hodrer.png"
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
                "loop": "Skill_2_Loop_A",
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
            "Attack": 2.5,
            "Default": 0,
            "Die": 1,
            "Idle": 1,
            "Skill_1": 2.5,
            "Skill_2_Begin": 0.2,
            "Skill_2_End": 0.2,
            "Skill_2_Idle": 1,
            "Skill_2_Loop_A": 2.5,
            "Skill_2_Loop_B": 2.5,
            "Skill_3_Begin": 1.5,
            "Skill_3_End": 0.2,
            "Skill_3_Idle": 1,
            "Skill_3_Loop": 2.5,
            "Skill_Down_3_Loop": 2.5,
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
              0.7
            ],
            "Skill_2_Loop_A": [
              0.767
            ],
            "Skill_2_Loop_B": [
              0.767
            ],
            "Skill_3_Loop": [
              0.7
            ],
            "Skill_Down_3_Loop": [
              0.7
            ]
          },
          "bounds": {
            "x": -184.407,
            "y": -1.438,
            "width": 529.743,
            "height": 439.14
          }
        },
        "back": {
          "skel": "/assets/kazdel/spine/op/char_4088_hodrer/back/char_4088_hodrer.skel",
          "atlas": "/assets/kazdel/spine/op/char_4088_hodrer/back/char_4088_hodrer.atlas",
          "textures": [
            "/assets/kazdel/spine/op/char_4088_hodrer/back/char_4088_hodrer.png"
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
                "loop": "Skill_2_Loop_A",
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
            "Attack": 2.5,
            "Default": 0,
            "Idle": 1,
            "Skill_1": 2.5,
            "Skill_2_Begin": 0.2,
            "Skill_2_End": 0.2,
            "Skill_2_Idle": 1,
            "Skill_2_Loop_A": 2.5,
            "Skill_2_Loop_B": 2.5,
            "Skill_3_Begin": 1.5,
            "Skill_3_End": 0.2,
            "Skill_3_Idle": 1,
            "Skill_3_Loop": 2.5,
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
              0.7
            ],
            "Skill_2_Loop_A": [
              0.767
            ],
            "Skill_2_Loop_B": [
              0.767
            ],
            "Skill_3_Loop": [
              0.7
            ]
          },
          "bounds": {
            "x": -184.407,
            "y": -1.438,
            "width": 529.743,
            "height": 439.14
          }
        }
      },
      "avatar": "/assets/kazdel/char/avatar/char_4088_hodrer.png",
      "avatarE2": "/assets/kazdel/char/avatar/char_4088_hodrer_2.png",
      "portrait": "/assets/kazdel/char/portrait/char_4088_hodrer_1.png",
      "portraitE2": "/assets/kazdel/char/portrait/char_4088_hodrer_2.png"
    },
    "char_4133_logos": {
      "spine": {
        "front": {
          "skel": "/assets/kazdel/spine/op/char_4133_logos/front/char_4133_logos.skel",
          "atlas": "/assets/kazdel/spine/op/char_4133_logos/front/char_4133_logos.atlas",
          "textures": [
            "/assets/kazdel/spine/op/char_4133_logos/front/char_4133_logos.png"
          ],
          "pma": false,
          "anims": {
            "idle": "Idle",
            "deploy": "Start",
            "attack": {
              "begin": null,
              "loop": "Attack_1",
              "end": null,
              "via": "attackAny"
            },
            "attackDown": null,
            "skill": {
              "begin": "Skill_1_Begin",
              "loop": "Skill_1_Attack",
              "end": null,
              "index": 0,
              "idle": "Skill_1_Idle"
            },
            "die": "Die",
            "move": null,
            "stun": null,
            "skills": {
              "0": {
                "begin": "Skill_1_Begin",
                "loop": "Skill_1_Attack",
                "end": null,
                "index": 0,
                "idle": "Skill_1_Idle"
              },
              "1": {
                "begin": "Skill_2_Begin",
                "loop": "Skill_2_Loop",
                "end": "Skill_2_End",
                "index": 1,
                "idle": null
              },
              "2": {
                "begin": "Skill_3_Begin",
                "loop": "Skill_3_Attack",
                "end": "Skill_3_End",
                "index": 2,
                "idle": "Skill_3_Idle"
              }
            }
          },
          "animations": {
            "Attack_1": 1.6,
            "Attack_2": 1.6,
            "Default": 0,
            "Die": 1,
            "Idle": 5,
            "Skill_1_Attack": 1.6,
            "Skill_1_Begin": 0.333,
            "Skill_1_Idle": 6.667,
            "Skill_2_Begin": 0.167,
            "Skill_2_End": 0.267,
            "Skill_2_Loop": 1,
            "Skill_3_Attack": 1.6,
            "Skill_3_Begin": 0.167,
            "Skill_3_End": 1.167,
            "Skill_3_Idle": 1.5,
            "Skill_Down_2_Begin": 0.167,
            "Skill_Down_2_End": 0.267,
            "Skill_Down_2_Loop": 1,
            "Start": 1
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack_1": [
              0.5
            ],
            "Attack_2": [
              0.5
            ],
            "Skill_1_Attack": [
              0.433
            ],
            "Skill_3_Attack": [
              0.667
            ],
            "Skill_3_End": [
              0.333
            ]
          },
          "bounds": {
            "x": -214.608,
            "y": -14.81,
            "width": 383.18,
            "height": 456.945
          }
        },
        "back": {
          "skel": "/assets/kazdel/spine/op/char_4133_logos/back/char_4133_logos.skel",
          "atlas": "/assets/kazdel/spine/op/char_4133_logos/back/char_4133_logos.atlas",
          "textures": [
            "/assets/kazdel/spine/op/char_4133_logos/back/char_4133_logos.png"
          ],
          "pma": false,
          "anims": {
            "idle": "Idle",
            "deploy": "Start",
            "attack": {
              "begin": null,
              "loop": "Attack_1",
              "end": null,
              "via": "attackAny"
            },
            "attackDown": null,
            "skill": {
              "begin": "Skill_1_Begin",
              "loop": "Skill_1_Attack",
              "end": null,
              "index": 0,
              "idle": "Skill_1_Idle"
            },
            "die": null,
            "move": null,
            "stun": null,
            "skills": {
              "0": {
                "begin": "Skill_1_Begin",
                "loop": "Skill_1_Attack",
                "end": null,
                "index": 0,
                "idle": "Skill_1_Idle"
              },
              "1": {
                "begin": "Skill_2_Begin",
                "loop": "Skill_2_Loop",
                "end": "Skill_2_End",
                "index": 1,
                "idle": null
              },
              "2": {
                "begin": "Skill_3_Begin",
                "loop": "Skill_3_Attack",
                "end": "Skill_3_End",
                "index": 2,
                "idle": "Skill_3_Idle"
              }
            }
          },
          "animations": {
            "Attack_1": 1.6,
            "Attack_2": 1.6,
            "Default": 0,
            "Idle": 5,
            "Skill_1_Attack": 1.6,
            "Skill_1_Begin": 0.333,
            "Skill_1_Idle": 6.667,
            "Skill_2_Begin": 0.167,
            "Skill_2_End": 0.267,
            "Skill_2_Loop": 1,
            "Skill_3_Attack": 1.6,
            "Skill_3_Begin": 0.167,
            "Skill_3_End": 1.167,
            "Skill_3_Idle": 1.5,
            "Start": 1
          },
          "events": [
            "OnAttack",
            "OnStart"
          ],
          "hits": {
            "Attack_1": [
              0.5
            ],
            "Attack_2": [
              0.5
            ],
            "Skill_1_Attack": [
              0.433
            ],
            "Skill_3_Attack": [
              0.667
            ],
            "Skill_3_End": [
              0.333
            ]
          },
          "bounds": {
            "x": -214.608,
            "y": -14.368,
            "width": 351.676,
            "height": 456.503
          }
        }
      },
      "avatar": "/assets/kazdel/char/avatar/char_4133_logos.png",
      "avatarE2": "/assets/kazdel/char/avatar/char_4133_logos_2.png",
      "portrait": "/assets/kazdel/char/portrait/char_4133_logos_1.png",
      "portraitE2": "/assets/kazdel/char/portrait/char_4133_logos_2.png"
    },
    "char_219_meteo": {
      "spine": {
        "front": {
          "skel": "/assets/kazdel/spine/op/char_219_meteo/front/char_219_meteo.skel",
          "atlas": "/assets/kazdel/spine/op/char_219_meteo/front/char_219_meteo.atlas",
          "textures": [
            "/assets/kazdel/spine/op/char_219_meteo/front/char_219_meteo.png"
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
            "Attack": 0.967,
            "Default": 0,
            "Die": 1,
            "Idle": 2,
            "Skill": 1.033,
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
            "Skill": [
              0.4
            ]
          },
          "bounds": {
            "x": -144.963,
            "y": -0.006,
            "width": 373.419,
            "height": 361.466
          }
        },
        "back": {
          "skel": "/assets/kazdel/spine/op/char_219_meteo/back/char_219_meteo.skel",
          "atlas": "/assets/kazdel/spine/op/char_219_meteo/back/char_219_meteo.atlas",
          "textures": [
            "/assets/kazdel/spine/op/char_219_meteo/back/char_219_meteo.png"
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
            "Attack": 0.967,
            "Default": 0,
            "Idle": 2,
            "Skill": 0.967,
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
            "Skill": [
              0.267
            ]
          },
          "bounds": null
        }
      },
      "avatar": "/assets/kazdel/char/avatar/char_219_meteo.png",
      "avatarE2": "/assets/kazdel/char/avatar/char_219_meteo_2.png",
      "portrait": "/assets/kazdel/char/portrait/char_219_meteo_1.png",
      "portraitE2": "/assets/kazdel/char/portrait/char_219_meteo_2.png"
    }
  },
  "skills": {
    "skcom_heal_up[1]": "/assets/kazdel/skill/skcom_heal_up_1.png",
    "skcom_atk_up[2]": "/assets/kazdel/skill/skcom_atk_up_2.png",
    "skchr_vigna_1": "/assets/kazdel/skill/skcom_atk_up_2.png",
    "skchr_flameb_1": "/assets/kazdel/skill/skchr_flameb_1.png",
    "skchr_vigna_2": "/assets/kazdel/skill/skchr_vigna_2.png",
    "skchr_flameb_2": "/assets/kazdel/skill/skchr_flameb_2.png",
    "skchr_cqbw_1": "/assets/kazdel/skill/skchr_cqbw_1.png",
    "skcom_atk_up[3]": "/assets/kazdel/skill/skcom_atk_up_3.png",
    "skchr_cqbw_2": "/assets/kazdel/skill/skchr_cqbw_2.png",
    "skchr_chimes_2": "/assets/kazdel/skill/skchr_chimes_2.png",
    "skchr_cqbw_3": "/assets/kazdel/skill/skchr_cqbw_3.png",
    "skchr_hodrer_1": "/assets/kazdel/skill/skchr_hodrer_1.png",
    "skchr_hodrer_2": "/assets/kazdel/skill/skchr_hodrer_2.png",
    "skchr_hodrer_3": "/assets/kazdel/skill/skchr_hodrer_3.png",
    "skchr_logos_1": "/assets/kazdel/skill/skchr_logos_1.png",
    "skchr_logos_2": "/assets/kazdel/skill/skchr_logos_2.png",
    "skchr_logos_3": "/assets/kazdel/skill/skchr_logos_3.png",
    "skchr_meteo_1": "/assets/kazdel/skill/skchr_meteo_1.png",
    "skchr_meteo_2": "/assets/kazdel/skill/skchr_meteo_2.png"
  },
  "skillsById": {
    "skcom_heal_up[1]": "skcom_heal_up[1]",
    "skchr_vigna_1": "skcom_atk_up[2]",
    "skchr_flameb_1": "skchr_flameb_1",
    "skchr_vigna_2": "skchr_vigna_2",
    "skchr_flameb_2": "skchr_flameb_2",
    "skchr_cqbw_1": "skchr_cqbw_1",
    "skcom_atk_up[3]": "skcom_atk_up[3]",
    "skchr_cqbw_2": "skchr_cqbw_2",
    "skchr_chimes_2": "skchr_chimes_2",
    "skchr_cqbw_3": "skchr_cqbw_3",
    "skchr_hodrer_1": "skchr_hodrer_1",
    "skchr_hodrer_2": "skchr_hodrer_2",
    "skchr_hodrer_3": "skchr_hodrer_3",
    "skchr_logos_1": "skchr_logos_1",
    "skchr_logos_2": "skchr_logos_2",
    "skchr_logos_3": "skchr_logos_3",
    "skchr_meteo_1": "skchr_meteo_1",
    "skchr_meteo_2": "skchr_meteo_2"
  },
  "modules": {
    "uniequip_002_vigna": "/assets/kazdel/module/uniequip_002_vigna.png",
    "uniequip_002_flameb": "/assets/kazdel/module/uniequip_002_flameb.png",
    "uniequip_002_chimes": "/assets/kazdel/module/uniequip_002_chimes.png",
    "uniequip_002_cqbw": "/assets/kazdel/module/uniequip_002_cqbw.png",
    "uniequip_003_cqbw": "/assets/kazdel/module/uniequip_003_cqbw.png",
    "uniequip_002_hodrer": "/assets/kazdel/module/uniequip_002_hodrer.png",
    "uniequip_003_hodrer": "/assets/kazdel/module/uniequip_003_hodrer.png",
    "uniequip_002_logos": "/assets/kazdel/module/uniequip_002_logos.png",
    "uniequip_003_logos": "/assets/kazdel/module/uniequip_003_logos.png",
    "uniequip_002_meteo": "/assets/kazdel/module/uniequip_002_meteo.png"
  }
};
