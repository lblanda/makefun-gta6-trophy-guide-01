// Leonida Ledger — the hand-in program for the gta6-trophy-guide-01 bounty.
//
// What it does, in order:
//   1. Copies this repository's app/ (the offline guide) into the output
//      directory, leaving any files already there from an earlier run alone
//      only where they are overwritten by the copy.
//   2. Copies screenshots/ (renders of the guide in a browser) alongside it.
//   3. Writes dossier.json there with the vendored make.fun library, which
//      is the summary the judge reads.
//
// Node 22, standard library only, no network, no installs. Run it locally
// with `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`; in the
// grader the output directory is /output unless MAKEFUN_OUTPUT_DIR names
// another one. The run is deterministic: same files in, same bytes out, and
// it runs twice in grading, so it must not depend on the time or on what
// was in the output directory before.
import { cpSync, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The dossier caps are the ones the sealed scorer uses: the text at most
// 160 KiB, at most 4 screenshots of at most 256 KiB each, app/ at most 993
// files and 48 MiB in all. Keeping them here, next to the call, means a
// local run fails the same way the grader would.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

// The repository root is the directory this file lives in; the output
// directory is /output in the grader, or MAKEFUN_OUTPUT_DIR locally.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(source, destination) {
  if (!existsSync(source)) return;
  mkdirSync(destination, { recursive: true });
  cpSync(source, destination, { recursive: true });
}

function freshOutputDir(dir) {
  // Start from a clean slate, but only inside the output directory: stale
  // files from an earlier run must never leak into the hand-in. The
  // directory itself is created, never removed, so a mount point stays put.
  mkdirSync(dir, { recursive: true });
  for (const entry of ['app', 'screenshots', 'dossier.json']) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

freshOutputDir(outputDir);

// The guide itself: plain static files, no build step, nothing fetched.
copyTree(join(repoRoot, 'app'), join(outputDir, 'app'));

// The screenshots, if the repository has any yet.
copyTree(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));

// The dossier is built from the output directory alone, so what the judge
// reads is exactly what was handed in — nothing else.
const dossierPath = join(outputDir, 'dossier.json');
writeFileSync(dossierPath, buildDossier(outputDir, DOSSIER_CAPS));
const dossierBytes = statSync(dossierPath).size;

console.log(`Leonida Ledger written to ${outputDir} (app/ + screenshots/ + dossier.json, ${dossierBytes} bytes).`);
