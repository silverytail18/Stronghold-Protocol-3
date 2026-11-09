"""Read official outfits through the upstream Unity/Spine extractor; never reads legacy project's art or mappings."""
import argparse, hashlib, json, re, subprocess
from pathlib import Path
import aklz4
import UnityPy
from extract import prefab_spine_nodes, write_spine, safe_name
import fx

def run(root, ab, table, tokens_only=False):
    out=root/'public/assets/local'
    manifest_file=root/'data/local-assets.json'
    manifest=json.loads(manifest_file.read_text(encoding='utf-8'))
    groups=manifest.setdefault('groups',{})
    assets=json.loads((root/'data/assets.json').read_text(encoding='utf-8'))
    idx_file=out/'fx/index.json'
    idx=json.loads(idx_file.read_text(encoding='utf-8'))
    raw=table.read_bytes();source=json.loads(raw)
    wanted=[s for s in source['charSkins'].values() if s['charId'] in assets['chars'] and '@' in s['skinId']]
    by_char={}
    for s in wanted:by_char.setdefault(s['charId'],[]).append(s)
    chars=manifest.setdefault('chars',{});tokens=manifest.setdefault('tokens',{})
    picture_wanted={}
    for s in wanted:
        entry=chars.setdefault(s['charId'],{}).setdefault('skins',{}).setdefault(s['skinId'],{})
        entry.update(name=s['displaySkin'].get('skinName') or s['skinId'],group=s['displaySkin'].get('skinGroupName') or '',voiceId=s.get('voiceId'))
        for kind,field in [('avatar','avatarId'),('portrait','portraitId')]:
            if s.get(field):picture_wanted.setdefault(kind,{}).setdefault(s[field],[]).append((entry,s['skinId']))
    counts={'models':0,'skins':len(wanted),'tokenModels':0,'pictures':0};missing=[]
    for kind,pattern in ([] if tokens_only else [('avatar','spritepack/ui_char_avatar_*.ab'),('portrait','spritepack/char_portrait_*.ab')]):
        selected=picture_wanted.get(kind,{})
        for bundle in sorted(ab.glob(pattern)):
            if not selected:break
            env=UnityPy.load(str(bundle))
            for obj in env.objects:
                if obj.type.name!='Sprite':continue
                sprite=obj.read();name=sprite.m_Name
                if name not in selected:continue
                sub='skins/'+kind;fname=safe_name(name)+'.png';target=out/sub/fname;target.parent.mkdir(parents=True,exist_ok=True)
                image=sprite.image;image.save(target)
                url='/assets/local/'+sub+'/'+fname
                groups.setdefault(sub,{})[fname]={'path':url,'w':image.width,'h':image.height,'kind':'Sprite'}
                for entry,_ in selected.pop(name):entry[kind]=url
                counts['pictures']+=1
            print('pictures',kind,bundle.name,counts['pictures'],flush=True)
        for name in selected:missing.append({'kind':kind,'id':name})
    cabs=fx.scan_cabs(ab)
    def model(env,objects,key,sub,name):
        ref=next((r for k,r in env.container.items() if k.lower().endswith('/'+name.lower()+'.prefab') and '/battle/' in k.lower()),None)
        if not ref:return None,None
        nodes=prefab_spine_nodes(ref.read_typetree(),objects);spines={}
        for face in ['front','back']:
            node=next((n for n in nodes if n[0].lower()==face),None)
            active=[n for n in nodes if n[1]]
            if node is None and len(active)==1:node=active[0]
            obj=objects.get(node[2]['m_PathID']) if node and not node[2].get('m_FileID') else None
            if not obj:continue
            directory=sub+'/'+face
            if not write_spine(objects,obj.read_typetree(),directory,name,out,groups,lambda text:print(text,flush=True)):continue
            files=groups[directory]
            # Atlas page names may carry #. Portable local URLs must not mistake them for fragments.
            renames={fname:safe_name(fname) for fname in list(files) if safe_name(fname)!=fname}
            for before,after in renames.items():
                old=files.pop(before);(out/directory/before).replace(out/directory/after);old['path']='/assets/local/'+directory+'/'+after;files[after]=old
            skel=next(k for k in files if k.endswith('.skel'));atlas=skel[:-5]+'.atlas'
            if renames:
                af=out/directory/atlas;text=af.read_text(encoding='utf-8');af.write_text('\n'.join(renames.get(line,line) for line in text.split('\n')),encoding='utf-8')
            reader=root/'tools/local-extract/plugin-art.mjs'
            meta=json.loads(subprocess.check_output(['node',str(reader),'--spine',str(out/directory/skel)],timeout=30))
            spines[face]={**meta,'skel':files[skel]['path'],'atlas':files[atlas]['path'],'textures':[v['path'] for k,v in files.items() if k.endswith('.png')]}
        return spines,ref
    token_envs={}
    for cid,skins in sorted(by_char.items()):
        bundle=ab/'skinpack'/f'{cid}.ab'
        if not bundle.exists():missing.append({'kind':'bundle','id':cid});continue
        env=UnityPy.load(str(bundle));objects={o.path_id:o for o in env.objects}
        points_env=None
        for s in skins:
            sid=s['skinId'];entry=chars[cid]['skins'][sid];name=s.get('battleSkin',{}).get('skinOrPrefabId')
            if not name:continue
            spines,ref=(None,None) if tokens_only else model(env,objects,sid,'skins/spine/'+safe_name(sid),name)
            if spines and 'front' in spines:
                entry['spine']=spines;counts['models']+=1
                if points_env is None:points_env=fx.AssetEnv(ab,cabs)
                container=next(k for k,v in env.container.items() if v==ref)
                graphic=(idx['units'].get(cid) or {}).get('graphic')
                points=fx.skin_points(points_env,f'skinpack/{cid}.ab',name,graphic,container=container)
                idx['skins'][sid]={'source':f'skinpack/{cid}.ab {name}','graphic':graphic,'points':points or {}}
            elif not tokens_only:missing.append({'kind':'model','id':sid})
            token_map=s.get('tokenSkinMap') or {}
            token_entries=token_map.items() if isinstance(token_map,dict) else [(v['tokenId'],v['tokenSkinId']) for v in token_map]
            for token,variant in token_entries:
                if token not in assets.get('tokens',{}):continue
                name=variant if isinstance(variant,str) else variant.get('skinOrPrefabId')
                if not name:continue
                token_bundle=ab/'skinpack'/f'{token}.ab'
                if not token_bundle.exists():missing.append({'kind':'tokenBundle','id':token});continue
                if token not in token_envs:
                    te=UnityPy.load(str(token_bundle));token_envs[token]=(te,{o.path_id:o for o in te.objects})
                te,to=token_envs[token]
                token_spines,token_ref=model(te,to,sid,'skins/token/'+safe_name(token+'/'+sid),name)
                if token_spines and 'front' in token_spines:
                    tokens.setdefault(token,{}).setdefault('skins',{})[sid]={'name':entry['name'],'group':entry['group'],'spine':token_spines};counts['tokenModels']+=1
                    if points_env is None:points_env=fx.AssetEnv(ab,cabs)
                    container=next(k for k,v in te.container.items() if v==token_ref)
                    graphic=(idx['units'].get(token) or {}).get('graphic')
                    points=fx.skin_points(points_env,f'skinpack/{token}.ab',name,graphic,container=container)
                    skin_key=token+'@'+sid
                    idx['skins'][skin_key]={'source':f'skinpack/{token}.ab {name}','graphic':graphic,'points':points or {}}
                    idx.setdefault('tokenSkins',{}).setdefault(token,{})[sid]=skin_key
        print('models',cid,counts['models'],flush=True)
    # Metadata-only entries are not advertised as wearable; no partial model or synthetic portrait.
    for cid,row in chars.items():
        if 'skins' in row:row['skins']={sid:s for sid,s in row['skins'].items() if s.get('spine') or s.get('avatar') or s.get('portrait')}
    manifest_file.write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
    idx_file.write_text(json.dumps(idx,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
    result={'source':'upstream extractor + read-only installed client','tableSHA256':hashlib.sha256(raw).hexdigest(),'client':fx.client_version(ab),'counts':counts,'missing':missing}
    (root/('data/product-token-skins-extraction.json' if tokens_only else 'data/product-skins-extraction.json')).write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(result,ensure_ascii=False),flush=True)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--root',required=True,type=Path);parser.add_argument('--ab-root',required=True,type=Path);parser.add_argument('--skin-table',required=True,type=Path);parser.add_argument('--tokens-only',action='store_true');args=parser.parse_args()
    run(args.root.resolve(),args.ab_root.resolve(),args.skin_table.resolve(),args.tokens_only)
