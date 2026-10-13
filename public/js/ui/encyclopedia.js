import {useEffect,useState} from '../../vendor/hooks.module.js';
import {html,Button,Modal,Spinner} from './components.js';
import {RichText} from './gameComponents.js';
import {formatBondEffect} from './richText.js';
import {BondRuleDetails} from './bondDetails.js';
import {createStore,useStore} from '../store.js';
import {data} from '../data.js';
import {appArtPaths} from '../appResources.js';
import {bondIconUrl,itemIconUrl} from '../assets.js';
import {encyclopediaEntries,encyclopediaTraits} from '../../../shared/encyclopedia.js';
export const encyclopediaStore=createStore({open:false});
export const openEncyclopedia=()=>encyclopediaStore.set({open:true});
export function EncyclopediaButton({class:cls,variant='secondary'}){return html`<${Button} size="sm" variant=${variant} icon="book" class=${cls} onClick=${openEncyclopedia}>百科大全<//>`;}
const files=['chess','bonds','items','assets','garrisons'];
let cached=null,inputs=null;
async function loadCatalog(){
 await data.loadAll(files);
 const base=Object.fromEntries(files.map(n=>[n,data.baseline(n)]));
 if(files.some(n=>!base[n]))throw Error('百科数据载入失败，请关闭后重试');
 if(!inputs||files.some(n=>inputs[n]!==base[n])){const {buildEncyclopediaCatalog}=await import('/sim/content/expansion/encyclopedia-catalog.js');cached=appArtPaths(buildEncyclopediaCatalog(base));inputs=base;}
 return cached;
}
function Picture({src}){return src?html`<img class="encyclopedia__icon" src=${src} alt="" loading="lazy" onError=${e=>{e.currentTarget.hidden=true;}} />`:null;}
function BondDetails({rec,catalog,layers}){
 const [tier,setTier]=useState(1),[attack,setAttack]=useState(1000);
 const test=!!rec.testDescription,kind=rec.testDescription?.kind;
 const context=test?{live:false,preview:true,...(kind==='rhodes'?{atk:attack}:kind==='snow'?{members:[{uid:0,name:'示例干员',atk:attack}]}:{})}:null;
 const effect=formatBondEffect(rec,layers,test?tier:null,context);
 const ids=rec.visibleMembers?.length?rec.visibleMembers:rec.members||[];
 return html`<p class="encyclopedia__meta">${rec.isCore?'核心盟约':'附加盟约'} · 激活人数：${(rec.thresholds||[rec.activeCount]).join(' / ')} · ${rec.countsHand?'作战区与待命区计数':'作战区计数'}${rec.countsGoldenOnly?' · 仅精锐计数':''}</p>
 <${RichText} as="p" text=${rec.descRaw||rec.desc} />
 ${test?html`<div class="encyclopedia__tools"><label>预览档位 <select aria-label=${rec.name+'预览档位'} value=${tier} onChange=${e=>setTier(Number(e.currentTarget.value))}>${rec.thresholds.map((n,i)=>html`<option key=${i} value=${i+1}>${n}人档</option>`)}</select></label>
 ${(kind==='rhodes'&&tier>=2||kind==='snow'&&tier>=2)?html`<label>${kind==='rhodes'?'示例本人成员攻击力总和':'示例单名成员攻击力'} <input type="number" min="0" max="1000000" aria-label=${rec.name+'示例攻击力'} value=${attack} onInput=${e=>setAttack(Math.max(0,Math.min(1000000,Number(e.currentTarget.value)||0)))} /></label>`:null}</div>`:null}
 ${effect&&effect!==(rec.descRaw||rec.desc)?html`<div class="encyclopedia__effect"><b>${test?'理论效果预览 · ':''}${layers}层时的效果</b><${RichText} as="p" text=${effect} /></div>`:null}
 ${test?html`<${BondRuleDetails} bond=${rec} layers=${layers} tier=${tier} context=${context} />`:null}
 <details><summary>成员与成长特质（${ids.length}名）</summary><div class="encyclopedia__members">${ids.map(id=>{const c=catalog.chess[id];if(!c)return null;return html`<div key=${id} data-member-id=${id}><b>${c.name} · ${c.tier}阶</b>${[c,...Object.values(catalog.chess).filter(e=>e.isGolden&&e.baseId===(c.baseId||id))].map((r,i)=>{const list=encyclopediaTraits(r,catalog.garrisons);return list.length?html`<div data-quality=${i?'elite':'normal'}><small>${i?'精锐':'普通'}特质</small>${list.map(x=>html`<${RichText} as="p" text=${x.descRaw} />`)}</div>`:null;})}</div>`;})}</div></details>`;
}
function ItemDetails({rec,catalog}){
 const elite=catalog.items[rec.goldenId||rec.upgradeChessId];
 const source=rec.hideInShop?'不在商店出售':rec.shopExcluded?'特殊来源：'+(rec.shopExcludedBy||'效果奖励'):'商店可获得';
 return html`<p class="encyclopedia__meta">${rec.tier||'特殊'}阶 · ${source} · ${rec.kind?.startsWith('consume')||rec.kind==='art_instant'?'使用后消耗':'持续装备'}${rec.mergeable?' · 可以合成进阶':''}</p>
 <div class="encyclopedia__qualities"><section><h4>普通</h4><${RichText} as="p" text=${rec.descRaw||rec.desc||'暂无效果说明'} /></section>${elite?html`<section><h4>进阶</h4><${RichText} as="p" text=${elite.descRaw||elite.desc||'暂无效果说明'} /></section>`:null}</div>
 ${rec.canGiveBond&&rec.giveBondId?html`<p>追加盟约：${catalog.bonds[rec.giveBondId]?.name||rec.giveBondId}</p>`:null}
 ${rec.requiresBondId?html`<p>使用条件：${catalog.bonds[rec.requiresBondId]?.name||rec.requiresBondId}</p>`:null}
 ${rec.flavor?html`<${RichText} as="p" class="encyclopedia__flavor" text=${rec.flavor} />`:null}`;
}
export function EncyclopediaHost(){
 const {open}=useStore(s=>s,Object.is,encyclopediaStore);const [catalog,setCatalog]=useState(null),[error,setError]=useState(''),[tab,setTab]=useState('bonds'),[query,setQuery]=useState(''),[layers,setLayers]=useState(0);
 useEffect(()=>{if(!open)return;let live=true;setError('');loadCatalog().then(c=>{if(live)setCatalog(c);}).catch(e=>{if(live)setError(e.message);});return()=>{live=false;};},[open]);
 if(!open)return null;
 const entries=encyclopediaEntries(catalog,tab,query);
 return html`<${Modal} open=${true} title="百科大全" micro="ENCYCLOPEDIA" class="encyclopedia" width="min(11rem, 94vw)" onClose=${()=>encyclopediaStore.set({open:false})} actions=${html`<${Button} onClick=${()=>encyclopediaStore.set({open:false})}>关闭<//>`}>
 <div class="encyclopedia__tools"><${Button} variant=${tab==='bonds'?'primary':'secondary'} onClick=${()=>{setTab('bonds');setQuery('');}}>盟约大全<//><${Button} variant=${tab==='items'?'primary':'secondary'} onClick=${()=>{setTab('items');setQuery('');}}>装备大全<//>
 <input aria-label="搜索百科" placeholder="搜索名称、效果或测试包" value=${query} onInput=${e=>setQuery(e.currentTarget.value)} />
 ${tab==='bonds'?html`<label>预览层数 <input aria-label="预览层数" type="number" min="0" max="999" value=${layers} onInput=${e=>setLayers(Math.min(999,Math.max(0,Number(e.currentTarget.value)||0)))} /></label>`:null}</div>
 <p class="encyclopedia__note">包含正式内容与已实现的测试内容。标注测试包的内容仅在开局启用对应包后进入对局；这里的查看不会改变本局规则。盟约人数按不同干员计算，同名普通与精锐不重复计数。</p>
 ${error?html`<p role="alert">${error}</p>`:!catalog?html`<${Spinner} />`:html`<p role="status">共 ${entries.length} 项</p><div class="encyclopedia__list">${entries.map(rec=>{const id=rec.bondId||rec.id;const batch=catalog.batches[tab][id];return html`<article key=${id} data-entry-id=${id}><header><${Picture} src=${tab==='bonds'?bondIconUrl(catalog.assets,id):itemIconUrl(catalog.assets,rec)} /><h3>${rec.name}</h3>${batch?html`<span class="encyclopedia__badge">测试 · ${batch}</span>`:null}</header>${tab==='bonds'?html`<${BondDetails} rec=${rec} catalog=${catalog} layers=${layers} />`:html`<${ItemDetails} rec=${rec} catalog=${catalog} />`}</article>`;})}</div>`}
 <//>`;
}
