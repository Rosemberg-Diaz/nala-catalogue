// Temporary Unsplash catalogue photography. Replace with approved business photographs before launch.
import { mkdir, writeFile, copyFile } from 'node:fs/promises';
const images = {
  hero: 'photo-1611652022419-a9419f74343d',
  earrings: 'photo-1535632066927-ab7c9ab60908',
  necklace: 'photo-1599643477877-530eb83abc8e',
  bracelet: 'photo-1611591437281-460bfbe1220a',
  ring: 'photo-1605100804763-247f67b3557e',
  pearl: 'photo-1535632066927-ab7c9ab60908',
  jewelry: 'photo-1617038260897-41a1f14a8ca0',
  hair: 'photo-1522337360788-8b13dee7a37e',
};
await mkdir('public/images', { recursive: true });
for (const [name, id] of Object.entries(images)) {
  const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${name === 'hero' ? 1200 : 800}&q=82&fm=jpg`;
  const response = await fetch(url);
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`Image unavailable: ${name} (${response.status})`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  await writeFile(`public/images/${name}.jpg`, bytes);
  console.log(`${name}: ${Math.round(bytes.length / 1024)} KB`);
}
const social = await fetch('https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&h=630&q=80&fm=jpg');
if (social.ok) await writeFile('public/images/social.jpg', new Uint8Array(await social.arrayBuffer()));
else await copyFile('public/images/hero.jpg', 'public/images/social.jpg');
