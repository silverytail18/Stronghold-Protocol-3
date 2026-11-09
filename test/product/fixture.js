import fs from 'node:fs/promises';import path from 'node:path';import os from 'node:os';import {randomUUID} from 'node:crypto';import {fileURLToPath} from 'node:url';
import {hashPassword} from '../../server/product/auth.js';
import {Ranked} from '../../server/product/ranked.js';
import {startAccountServer} from '../../server/product/account-server.js';
const report=path.dirname(fileURLToPath(import.meta.url));
let passwordHash;
export async function productFixture(){
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'sp-product-')),project=path.join(dir,'installation'),state=path.join(dir,'private');
  await fs.mkdir(path.join(project,'config'),{recursive:true});await fs.mkdir(state);
  await fs.writeFile(path.join(project,'package.json'),JSON.stringify({version:'0.9.13'}));
  passwordHash??=await hashPassword('fixture-pass');
  const users=['admin','member','disabled'].map((username,i)=>({username,accountId:randomUUID(),passwordHash,role:i?'user':'admin',disabled:i===2,mustChangePassword:false,sponsor:i===1,retainedExtension:{value:username}}));
  const authFile=path.join(state,'auth-users.json');await fs.writeFile(authFile,JSON.stringify({version:1,users,retainedExtension:{keep:true}}));
  const auth={users:new Map(users.map(u=>[u.username,u]))},rank=new Ranked({filename:path.join(state,'ranked.sqlite'),auth});
  const seats=[{accountId:users[1].accountId,playerId:'member-seat',name:'历史昵称',isBot:false}];
  const match=rank.start({mode:'solo',difficulty:'NORMAL',roomCode:'KEEP',seats});rank.finish(match.id,{victory:true,reason:'victory',roundsPassed:14,errors:0,players:seats});
  rank.audit('admin','fixture','retained');const expected={profile:rank.profile(users[1].accountId),records:rank.records(users[1].accountId),seasons:rank.all('SELECT * FROM seasons'),audit:rank.all('SELECT * FROM audit')};rank.close();
  const env={SP_STATE_DIR:state,SP_AUTH_COOKIE_SECURE:'0',SP_AUTH:'on'};
  await fs.writeFile(path.join(project,'config/server.env'),'SP_STATE_DIR='+JSON.stringify(state)+'\nSP_AUTH_COOKIE_SECURE=0\n');
  let server;
  return {dir,project,state,authFile,users,expected,env,
    async start(){server=await startAccountServer({root:project,applicationRoot:path.resolve(report,'../..'),uiRoot:path.resolve(report,'../..'),env,log:{error(){}}});return server;},
    async stop(){if(server){await server.close();server=null;}},
    async close(){if(server)await server.close();await fs.rm(dir,{recursive:true,force:true});},
  };
}
export async function login(url,username='admin',extra={}){
  const response=await fetch(url+'/auth/login',{method:'POST',headers:{Origin:url,'Content-Type':'application/json',...extra},body:JSON.stringify({username,password:'fixture-pass'})});
  const body=await response.json();return {status:response.status,body,cookie:response.headers.get('set-cookie')?.split(';')[0]};
}
