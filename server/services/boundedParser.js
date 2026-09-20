import { Worker } from 'node:worker_threads';
import { HttpError } from '../middleware/errors.js';
export function parseDocument(data, mimeType, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./parseWorker.js', import.meta.url), { workerData: { data, mimeType }, resourceLimits: { maxOldGenerationSizeMb: 128, stackSizeMb: 4 } });
    let settled = false;
    const finish = (error, result) => {
      if (settled) return; settled = true; clearTimeout(timer); void worker.terminate();
      if (error) reject(error); else resolve(result);
    };
    const failure = () => new HttpError(422, 'PARSE_FAILED', 'We could not read this document. Use a text-based PDF, DOCX, or UTF-8 text file. Scanned images need text extraction first.');
    const timer = setTimeout(() => finish(new HttpError(422, 'PARSE_TIMEOUT', 'This document took too long to read. Try a simpler text-based document.')), timeoutMs);
    worker.once('message', message => finish(message.error ? failure() : null, message.result));
    worker.once('error', () => finish(failure()));
    worker.once('exit', () => { if (!settled) finish(failure()); });
  });
}
