import { Router } from 'express';
import multer from 'multer';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile } from 'fs/promises';
import { withTempFiles } from '../utils/tempFile';

const execFileAsync = promisify(execFile);
const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

type PermissionPreset = 'full-access' | 'view-and-print' | 'read-only';

const PERMISSION_FLAGS: Record<PermissionPreset, string[]> = {
  'full-access': [
    '--print=full', '--extract=y', '--modify=all',
    '--form=y', '--annotate=y', '--assemble=y', '--accessibility=y',
  ],
  'view-and-print': [
    '--print=full', '--extract=n', '--modify=none',
    '--form=n', '--annotate=n', '--assemble=n', '--accessibility=y',
  ],
  'read-only': [
    '--print=none', '--extract=n', '--modify=none',
    '--form=n', '--annotate=n', '--assemble=n', '--accessibility=y',
  ],
};

router.post('/', upload.single('file'), async (req, res) => {
  const file = req.file;
  const { userPassword, ownerPassword, permissions = 'full-access' } = req.body as {
    userPassword: string;
    ownerPassword?: string;
    permissions?: string;
  };

  if (!file) {
    res.status(400).json({ error: 'No file provided' });
    return;
  }
  if (!userPassword) {
    res.status(400).json({ error: 'userPassword is required' });
    return;
  }

  const preset: PermissionPreset =
    permissions in PERMISSION_FLAGS ? (permissions as PermissionPreset) : 'full-access';
  const permFlags = PERMISSION_FLAGS[preset];
  const owner = ownerPassword || userPassword;

  try {
    await withTempFiles(['.pdf', '.pdf'], async ([inputPath, outputPath]) => {
      await writeFile(inputPath, file.buffer);

      try {
        await execFileAsync('qpdf', [
          '--warning-exit-0',
          '--encrypt', userPassword, owner, '256',
          ...permFlags,
          '--',
          inputPath,
          outputPath,
        ]);
      } catch (err: unknown) {
        const code = (err as { code?: string }).code;
        const stderr = (err as { stderr?: string }).stderr ?? '';
        console.error('[encrypt] qpdf error:', { code, stderr });

        if (code === 'ENOENT') {
          res.status(500).json({ error: 'qpdf is not installed on this server' });
          return;
        }
        res.status(500).json({ error: 'Encryption failed' });
        return;
      }

      const outputBytes = await readFile(outputPath);
      res.set('Content-Type', 'application/pdf').send(outputBytes);
    });
  } catch {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Encryption failed' });
    }
  }
});

export { router as encryptRouter };
