// Extend this list to add a grantable operator. Server filters against this match's enabled batches/data.
export const TEST_OPERATOR_CATALOG=Object.freeze([
  ...['otter','halo','mgllan','astesi','slent2','ifrit'].map(key=>Object.freeze({baseId:`chess_rhine_${key}_a`,normalId:`chess_rhine_${key}_a`,eliteId:`chess_rhine_${key}_b`,batch:'rhine-lab-v1'})),
  Object.freeze({baseId:'chess_exp_clemnt_a',normalId:'chess_exp_clemnt_a',eliteId:'chess_exp_clemnt_b',batch:'arknights-expansion-v1'}),
  Object.freeze({baseId:'chess_exp_shu_a',normalId:'chess_exp_shu_a',eliteId:'chess_exp_shu_b',batch:'arknights-expansion-v1'}),
  Object.freeze({baseId:'chess_exp_aglna2_a',normalId:'chess_exp_aglna2_a',eliteId:'chess_exp_aglna2_b',batch:'rhodes-mujica-v1'}),
  Object.freeze({baseId:'chess_rm_kalts2_a',normalId:'chess_rm_kalts2_a',eliteId:'chess_rm_kalts2_b',batch:'rhodes-mujica-v1'}),
  Object.freeze({baseId:'chess_rm_nearl_a',normalId:'chess_rm_nearl_a',eliteId:'chess_rm_nearl_b',batch:'rhodes-mujica-v1'}),
  ...['dolris','amoris','mortis','tmoris','oblvns'].map(key=>Object.freeze({baseId:`chess_rm_${key}_a`,normalId:`chess_rm_${key}_a`,eliteId:`chess_rm_${key}_b`,batch:'rhodes-mujica-v1'})),
  ...['vigna','hibisc','flameb','meteo','cqbw','hodrer','logos'].map(key=>Object.freeze({baseId:`chess_kz_${key}_a`,normalId:`chess_kz_${key}_a`,eliteId:`chess_kz_${key}_b`,batch:'kazdel-expansion-v1'})),
]);
