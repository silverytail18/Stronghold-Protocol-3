import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {buildResourcePack,writeResourceZip} from './build-resource-pack.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const embed=process.argv.includes('--embed-resources');
if(process.argv.slice(2).some(a=>a!=='--embed-resources'))throw new Error('用法：npm run windows:build -- [--embed-resources]');
const dist=path.join(root,'mobile',embed?'full-dist':'dist'),name=embed?'stronghold-windows-full':'stronghold-windows',output=path.join(dist,name);
await fs.mkdir(output,{recursive:true});
const buildEnv={...process.env,DOTNET_CLI_HOME:path.join(root,'.cache','dotnet'),NUGET_PACKAGES:path.join(root,'.cache','nuget'),DOTNET_CLI_TELEMETRY_OPTOUT:'1',DOTNET_SKIP_FIRST_TIME_EXPERIENCE:'1'};
const result=spawnSync('dotnet',['publish',path.join(root,'mobile/windows/Stronghold.Protocol.csproj'),'-c','Release','-r','win-x64','--self-contained','true','-p:PublishSingleFile=true','-o',output],{encoding:'utf8',env:buildEnv,windowsHide:true,maxBuffer:8*1024*1024});
if(result.status!==0)throw new Error(result.stderr||result.stdout||result.error?.message);console.log(result.stdout);
if(embed){const pack=await buildResourcePack();await fs.copyFile(path.join(root,'resource-packs',pack.archive.sha256+'.zip'),path.join(output,'resource-pack.zip'));await fs.copyFile(path.join(root,'resource-packs',pack.version+'.json'),path.join(output,'resource-catalog.json'));}
await fs.writeFile(path.join(output,'使用说明.txt'),'运行 Stronghold.Protocol.exe，填写服务器地址后登录。首次准备完整资源；以后只下载变化文件。\r\n需要 Microsoft Edge WebView2 Runtime；固定资源保存在 %LOCALAPPDATA%\\StrongholdProtocol\\resources。\r\n账号管理请在浏览器访问；账号、战绩和对局仍由服务器处理。\r\n');
const entries=[];async function walk(dir,rel=''){for(const e of await fs.readdir(dir,{withFileTypes:true})){const next=path.join(rel,e.name);if(e.isDirectory())await walk(path.join(dir,e.name),next);else entries.push([`${name}/${next.replaceAll('\\','/')}`,()=>fs.readFile(path.join(output,next))]);}}await walk(output);
const archive=path.join(dist,name+'.zip'),temp=archive+'.tmp';try{await fs.access(temp);throw new Error('临时发布文件已存在，请检查上次构建');}catch(e){if(e.code!=='ENOENT')throw e;}
await writeResourceZip(temp,entries);await fs.rename(temp,archive);const hash=createHash('sha256');for await(const b of (await import('node:fs')).createReadStream(archive))hash.update(b);await fs.writeFile(archive+'.sha256',hash.digest('hex')+'  '+name+'.zip\n');console.log('Windows 客户端：'+archive);
