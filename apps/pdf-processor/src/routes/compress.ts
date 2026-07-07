import { Router } from 'express';
import multer from 'multer';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile } from 'fs/promises';
import { withTempFiles } from '../utils/tempFile';

const execFileAsync = promisify(execFile);
const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

type Quality = 'low' | 'medium' | 'high';

// Maps user-facing quality labels to Ghostscript -dPDFSETTINGS presets.
// /screen  — most aggressive (smallest file, screen-only quality)
// /ebook   — balanced default (good for most use cases)
// /printer — minimal compression (near-print quality)
const GS_SETTINGS: Record<Quality, string> = {
  low:    '/screen',
  medium: '/ebook',
  high:   '/printer',
};

router.post('/', upload.single('file'), async (req, res) => {
  const file = req.file;
  const { quality = 'medium' } = req.body as { quality?: string };

  if (!file) {
    res.status(400).json({ error: 'No file provided' });
    return;
  }

  const pdfSetting = quality in GS_SETTINGS
    ? GS_SETTINGS[quality as Quality]
    : GS_SETTINGS.medium;

  try {
    await withTempFiles(['.pdf', '.pdf'], async ([inputPath, outputPath]) => {
      await writeFile(inputPath, file.buffer);

      // Run Ghostscript — never use exec() with a string; args array prevents injection
      try {
        await execFileAsync('gs', [
          '-sDEVICE=pdfwrite',
          '-dCompatibilityLevel=1.4',
          `-dPDFSETTINGS=${pdfSetting}`,
          '-dNOPAUSE', '-dQUIET', '-dBATCH',
          `-sOutputFile=${outputPath}`,
          inputPath,
        ]);
      } catch (err: unknown) {
        const code = (err as { code?: string }).code;
        console.error('[compress] gs error:', { code });
        if (code === 'ENOENT') {
          res.status(500).json({ error: 'Ghostscript is not installed on this server' });
          return;
        }
        res.status(500).json({ error: 'Compression failed' });
        return;
      }

      // Integrity check — qpdf is already in the container
      try {
        await execFileAsync('qpdf', ['--check', outputPath]);
      } catch {
        // Corrupted output — return the original unchanged
        res.set('Content-Type', 'application/pdf')
           .set('X-Already-Optimised', 'true')
           .send(file.buffer);
        return;
      }

      const outputBytes = await readFile(outputPath);

      // Size sanity check — some already-optimised PDFs grow after a gs pass;
      // return the original with a header flag so the app can inform the user.
      if (outputBytes.byteLength >= file.buffer.byteLength) {
        res.set('Content-Type', 'application/pdf')
           .set('X-Already-Optimised', 'true')
           .send(file.buffer);
        return;
      }

      res.set('Content-Type', 'application/pdf').send(outputBytes);
    });
  } catch {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Compression failed' });
    }
  }
});

export { router as compressRouter };
