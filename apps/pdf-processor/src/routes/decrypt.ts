import { Router } from 'express';
import multer from 'multer';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile } from 'fs/promises';
import { withTempFiles } from '../utils/tempFile';

const execFileAsync = promisify(execFile);
const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post('/', upload.single('file'), async (req, res) => {
  const file = req.file;
  const { password } = req.body as { password: string };

  if (!file) {
    res.status(400).json({ error: 'No file provided' });
    return;
  }
  if (!password) {
    res.status(400).json({ error: 'password is required' });
    return;
  }

  try {
    await withTempFiles(['.pdf', '.pdf'], async ([inputPath, outputPath]) => {
      await writeFile(inputPath, file.buffer);

      try {
        await execFileAsync('qpdf', [
          '--warning-exit-0',
          '--decrypt',
          `--password=${password}`,
          inputPath,
          outputPath,
        ]);
      } catch (err: unknown) {
        const code = (err as { code?: string }).code;
        const stderr = (err as { stderr?: string }).stderr ?? '';
        console.error('[decrypt] qpdf error:', { code, stderr });

        if (code === 'ENOENT') {
          res.status(500).json({ error: 'qpdf is not installed on this server' });
          return;
        }
        const isWrongPassword =
          stderr.includes('invalid password') || stderr.includes('password');
        res.status(400).json({
          error: isWrongPassword ? 'Incorrect password' : 'Failed to decrypt PDF',
        });
        return;
      }

      const outputBytes = await readFile(outputPath);
      res.set('Content-Type', 'application/pdf').send(outputBytes);
    });
  } catch {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Decryption failed' });
    }
  }
});

export { router as decryptRouter };
