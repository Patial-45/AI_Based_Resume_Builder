import yauzl from 'yauzl';
import { HttpError } from '../middleware/errors.js';
export function validateDocx(buffer) {
  return new Promise((resolve, reject) => {
    const invalid = () => new HttpError(422, 'INVALID_DOCX', 'Use an unencrypted DOCX under the document size limit.');
    yauzl.fromBuffer(buffer, { lazyEntries: true, validateEntrySizes: true }, (error, zip) => {
      if (error) return reject(invalid());
      let count = 0, total = 0, documentFound = false, stopped = false;
      const fail = () => { if (stopped) return; stopped = true; zip.close(); reject(invalid()); };
      zip.on('error', fail);
      zip.on('end', () => { if (stopped) return; stopped = true; documentFound ? resolve() : reject(invalid()); });
      zip.on('entry', entry => {
        if (++count > 2000 || entry.generalPurposeBitFlag & 1 || entry.uncompressedSize > 20 * 1024 * 1024) return fail();
        if (entry.fileName === 'word/document.xml') documentFound = true;
        if (entry.fileName.endsWith('/')) { zip.readEntry(); return; }
        zip.openReadStream(entry, (error, stream) => {
          if (error) return fail();
          stream.on('error', fail);
          stream.on('data', chunk => { total += chunk.length; if (total > 20 * 1024 * 1024) { stream.destroy(); fail(); } });
          stream.on('end', () => { if (!stopped) zip.readEntry(); });
        });
      });
      zip.readEntry();
    });
  });
}

