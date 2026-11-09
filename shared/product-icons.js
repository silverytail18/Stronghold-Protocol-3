// Authored UI symbols for project-only concepts, not official extracted artwork. Kept in code for every client.
import {MASTERY_ITEM_ID,PRTS_ITEM_ID,MASTERY_ICON,PRTS_ICON} from './skill-mastery.js';
const shapes={
 penguinShip:'M22 9c-10 9-14 31-9 42l10-5 9 9 9-9 10 5c5-11 1-33-9-42ZM24 23h2M38 23h2M27 31l5 5 5-5',
 suiShip:'M10 39c2-18 12-28 26-25-9 4-13 10-12 18 8-8 19-10 27-5-2 20-22 31-39 19m15-7 14-4',
 snowfieldGuideShip:'M32 6v52M9 19l46 26M9 45l46-26M24 12l8 8 8-8M24 52l8-8 8 8',
 knightPreparationShip:'M15 10h34v25c0 13-17 23-17 23S15 48 15 35Zm9 9h16M32 19v23M23 33h18',
 lateranoSupportShip:'M10 24h37v12H29v17H19V36h-9Zm5-10h35M42 36l8 8',
 girlbandShip:'M24 42V14l28-6v28M24 22l28-6M24 42c0 10-17 12-17 4s17-12 17-4Zm28-6c0 10-17 12-17 4s17-12 17-4Z',
 kazdelShip:'M12 53h40M17 48V26l15-9 15 9v22M10 12l12 9M54 12l-12 9M32 7v43M24 33l8 10 8-10',
 bloodlineShip:'M32 6S12 29 12 40a20 20 0 0 0 40 0C52 29 32 6 32 6Zm0 19v25M23 37h18',
 rhineShip:'M32 11v42M11 32h42M17 17l30 30M17 47l30-30 M32 5a27 27 0 1 0 0 54 27 27 0 0 0 0-54Z',
 specialResearchShip:'M24 7h16M27 7v18L12 50c-2 5 2 8 6 8h28c4 0 8-3 6-8L37 25V7M21 39h22',
 higashiNinjutsuShip:'M32 5l7 19 20 8-20 7-7 20-7-20-20-7 20-8Zm0 19v16M24 32h16',
 ursusStudentShip:'M8 14h19l5 6 5-6h19v36H37l-5 5-5-5H8Zm24 6v35M15 24h10M15 32h10M39 24h10M39 32h10',
 rm_terminal:'M10 10h44v36H10ZM22 57h20M32 46v11M17 33h6l5-12 8 16 5-8h7',
 kazdel_memory_standard:'M15 58V7l35 7-8 11 8 11-35-7M8 58h18',
 field_medic_bandage:'M12 19l7-7 33 33-7 7ZM12 45l33-33 7 7-33 33ZM27 27h10v10H27',
 rhine_field_controller:'M7 15h50v34H7ZM14 25h14M14 38h14M38 22v20M32 30h12M22 49v8M42 49v8',
 rhine_sampler:'M24 7h16M26 7v34a12 12 0 0 0 24 0V7M26 32h24M16 15v34M9 25h14M9 39h14',
 higashi_seal:'M20 9h24v17H20ZM14 26h36v25H14ZM9 58h46M25 35h14v9H25',
 higashi_talisman:'M20 7h24l8 13-8 37H20L12 20ZM32 9v44M24 22h16M23 34l18-8M24 44h16',
 ursus_badge:'M12 7h16l4 12 4-12h16L42 29l4 26-14-8-14 8 4-26ZM24 32h16M32 25v16',
 ursus_survey:'M17 56l15-29 15 29M32 27V7M21 13h22v13H21ZM9 56h46M32 39l18-9',
 iberia_lamp:'M22 8h20M26 8v10h12V8M17 22h30l5 31H12ZM24 33l8-7 8 7-8 14Z',
 iberia_eye:'M5 32s9-19 27-19 27 19 27 19-9 19-27 19S5 32 5 32Zm27-12a12 12 0 1 0 0 24 12 12 0 0 0 0-24Z',
};
const people={band_exp_nian:'char_2014_nian',band_exp_bison:'char_325_bison',band_exp_liangxun:'npc_100_liangxun',band_rm_kaltsit:'char_003_kalts',band_rm_closure:'npc_007_closure',band_kazdel_theresa:'char_4488_talr',band_general_hodrer_fieldcare:'char_4088_hodrer',band_rhine_joint:'char_108_silent',band_rhine_milestones:'char_1092_krstn',band_higashi_defend:'char_136_hsguma',band_higashi_market:'char_4199_makiri',band_ursus_rollcall:'char_115_headbr',band_ursus_aid:'char_4224_turdus'};
const themes={band_exp_nian:'knightPreparationShip',band_exp_bison:'kazdel_memory_standard',band_exp_liangxun:'rhine_field_controller',band_exp_kjerag_recruit:'snowfieldGuideShip',band_rm_kaltsit:'field_medic_bandage',band_rm_closure:'rm_terminal',band_kazdel_theresa:'kazdelShip',band_general_hodrer_fieldcare:'bloodlineShip',band_rhine_joint:'specialResearchShip',band_rhine_milestones:'rhineShip',band_higashi_defend:'higashi_seal',band_higashi_market:'higashi_talisman',band_ursus_rollcall:'ursus_badge',band_ursus_aid:'field_medic_bandage',band_iberia_voyage:'iberia_eye',band_iberia_fire:'iberia_lamp'};
const cache=new Map();
export function productIcon(manifest,kind,key,existing=null){
 if(existing&&!existing.startsWith('/assets/product/icons/'))return existing;
 if(kind==='items'&&key===MASTERY_ITEM_ID)return MASTERY_ICON;
 if(kind==='items'&&key===PRTS_ITEM_ID)return PRTS_ICON;
 if(kind==='bands'&&people[key]){const portrait=manifest?.chars?.[people[key]]?.avatar;if(portrait)return portrait;}
 const shape=shapes[key]||shapes[themes[key]];if(!shape)return existing;
 const id=kind+':'+key;if(!cache.has(id))cache.set(id,'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g fill="none" stroke="#eaf6f2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="${shape}"/></g></svg>`));return cache.get(id);
}
