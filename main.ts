// Leonida Ledger — the hand-in program for the gta6-trophy-guide-01 bounty.
// Node 22, standard library only, no network: it copies this repository's app/
// (the offline guide) and screenshots/ (renders of the guide in a browser) into
// the output directory and writes dossier.json there with the vendored make.fun
// library, which is the summary the judge reads. Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader the output directory is /output, unless MAKEFUN_OUTPUT_DIR
// names another one. The run is deterministic: same files in, same bytes out.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root is the directory this file lives in.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
// The grader writes to /output; a local run can point somewhere else.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });

// The guide itself: plain static files, no build step, nothing fetched at run time.
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

// The screenshots, if the repository has any yet.
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The dossier is built from the output directory alone, with the same library
// and the same caps the sealed scorer uses: text at most 160 KiB, at most 4
// screenshots of at most 256 KiB each, app/ at most 993 files and 48 MiB.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);

console.log(`Leonida Ledger written to ${outputDir} (app/ + screenshots/ + dossier.json).`);
