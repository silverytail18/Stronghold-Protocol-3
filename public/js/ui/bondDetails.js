import {html} from './components.js';
import {RichText} from './gameComponents.js';
import {testBondMemberEffects,testBondCalculation} from '../../../shared/test-bond-descriptions.js';
export function BondRuleDetails({bond,layers=0,tier=0,context=null}){
 const sections=bond?.detailSections||[],calculation=testBondCalculation(bond,layers,tier,context);
 const members=tier>=2?testBondMemberEffects(bond,context):[];
 if(!sections.length&&!calculation&&!members.length)return null;
 return html`<details class="bpop__rules" data-bond-rules=${bond.bondId}>
  <summary>详细规则${members.length?'与成员数值':''}</summary>
  ${calculation?html`<section><h4>计算依据</h4><${RichText} as="p" text=${calculation} /></section>`:null}
  ${members.length?html`<section><h4>${context?.live===false?'开战预计':'当前'}成员冰爆</h4>${members.map(r=>html`<p key=${r.uid} data-bond-member-value=${r.uid}><b>${r.name}</b>：<${RichText} text=${r.text} /></p>`)}</section>`:null}
  ${sections.map((s,i)=>html`<section key=${i}><h4>${s.title}</h4><${RichText} as="p" text=${s.text} /></section>`)}
 </details>`;
}
