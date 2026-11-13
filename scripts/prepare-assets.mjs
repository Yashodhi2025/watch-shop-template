import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

// Run only when refreshing the checked-in, locally served demo assets.
const photos = {
  'watch-hero': '1524805444758-089113d48a6d',
  'watch-classic': '1490367532201-b9bc1dc483f6',
  'watch-sport': '1547996160-81dfa63595aa',
  'watch-chrono': '1533139502658-0198f920d8e8',
  'watch-limited': '1508057198894-247b23fe5ade',
  'watch-editorial': '1434056886845-dac89ffe9b56',
};
await mkdir('public/images', { recursive: true });
await Promise.all(Object.entries(photos).map(async ([name, id]) => {
  const response = await fetch(`https://images.unsplash.com/photo-${id}?w=${name === 'watch-hero' ? 1600 : 1000}&fit=crop&auto=format&q=85`);
  if (!response.ok) throw new Error(`${name}: ${response.status}`);
  await sharp(Buffer.from(await response.arrayBuffer())).webp({ quality: 83 }).toFile(`public/images/${name}.webp`);
  console.log(`Saved ${name}`);
}));
await mkdir('public/fonts', { recursive: true });
const fontCss = await (await fetch('https://fonts.googleapis.com/css2?family=Manrope:wght@400..700&display=swap', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
})).text();
const fontUrl = [...fontCss.matchAll(/url\((https:[^)]+)\)/g)].at(-1)?.[1];
if (!fontUrl) throw new Error('Manrope font URL missing');
const fontResponse = await fetch(fontUrl);
if (!fontResponse.ok) throw new Error('Manrope download failed');
await writeFile('public/fonts/manrope.woff2', Buffer.from(await fontResponse.arrayBuffer()));
const license = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/OFL.txt');
if (!license.ok) throw new Error('Manrope license download failed');
await writeFile('public/fonts/OFL.txt', await license.text());
console.log('Saved self-hosted Manrope');
