import {html} from './components.js';import {PRODUCT_CONTENT} from '../../../shared/product-content.js';import {t} from '../../../shared/i18n.js';
export function matchesSource(row,value){if(!value)return true;const sources=row.productSourcePackages||[row.expansionBatch==='penguin-v1'?'arknights-expansion-v1':row.expansionBatch].filter(Boolean);if(value==='official')return !row.expansionBatch;if(value==='test')return sources.length>0;return sources.includes(value);}
export function ContentSource({value='',onChange}){
  return html`<label class="lo-select"><span>${t('内容来源')}</span><select value=${value} onChange=${e=>onChange(e.target.value)}><option value="">${t('全部内容')}</option><option value="official">${t('本体内容')}</option><option value="test">${t('测试内容')}</option>${PRODUCT_CONTENT.filter(p=>p.group==='内容包'||p.id.endsWith('-expansion-v1')||p.id==='rhodes-mujica-v1'||p.id==='rhine-lab-v1').map(p=>html`<option value=${p.id}>${t(p.name)}</option>`)}</select></label>`;
}
