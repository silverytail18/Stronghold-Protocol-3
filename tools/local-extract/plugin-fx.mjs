// The Python extractor calls this repository-owned reader, never a pack's JavaScript.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { installedFxReferences } from '../../server/plugins/fxReferences.js';
import {productAssetData} from '../assets/product-content.mjs';
const records=process.argv[2]==='--records';
const root = process.argv[records?3:2] || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const product=productAssetData(root)[0]||{};
process.stdout.write(JSON.stringify(records?{chess:product.chess||{},tokens:product.tokens||{}}:[...new Set([...installedFxReferences(root),...Object.values(product.chess||{}).map(c=>c.charId).filter(Boolean)])]));
