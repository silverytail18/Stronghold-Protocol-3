// Higashi test-11: 3/6/9 tiers; eight new plus three existing operators.
export const PARAMETERS={
  "status": "integrated-test",
  "releaseVersion": "0.9.2",
  "batchId": "higashi-test-11",
  "balanceStatus": "pending",
  "designVersion": "2.0",
  "baselineVersion": "0.5.14",
  "date": "2026-10-27",
  "packageIdProposal": "higashi-expansion-v1",
  "batchIdProposal": "higashi-test-1",
  "core": {
    "id": "higashiShip",
    "name": "东国",
    "thresholds": [
      3,
      6,
      9
    ],
    "layerCap": 999,
    "atkBasePercent": 22,
    "atkPercentPerLayer": 0.14,
    "defBasePercent": 20,
    "defPercentPerLayer": 0.08,
    "parryCooldown": 6,
    "parryReduction6": 0.27,
    "stanceCap": 100,
    "startingStance": 100,
    "nativeAttackGain": 4,
    "nativeAttackGainCapPerSecond": 8,
    "parryGain": 6,
    "ninjutsuGain": 4,
    "ninjutsuGainCooldown": 3,
    "allSourceGainCapPerSecond": 14,
    "idleAfter": 6,
    "idleDecayPerSecond": 4,
    "releaseEarliest": 1.2,
    "releaseCooldown": 7,
    "window": 3,
    "returnMinimumInterval": 0.8,
    "damageBase": 350,
    "damageLinearPerLayer": 4,
    "damageCurveStarts": 200,
    "damageQuadratic": 0.01,
    "damageCurrentAtkRatio": 1,
    "returnArtsRatio": 0.8,
    "defIgnore6": 0.2,
    "harmonyPolicy": "counts-as-current-baseline; attributes-only; no identity parry/stance/release/personal-growth",
    "hpBonuses": [
      0.2,
      0.25,
      0.35
    ],
    "blockBonuses": [
      1,
      1,
      2
    ],
    "parryReductions": [
      0.23,
      0.27,
      0.33
    ],
    "parryDuration": 3,
    "startingStances": [
      100,
      100,
      100
    ],
    "passiveGains": [
      4,
      5,
      6
    ],
    "releaseCooldowns": [
      8,
      7,
      6
    ],
    "releaseScales": [
      0.85,
      1,
      1.1
    ],
    "windIntervals": [
      2.2,
      1.8,
      1.5
    ],
    "windTargets": [
      2,
      3,
      4
    ],
    "windAtkRatios": [
      1,
      1.2,
      1.4
    ],
    "windBaseRatio": 0.2,
    "windRadius": 2.5,
    "defIgnore9": 0.3,
    "blockingDefenses": [
      25,
      35,
      55
    ],
    "blockingReductions": [
      0.08,
      0.1,
      0.15
    ],
    "windAirReservations": [
      1,
      2,
      2
    ]
  },
  "addon": {
    "id": "higashiNinjutsuShip",
    "name": "忍术策应",
    "thresholds": [
      2,
      4
    ],
    "noLayers": true,
    "members": [
      "宴",
      "风丸",
      "白雪",
      "绮良"
    ],
    "damageRatios": [
      0.8,
      1.2
    ],
    "slow": 0.35,
    "slowDurations": [
      2,
      2.5
    ],
    "markCooldowns": [
      5,
      4
    ],
    "markDuration": 6,
    "markMax": 1,
    "slows": [
      0.35,
      0.4
    ],
    "splashRadius": 1,
    "splashMax": 2,
    "splashRatio": 0.5
  },
  "growth": {
    "restByTier": [
      6,
      12,
      14
    ],
    "parriesPerLayer": 2,
    "layersPerEffectiveRelease": 2,
    "personalCaps": [
      6,
      8
    ],
    "legacyGenericGrowth": "preserved including Hoshiguma gain-all-own-bonds; excluded from new-source caps; final cap 999",
    "growthPhases": [
      "normal"
    ],
    "targetLayersR20Unverified": [
      650,
      750
    ],
    "parryCapsByTier": [
      4,
      6,
      6
    ],
    "releaseCapsByTier": [
      6,
      8,
      10
    ],
    "performanceCapsByTier": [
      10,
      14,
      16
    ],
    "teamPersonalCapsByTier": [
      20,
      32,
      36
    ],
    "theoreticalCapsByTier": [
      36,
      58,
      66
    ],
    "participation": [
      2,
      3
    ]
  },
  "operators": [
    {
      "name": "黑角",
      "key": "noirc",
      "charId": "char_500_noirc",
      "tier": 1,
      "new": true,
      "bonds": [
        "higashiShip",
        "indomShip"
      ],
      "defaultSkill": null
    },
    {
      "name": "宴",
      "charId": "char_337_utage",
      "tier": 1,
      "new": false,
      "existingId": "chess_char_1_18_a",
      "appendBonds": [
        "higashiShip",
        "higashiNinjutsuShip"
      ]
    },
    {
      "name": "缠丸",
      "key": "gyuki",
      "charId": "char_289_gyuki",
      "tier": 2,
      "new": true,
      "bonds": [
        "higashiShip",
        "indomShip"
      ],
      "defaultSkill": 0
    },
    {
      "name": "风丸",
      "charId": "char_4016_kazema",
      "tier": 2,
      "new": false,
      "existingId": "chess_char_2_11_a",
      "appendBonds": [
        "higashiShip",
        "higashiNinjutsuShip"
      ]
    },
    {
      "name": "白雪",
      "key": "yuki",
      "charId": "char_118_yuki",
      "tier": 3,
      "new": true,
      "bonds": [
        "higashiShip",
        "preciShip",
        "higashiNinjutsuShip"
      ],
      "defaultSkill": 1
    },
    {
      "name": "绮良",
      "key": "kirara",
      "charId": "char_478_kirara",
      "tier": 3,
      "new": true,
      "bonds": [
        "higashiShip",
        "soloShip",
        "higashiNinjutsuShip"
      ],
      "defaultSkill": 1
    },
    {
      "name": "赤冬",
      "key": "akafyu",
      "charId": "char_475_akafyu",
      "tier": 4,
      "new": true,
      "bonds": [
        "higashiShip",
        "indomShip"
      ],
      "defaultSkill": 1
    },
    {
      "name": "吉星",
      "key": "kichi",
      "charId": "char_4203_kichi",
      "tier": 4,
      "new": true,
      "bonds": [
        "higashiShip",
        "preciShip"
      ],
      "defaultSkill": 1
    },
    {
      "name": "星熊",
      "charId": "char_136_hsguma",
      "tier": 4,
      "new": false,
      "existingId": "chess_char_4_17_a",
      "appendBonds": [
        "higashiShip"
      ]
    },
    {
      "name": "遥",
      "key": "haruka",
      "charId": "char_4202_haruka",
      "tier": 5,
      "new": true,
      "bonds": [
        "higashiShip",
        "deputShip"
      ],
      "defaultSkill": 1
    },
    {
      "name": "斩业星熊",
      "key": "hsgma2",
      "charId": "char_1044_hsgma2",
      "tier": 6,
      "new": true,
      "bonds": [
        "higashiShip",
        "yanShip",
        "indomShip"
      ],
      "defaultSkill": 0
    }
  ],
  "strategies": [
    {
      "id": "band_higashi_defend",
      "name": "守土之约",
      "hp": 30,
      "parryReduction6": 0.3,
      "window": 3,
      "startingStance": 75,
      "parryReduction8": 0.35,
      "parryBonus": 0.05,
      "parryDurationBonus": 1
    },
    {
      "id": "band_higashi_market",
      "name": "町巷联络",
      "hp": 26,
      "shopThresholds": [
        2,
        4
      ],
      "fixedTierCaps": [
        2,
        4
      ],
      "maxCandidates": 3,
      "grantsEach": 1,
      "usesSharedStock": true
    }
  ],
  "items": [
    {
      "key": "higashi_seal",
      "name": "町奉行印笼",
      "category": "dedicated-conversion",
      "tier": 3,
      "normalPrice": 2,
      "atkPercent": [
        20,
        35
      ],
      "giveBondId": "higashiShip",
      "requiresTransformingIsomorph": true,
      "spOnEffectiveParry": [
        2,
        3
      ],
      "parrySpCooldown": 8,
      "parrySpWindow": 4,
      "parrySpGrantOnNextNativeAction": true,
      "parrySpMaxStored": 1
    },
    {
      "key": "higashi_talisman",
      "name": "折返护符",
      "category": "general",
      "tier": 4,
      "normalPrice": 2,
      "atkPercent": [
        15,
        25
      ],
      "nativeActionsToShield": 3,
      "shieldBaseHpRatios": [
        0.08,
        0.12
      ],
      "shieldDuration": 4,
      "shieldCooldown": 8,
      "noBondRequirement": true,
      "noGiveBondId": true
    }
  ],
  "explicitCultivationExceptions": {
    "twoStarElite": "Noir Corne only: E0 Lv30 actual original base, fan-game elite preparation x1.20 HP/ATK/DEF; no original skill/module invented",
    "newSixTierModule": "one level for initial private trial; existing six-tier modules untouched"
  },
  "initialBanWeightProposal": 0,
  "publicBanWeightProposalRequiresLaterApproval": 10,
  "noGameplayValidationPerformed": true,
  "ultimate": {
    "unlockCount": 6,
    "cap": 100,
    "starting": 0,
    "effectiveReleaseGain": 20,
    "parryGain": 3,
    "parryGainCapPerSecond": 9,
    "engagedGainPerSecond": 2,
    "cooldowns": [
      18,
      16
    ],
    "holdSeconds": 3,
    "hitDelay": 0.35,
    "damageBaseRatios": [
      2.6,
      3
    ],
    "attackSumRatios": [
      0.5,
      0.6
    ],
    "slow": 0.6,
    "slowDuration": 3,
    "shieldRatios": [
      0.08,
      0.12
    ],
    "shieldDuration": 4,
    "damageType": "true",
    "currentHpRatio": 0.05,
    "stunDuration": 1
  },
  "duel": {
    "hasteStarts": 200,
    "hasteFull": 700,
    "lateHaste": [
      20,
      55,
      70
    ],
    "cutCap": 12,
    "damagePerCut": [
      0,
      0.05,
      0.06
    ],
    "familyInterval": 0.5,
    "gainCapPerSecond": 4,
    "decayAfter": 4,
    "decayInterval": 1,
    "participationWindow": 4,
    "comboDuration": 4,
    "comboCooldown": 12,
    "comboHaste": [
      0,
      40,
      50
    ],
    "comboDefIgnore": [
      0,
      0.25,
      0.3
    ]
  }
};
