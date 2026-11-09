import {runStateTransfer} from '../server/product/retention.js';
await runStateTransfer(process.argv.slice(2));
