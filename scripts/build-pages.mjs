import { build } from 'vite';
import { writeFile } from 'node:fs/promises';

await build({ mode: 'pages' });
await writeFile(new URL('../docs/.nojekyll', import.meta.url), '');
console.log('Versión estática generada en docs/. Publica main /docs en GitHub Pages.');
