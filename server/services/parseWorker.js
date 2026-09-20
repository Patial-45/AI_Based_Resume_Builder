import { parentPort, workerData } from 'node:worker_threads';
import { parseBuffer } from './resumeParser.js';
try { parentPort.postMessage({ result: await parseBuffer(Buffer.from(workerData.data), workerData.mimeType) }); }
catch { parentPort.postMessage({ error: true }); }
