import {useState} from '../../vendor/hooks.module.js';
import {html, Modal, Button} from './components.js';
import {ZHAJING_VARIANT} from '../../../shared/zhajing-constants.js';
export function ZhajingCreate({online,busy,onClose,onCreate}) {
 const [capacity,setCapacity]=useState(4);
 return html`<${Modal} open=${true} title="炸惊模拟" onClose=${onClose} width="min(720px,94vw)" actions=${html`<${Button} variant="secondary" onClick=${onClose}>返回玩法大厅<//><${Button} disabled=${!online||!!busy} onClick=${()=>onCreate({mode:capacity===1?'solo':'coop',difficulty:'ZHAJING',variant:ZHAJING_VARIANT,capacity})}>创建房间<//>`}>
 <p>选择惊变、锻造与专属干员，组合盟约成长，挑战最终攻势。</p>
 <ul><li>第 1、3、6、8、10 回合选择惊变，每个选项可刷新一次。</li><li>合成精锐与累计击败 40 个敌人获得锻造器。</li><li>20 格候战区、独立卡池和经济，不参与排位。</li></ul>
 <label class="zj-capacity">房间人数 <select aria-label="炸惊模拟房间人数" value=${capacity} disabled=${!!busy} onChange=${e=>setCapacity(Number(e.currentTarget.value))}>${[1,2,3,4].map(n=>html`<option value=${n}>${n} 人</option>`)}</select></label>
 <p>1 人为独立模拟；2—4 人为同盟模拟。使用固定规则，不混用普通模式测试包。</p>
 <//>`;
}
