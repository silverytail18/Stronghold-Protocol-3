import {BATTLE_MASTERY_SKILLS} from './skill-mastery-records.js';
import {PRODUCT_MASTERY_SKILLS} from './product-mastery-records.js';

export const MASTERY_ITEM_ID='chess_item_mastery_training_a';
export const PRTS_ITEM_ID='chess_item_prts_archive_a';
export const PRTS_ITEM=Object.freeze({chessId:PRTS_ITEM_ID,itemId:PRTS_ITEM_ID,name:'PRTS档案',tier:7,itemType:'EQUIP',kind:'consume_on_equip_prts',visible:false,shopExcluded:true,hideInShop:true,isGolden:false,mergeable:false,price:0,iconId:PRTS_ITEM_ID,
 desc:'拖给任意本方干员后立即消耗，本人部署上限至少为10。本局生效，不占用或替换干员装备位。',descRaw:'拖给任意本方干员后立即消耗，本人部署上限至少为10。本局生效，不占用或替换干员装备位。'});
export const MASTERY_ITEM=Object.freeze({chessId:MASTERY_ITEM_ID,itemId:MASTERY_ITEM_ID,name:'专精训练装置',
 tier:7,itemType:'EQUIP',kind:'consume_on_equip_mastery',visible:false,shopExcluded:true,hideInShop:true,isGolden:false,mergeable:false,price:0,
 iconId:MASTERY_ITEM_ID,desc:'拖给一名精锐干员，将其当前七级技能提升至原作专精三级。立即消耗，不占用或替换两件装备；本局生效。',
 descRaw:'拖给一名精锐干员，将其当前七级技能提升至原作专精三级。立即消耗，不占用或替换两件装备；本局生效。'});
export function withMasteryItem(raw){return {...raw,items:{...raw.items,[MASTERY_ITEM_ID]:MASTERY_ITEM,[PRTS_ITEM_ID]:PRTS_ITEM}};}
export function applyGeniusTrader(raw){Object.assign(raw,withMasteryItem(raw));raw.lateInvestment={enabled:true,version:7};}
export function masteredSkill(record,skill){
 if(!record?.isGolden||record.status?.skillLevel!==7||!skill||skill.level!==7)return null;
 const source=PRODUCT_MASTERY_SKILLS[skill.skillId]||BATTLE_MASTERY_SKILLS[skill.skillId];
 return source?{...skill,...source,index:skill.index,isDefault:skill.isDefault,
  trigger:skill.trigger,overrideTokenKey:skill.overrideTokenKey}:null;
}
export function masteryFor(record,lo){
 const skill=record?.skills?.find(s=>s.index===lo?.skillIndex)||record?.skill;
 return lo?.masterySkillId===skill?.skillId?masteredSkill(record,skill):null;
}
// Code-native icon, available offline with the JS. No extra asset download at equip/battle time.
export const MASTERY_ICON='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect x="17" y="10" width="62" height="76" rx="9" fill="#172139" stroke="#dfbd71" stroke-width="3"/><path d="M29 27h38M29 69h38" stroke="#8eabc7" stroke-width="3"/><path d="M48 30l6 12 13 2-10 10 2 14-11-7-11 7 2-14-10-10 13-2z" fill="#f2d68d"/><circle cx="27" cy="19" r="3" fill="#eee5c5"/><circle cx="69" cy="19" r="3" fill="#eee5c5"/></svg>');
export const PRTS_ICON='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect x="13" y="9" width="70" height="78" rx="7" fill="#142c38" stroke="#8acdd8" stroke-width="3"/><path d="M25 25h46M25 70h46M25 77h28" stroke="#8acdd8" stroke-width="2"/><path d="M30 58V36h9a7 7 0 010 14h-9m23-14v22m-6-22h12M64 36v22" fill="none" stroke="#edf0d7" stroke-width="4"/><circle cx="69" cy="77" r="3" fill="#ecd299"/></svg>');
