import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { mizukiMapChunks } from '../public/js/mizukiMaps.js';

const publicRoot = new URL('../public/', import.meta.url);
const read = url => JSON.parse(fs.readFileSync(new URL(url.replace(/^\//, ''), publicRoot), 'utf8'));
const manifest = read('/assets/mizuki/native-maps/manifest.json');

test('all Mizuki native maps retain static batch submesh selection and finite board geometry', () => {
  let scenes = 0, renderers = 0;
  for (const record of Object.values(manifest.groups['scene/data'])) {
    const scene = read(record.path);
    for (const root of scene.roots) {
      const descriptor = read(manifest.groups['scene/roots'][root.key].path);
      if (!descriptor.nodes.some(n => n.behaviours?.some(b => b.class === 'MapGraphic'))) continue;
      const meshes = Object.fromEntries(descriptor.meshes.map(key => [key, read(manifest.groups['scene/meshes'][key].path)]));
      for (const node of descriptor.nodes.filter(n => n.meshRenderer)) {
        const native = node.meshRenderer.native;
        assert.ok(native?.m_StaticBatchInfo, scene.name + '/' + node.name + ': missing bake metadata');
        if (native.m_StaticBatchInfo.subMeshCount > 0) {
          const mesh = meshes[node.meshFilter];
          assert.ok(native.m_StaticBatchInfo.firstSubMesh + native.m_StaticBatchInfo.subMeshCount <= mesh.submeshes.length);
        }
        renderers++;
      }
      const pack = mizukiMapChunks(THREE, descriptor, meshes);
      assert.ok(pack.chunks.length > 0, scene.name + ': drawable geometry');
      let boardVertices = 0;
      for (const chunk of pack.chunks) {
        for (let i = 0; i < chunk.position.length; i += 3) {
          const [x, y, z] = chunk.position.subarray(i, i + 3);
          assert.ok(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z));
          if (x >= -.6 && x <= 16 && y >= -.6 && y <= pack.rowCount && z >= -.5 && z <= 1) boardVertices++;
        }
      }
      assert.ok(boardVertices > 30, scene.name + ': terrain must overlap the playable board');
      scenes++;
    }
  }
  assert.ok(scenes >= 60);
  assert.ok(renderers >= 9000);
});

test('a stripped combined mesh fails explicitly instead of drawing an empty battlefield', () => {
  const record = manifest.groups['scene/roots']['level_rogue2_1-2__73'];
  const scene = read('/assets/mizuki/native-maps/scenes/level_rogue2_1-2.json');
  const descriptor = record ? read(record.path) : scene.roots.map(r => read(manifest.groups['scene/roots'][r.key].path)).find(d => d.nodes.some(n => n.meshRenderer));
  const node = descriptor.nodes.find(n => /^Combined_Mesh/.test(n.meshFilter));
  delete node.meshRenderer.native;
  const meshes = Object.fromEntries(descriptor.meshes.map(key => [key, read(manifest.groups['scene/meshes'][key].path)]));
  assert.throws(() => mizukiMapChunks(THREE, descriptor, meshes), /static batch metadata missing/);
});
