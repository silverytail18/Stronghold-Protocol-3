// 5.7 fixed personal garrisons and approved round blade.
export const SPEC = {
  "traits": {
    "version": 2,
    "combatActivation": "individual: no covenant requirement",
    "minimumPopulation": 0,
    "commonBlock": [
      1,
      1,
      1
    ],
    "blockScope": "all real melee operators when Kazdel active",
    "pressureProtection": [
      0,
      0,
      0
    ],
    "nativeMembers": 11,
    "layerUnlocks": false,
    "ordinaryCap": 6,
    "eliteCap": 10
  },
  "version": "fixed-personal-garrison-2",
  "designVersion": "5.7",
  "status": "verified",
  "runtimeVersion": "5.7",
  "layerCap": 999,
  "tiers": [
    3,
    6,
    9
  ],
  "hpBase": [
    0.1,
    0.15,
    0.2
  ],
  "hpPerLayer": 0.005,
  "nativeDamagePerLayer": [
    0.002,
    0.0035,
    0.005
  ],
  "damageScope": "core beneficiary native phys/arts/true HP damage only; excludes all Kazdel-generated damage, element gauges/bursts, healing and summons",
  "capacity": {
    "base": 1000,
    "perLayer": 25,
    "storageScale": 2,
    "perMemberScale": 0.2,
    "permanentHpScale": 0.15,
    "distinctRealIdentities": true
  },
  "generation": {
    "budgetBase": [
      10000,
      10000,
      14000
    ],
    "budgetPerLayer": [
      80,
      80,
      180
    ],
    "rateBase": 400,
    "ratePerLayer": 5,
    "conversionBase": [
      0.3,
      0.35,
      0.4
    ],
    "conversionPerLayer": 0.0003,
    "conversionCap": 0.6,
    "budgetOpeningCapacityScale": 3,
    "lifetimeCapEnabled": false,
    "nativeLimitScope": "per game second",
    "attackFloorRates": [
      0.003,
      0.006,
      0.007
    ],
    "attackFloorCooldown": 1,
    "capacityRates": [
      0.12,
      0.15,
      0.18
    ],
    "nativeDamageRates": [
      0.1,
      0.18,
      0.2
    ],
    "nativeBudgetFraction": 0.35
  },
  "defer": {
    "base": 0.2,
    "perLayer": 0.0003,
    "cap": 0.45,
    "delay": 6
  },
  "curse": {
    "base": [
      375,
      500,
      650
    ],
    "perLayer": [
      0.25,
      0.65,
      0.85
    ],
    "currentFireRate": [
      0.0005,
      0.002,
      0.003
    ],
    "airMultiplier": 2,
    "groundMultiplier": 1,
    "spawnDelay": 1,
    "interval": 2,
    "rangeScope": "whole field while a live deployed actual member exists",
    "overlapStacks": false,
    "nativeDamageAmplificationApplies": false,
    "layerBasis": [
      "L",
      "G",
      "G"
    ]
  },
  "release": {
    "rescueInterval": [
      8,
      6,
      4
    ],
    "rescueTargets": [
      1,
      2,
      2
    ],
    "hpBelow": 0.35,
    "hpTarget": 0.5,
    "maxSpendScale": 1.25,
    "nineRescueTrueScale": 0.5,
    "guardReadyAttackReserve": [
      0.5,
      0.75,
      1.1
    ],
    "dangerReserve": 1.1
  },
  "guard": {
    "baseCd": 10,
    "maximumCdReduction": 0.5,
    "requiredFireScale": 1,
    "costScale": 0.5,
    "sharedAcrossOwnTeam": true
  },
  "growth": {
    "prep": [
      6,
      10,
      15
    ],
    "performanceCap": [
      18,
      30,
      40
    ],
    "flowThresholdOfOpeningHp": 0.25,
    "flowScope": "converted members only; eleven native members use personal conditions",
    "ordinaryReward": 1,
    "eliteReward": 2,
    "ordinaryCap": 6,
    "eliteCap": 10,
    "earningTierLocked": true,
    "settlementCap": "min(previous normal battle tier cap, current prep tier cap); eligible surviving-board names only",
    "excluded": [
      "Kazdel rescue healing",
      "pure debt repayment",
      "shield absorption except native Mudrock final shield break",
      "HP initialization",
      "cleanup",
      "duplicate copies",
      "boss/hidden/coop replay gains"
    ],
    "participationSeconds": 8,
    "participationReward": [
      1,
      2
    ],
    "includesSkillCycleActualHp": "converted core only; natural core uses personal conditions"
  },
  "initialFireCountsBudget": false,
  "blood": {
    "tiers": [
      2,
      4
    ],
    "layerCap": 999,
    "prep": [
      2,
      4
    ],
    "performanceCap": [
      8,
      16
    ],
    "performanceScale": 0.5,
    "conversionBase": [
      0.02,
      0.04
    ],
    "conversionPerLayer": [
      0.0002,
      0.0003
    ],
    "nativeHealingPerLayer": [
      0.0001,
      0.0002
    ],
    "shieldBase": 200,
    "shieldPerLayer": 4,
    "shieldDuration": 4,
    "shieldCd": 10,
    "shieldProcsPerName": 3,
    "wholeOwnTeam": true,
    "newSkillCycleGrowthExcluded": true,
    "flowThresholdOfOpeningHp": 0.5,
    "ordinaryCap": 4,
    "eliteCap": 8
  },
  "contentCounts": {
    "naturalCoreMembers": 11,
    "newOperators": 7,
    "newAddonBonds": 1,
    "strategies": 2,
    "items": 2
  },
  "roster": {
    "naturalCore": [
      "魔王",
      "华法琳",
      "泥岩",
      "史尔特尔",
      "红豆",
      "芙蓉",
      "炎客",
      "陨星",
      "W",
      "赫德雷",
      "逻各斯"
    ],
    "newOperators": [
      "红豆",
      "芙蓉",
      "炎客",
      "陨星",
      "W",
      "赫德雷",
      "逻各斯"
    ],
    "naturalBlood": [
      "芙蓉",
      "炎客",
      "华法琳",
      "赫德雷"
    ],
    "removedNewOperator": "铎铃",
    "existingTagChanges": [
      {
        "baseId": "chess_char_4_26_a",
        "name": "华法琳",
        "tier": 4,
        "addBond": "bloodlineShip",
        "preserveBonds": [
          "miraShip",
          "kazdelShip"
        ],
        "allowThreeBonds": true
      }
    ],
    "meteorite": {
      "charId": "char_219_meteo",
      "designBaseId": "chess_kz_meteo_a",
      "tier": 3,
      "bonds": [
        "kazdelShip"
      ],
      "defaultSkillIndex": 0,
      "skillLevels": [
        4,
        7
      ],
      "normalStatus": {
        "phase": 2,
        "level": 1,
        "moduleLevel": 0
      },
      "eliteStatus": {
        "phase": 2,
        "level": 60,
        "moduleLevel": 1
      },
      "moduleId": "uniequip_002_meteo",
      "growthUsesSharedCoreFlowRule": false,
      "growthRule": "three distinct action-target blast hits per award",
      "extraAcquisitionGrowth": false,
      "implementationStatus": "implemented"
    }
  },
  "unchanged": [
    "Hodrer native healing 15%",
    "Kazdel flag plus morph item grants Kazdel identity",
    "guard does not prevent Surtr forced retreat",
    "original boss single-hit cancellation",
    "native range and aerial eligibility"
  ],
  "appVersion": "0.4.10",
  "batchVersion": "kazdel-test-9",
  "clientCapability": 28,
  "theresa": {
    "firstRoundGift": null,
    "rounds": [
      3,
      5
    ],
    "candidateCount": 3,
    "naturalKazdelOnly": true,
    "normalPermanent": true,
    "price": 0,
    "requiresCoreCount": false,
    "tierLockedOn": "first open or triggering round prep end",
    "stockAware": true
  },
  "openingFire": {
    "baseScale": [
      1,
      1.3,
      1.4
    ],
    "hpScale": [
      0.04,
      0.05,
      0.06
    ],
    "capScale": [
      1.3,
      1.8,
      1.9
    ],
    "countsBudget": false,
    "reissueInUnite": false
  },
  "skillCycle": {
    "currentHpLoss": 0.1,
    "floor": 1,
    "recoveryMultiplier": 2,
    "recoverySeconds": 1,
    "bloodGrowth": false
  },
  "sp": {
    "minimumTier": 6,
    "naturalScale": 1.2
  },
  "followUp": {
    "arts": [
      1.2,
      1.8,
      1.8
    ],
    "nineTrue": 1.25,
    "minSpend": 1,
    "perUnitCooldown": 0.5,
    "spendRates": [
      0.3,
      0.6
    ],
    "actionCaps": [
      0.2,
      0.4
    ],
    "allowanceCapScale": 1,
    "allowanceRefill": [
      0.25,
      0.45,
      0.6
    ],
    "healMark": {
      "seconds": 4,
      "weight": 1.5
    },
    "nativeRecursion": false
  },
  "melee": {
    "minimumPopulation": 6,
    "vortex": {
      "cooldown": 2,
      "forwardTiles": 1,
      "artsFormula": "800 + 120*N + 2*G + .05*Q*paidFraction",
      "costScale": 0.03
    },
    "sword": {
      "cooldown": 1,
      "travelTiles": 5,
      "speed": 5,
      "width": 1,
      "originForwardTiles": 1,
      "travelSeconds": 1,
      "artsFormula": "1250 + 160*N + 3*G + .06*Q*paidFraction",
      "trueFraction": 0.3,
      "costScale": 0.04
    },
    "perUnitCooldown": true,
    "validConvertedMembers": true,
    "airTargets": true,
    "paidPerTargetFull": true,
    "requiresNativeNonSkillAttack": true,
    "requiresGroundDeploymentAndState": true
  },
  "resonance": {
    "minimumPopulation": 9,
    "fireThresholdScale": 1.1,
    "duration": 6,
    "cooldown": 16,
    "paidTrueScale": 3.05,
    "allowanceRefillPerSecond": 1,
    "changesNativeType": false
  },
  "decay": {
    "enemyGraceSeconds": 8,
    "ratePerSecond": 0.015,
    "activeRatePerSecond": 0.005,
    "activitySeconds": 5
  },
  "nativeDamageBase": [
    0,
    0.25,
    0.4
  ],
  "offensiveGrowth": {
    "formula": "G = L + .9*L*(1-L/999)",
    "applies": [
      "tier6/9 native damage",
      "vortex/sword base damage",
      "tier6/9 curse base"
    ],
    "changesLayerCount": false,
    "layerUnlocks": false
  }
};
