// Independent admin tools, not content publication or account permissions.
// Removing a registry entry leaves its retired persisted value inert.
export const ADMIN_TEST_CONTROLS=Object.freeze([
  Object.freeze({id:'testOperatorGrant',name:'启用测试领取开关',description:'仅管理员：启用岁与企鹅、罗德岛与乐队或卡兹戴尔后，第一回合休整期显示本人快捷领取开关，按本局有效包提供干员。默认关闭；保存后立即生效，已领取的干员保留。'}),
]);
export const validAdminControls=value=>value!=null&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length<=100&&Object.entries(value).every(([id,v])=>/^[a-zA-Z][a-zA-Z0-9]{0,99}$/.test(id)&&typeof v==='boolean');
export function adminControlView(values){return ADMIN_TEST_CONTROLS.map(item=>({...item,enabled:values[item.id]===true}));}
export const adminControlEnabled=(values,id)=>ADMIN_TEST_CONTROLS.some(item=>item.id===id)&&values[id]===true;
