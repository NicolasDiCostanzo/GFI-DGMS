import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const DEFAULT_MAX_GZIP_KB = 120;
const maxGzipKb = Number(process.env.MAX_GZIP_KB ?? DEFAULT_MAX_GZIP_KB);
if (!Number.isFinite(maxGzipKb) || maxGzipKb <= 0) {
    throw new Error('MAX_GZIP_KB must be a positive finite number');
}

const bundlePath = join(process.cwd(), 'dist', 'gfi-widget.js');
const bundle = readFileSync(bundlePath);
const gzipBytes = gzipSync(bundle).length;
const gzipKb = gzipBytes / 1024;

console.log(`gfi-widget.js gzip: ${gzipKb.toFixed(2)} kB (limit: ${maxGzipKb} kB)`);

if (gzipKb > maxGzipKb) {
    console.error(
        `Bundle size ${gzipKb.toFixed(2)} kB exceeds the ${maxGzipKb} kB gzip limit. ` +
            'Run `npm run build` first, then re-run this check.',
    );
    process.exit(1);
}