import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';

export async function withTempFiles<T>(
  extensions: string[],
  fn: (paths: string[]) => Promise<T>,
): Promise<T> {
  const paths = extensions.map((ext) => join(tmpdir(), `${randomUUID()}${ext}`));
  try {
    return await fn(paths);
  } finally {
    await Promise.allSettled(paths.map((p) => unlink(p).catch(() => {})));
  }
}

export async function writeTempFile(data: Buffer, ext: string): Promise<string> {
  const path = join(tmpdir(), `${randomUUID()}${ext}`);
  await writeFile(path, data);
  return path;
}
