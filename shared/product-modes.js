import {ZHAJING_VARIANT} from './zhajing-constants.js';
// Product gameplay registry. New variants share the hall and opening policy without changing the main hub.
import {CYCLOPS_VARIANT, CYCLOPS_MAX_SEATS} from './constants.js';
import {N_} from './i18n.js';

import {MIZUKI_VARIANT} from './mizuki-constants.js';

export const PRODUCT_MODES = Object.freeze([
  Object.freeze({id: ZHAJING_VARIANT, name: N_('炸惊模拟'), english: 'ZHAJING SIMULATION', icon: 'bolt',
    description: N_('选择惊变、锻造与专属干员，组合盟约成长，挑战敌方惊变和最终攻势。'),
    rules: Object.freeze([N_('1–4 人 · 独立棋库与经济'), N_('99 种惊变 · 18 组惊变羁绊 · 锻造器'), N_('14 回合最终攻势 · 不参与排位')]),
    players: 4, roomMode: 'coop', defaultEnabled: true, ranked: false, contentPacks: false, versionSelection: false, engine: 'zhajing'}),
  Object.freeze({id: MIZUKI_VARIANT, name: N_('水月与深蓝之树'), english: 'MIZUKI & CAERULA ARBOR', icon: 'snow',
    description: N_('与同伴深入海洋，在招募、事件与分路探索中构筑队伍，挑战不同结局。'),
    rules: Object.freeze([N_('N0–N18 · 一至四人联合探索'), N_('备战布阵 · 服务器自动战斗'), N_('认知全开 · 独立投资与探索记录')]),
    players: 4, roomMode: 'coop', defaultEnabled: false, ranked: false, contentPacks: false,
    versionSelection: false, engine: 'mizuki', history: 'mizuki'}),
  Object.freeze({id: CYCLOPS_VARIANT, name: N_('舟铲铲'), english: 'CYCLOPS ASSAULT', icon: 'rook',
    description: N_('通过三次馈赠强化与第十回合征召，构筑阵容抵御最终攻势。'),
    rules: Object.freeze([N_('21 回合 · 第 5、10、15 回合馈赠'), N_('第十回合征召 · 每组至多四人'), N_('支持已适配测试包 · 不参与排位')]),
    players: CYCLOPS_MAX_SEATS, roomMode: 'coop', defaultEnabled: true}),
]);

export const productMode = id => PRODUCT_MODES.find(mode => mode.id === id) || null;
