// After the build: a 404.html copy so static hosts without rewrite rules (e.g. GitHub Pages) still open /shop directly.
import { copyFileSync, existsSync } from 'node:fs';
if (existsSync('dist/index.html')) copyFileSync('dist/index.html', 'dist/404.html');
console.log('postbuild: dist/404.html written');
