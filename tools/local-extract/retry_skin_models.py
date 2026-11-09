"""Retry picture-only outfits from original installed bundles, one bundle at a time.

No old-project art or mappings are read. Skin IDs retain their original operator identity,
even when the composed catalogue groups Amiya's forms under one operator.
"""
import argparse
import json
import subprocess
from pathlib import Path
import aklz4  # registers the official client's compression decoder
import UnityPy
import fx
from extract import prefab_spine_nodes, write_spine, safe_name


def run(root, ab, report):
    local_file = root / 'data/local-assets.json'
    assets_file = root / 'data/assets.json'
    local = json.loads(local_file.read_text(encoding='utf-8'))
    assets = json.loads(assets_file.read_text(encoding='utf-8'))
    out = root / 'public/assets/local'
    rows = []
    for cid, char in local.get('chars', {}).items():
        for sid, skin in char.get('skins', {}).items():
            if skin.get('spine', {}).get('front'):
                continue
            source_id = sid.split('@')[0]
            bundle = ab / 'skinpack' / (source_id + '.ab')
            row = {'charId': cid, 'skinId': sid, 'name': skin.get('name'), 'source': str(bundle)}
            rows.append(row)
            if not bundle.exists():
                row['error'] = 'source bundle absent'
                continue
            env = UnityPy.load(str(bundle))
            objects = {o.path_id: o for o in env.objects}
            name = sid.replace('@', '_')
            matches = [(k, r) for k, r in env.container.items()
                       if k.lower().endswith('/' + name.lower() + '.prefab') and '/battle/' in k.lower()]
            if len(matches) != 1:
                row['error'] = 'battle prefab not unique or absent'
                continue
            container, ref = matches[0]
            row['container'] = container
            nodes = prefab_spine_nodes(ref.read_typetree(), objects)
            spines = {}
            for face in ['front', 'back']:
                node = next((n for n in nodes if n[0].lower() == face), None)
                active = [n for n in nodes if n[1]]
                if node is None and len(active) == 1:
                    node = active[0]
                obj = objects.get(node[2]['m_PathID']) if node and not node[2].get('m_FileID') else None
                if not obj:
                    continue
                sub = 'skins/spine/' + safe_name(sid) + '/' + face
                if not write_spine(objects, obj.read_typetree(), sub, name, out, local['groups'], print):
                    continue
                files = local['groups'][sub]
                renames = {f: safe_name(f) for f in files if safe_name(f) != f}
                for before, after in renames.items():
                    item = files.pop(before)
                    (out / sub / before).replace(out / sub / after)
                    item['path'] = '/assets/local/' + sub + '/' + after
                    files[after] = item
                skel = next(f for f in files if f.endswith('.skel'))
                atlas = skel[:-5] + '.atlas'
                atlas_path = out / sub / atlas
                atlas_path.write_text('\n'.join(renames.get(line, line) for line in atlas_path.read_text(encoding='utf-8').split('\n')), encoding='utf-8')
                meta = json.loads(subprocess.check_output(['node', str(root / 'tools/local-extract/plugin-art.mjs'), '--spine', str(out / sub / skel)], timeout=30))
                spines[face] = {**meta, 'skel': files[skel]['path'], 'atlas': files[atlas]['path'],
                                'textures': [v['path'] for f, v in files.items() if f.endswith('.png')]}
            if 'front' not in spines:
                row['error'] = 'no complete front model'
                continue
            skin['spine'] = spines
            assets['chars'][cid]['skins'][sid]['spine'] = spines
            row['faces'] = list(spines)
            row['animations'] = spines['front'].get('animations')
            print('recovered', sid, flush=True)
            del env, objects
    recovered = [r for r in rows if 'faces' in r]
    if recovered:
        index_file = out / 'fx/index.json'
        index = json.loads(index_file.read_text(encoding='utf-8'))
        fx_env = fx.AssetEnv(ab, fx.scan_cabs(ab))
        for row in recovered:
            sid = row['skinId']
            original = sid.split('@')[0]
            graphic = (index['units'].get(original) or index['units'].get(row['charId']) or {}).get('graphic')
            points = fx.skin_points(fx_env, 'skinpack/' + original + '.ab', sid.replace('@', '_'), graphic, container=row['container'])
            index['skins'][sid] = {'source': 'skinpack/' + original + '.ab ' + sid.replace('@', '_'), 'graphic': graphic, 'points': points or {}}
        index_file.write_text(json.dumps(index, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
    local['count'] = sum(len(g) for g in local['groups'].values())
    for file, doc in [(local_file, local), (assets_file, assets)]:
        file.write_text(json.dumps(doc, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
    subprocess.check_call(['node', str(root / 'tools/local-extract/finalize-skin-manifest.mjs'), str(root)])
    report.write_text(json.dumps({'source': 'read-only installed client; original upstream Spine writer', 'attempted': len(rows),
                                 'recovered': sum('faces' in r for r in rows), 'rows': rows}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--root', type=Path, required=True)
    p.add_argument('--ab-root', type=Path, required=True)
    p.add_argument('--report', type=Path, required=True)
    a = p.parse_args()
    run(a.root.resolve(), a.ab_root.resolve(), a.report.resolve())
