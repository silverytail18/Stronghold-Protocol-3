// The admin page renders server-owned tool descriptors; no gameplay imports.
export function renderAdminTestControls(container,items=[]){
  container.replaceChildren();
  for(const item of items){
    const label=document.createElement('label');label.className='test-access-option';
    const input=document.createElement('input');input.type='checkbox';input.dataset.adminControl=item.id;input.checked=item.enabled;
    const text=document.createElement('span'),name=document.createElement('strong'),description=document.createElement('span');
    name.textContent=item.name;description.textContent=item.description;text.append(name,description);label.append(input,text);container.append(label);
  }
}
export const readAdminTestControls=container=>Object.fromEntries([...container.querySelectorAll('input[data-admin-control]')].map(input=>[input.dataset.adminControl,input.checked]));
