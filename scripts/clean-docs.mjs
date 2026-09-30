import { lstat, readdir, rm } from 'node:fs/promises';

// Resolve relative to this script, never the caller's working directory.
const outputDirectory = new URL('../docs/', import.meta.url);
const preservedFiles = new Set(['CNAME', '.nojekyll']);
const directory = await lstat(new URL('../docs', import.meta.url)).catch(error => {
  if (error.code !== 'ENOENT') throw error;
});

if (directory) {
  if (!directory.isDirectory() || directory.isSymbolicLink()) {
    throw new Error('Refusing to clean docs: expected a real directory.');
  }

  for (const name of await readdir(outputDirectory)) {
    if (!preservedFiles.has(name)) {
      await rm(new URL(encodeURIComponent(name), outputDirectory), { recursive: true, force: true });
    }
  }
}
