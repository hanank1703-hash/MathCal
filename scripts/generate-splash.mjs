import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const BG = '#0a0a18';
const TEXT_COLOR = '#eeeaf5';
const ACCENT = '#c4b0f0';

const sizes = {
  'drawable/splash.png': [480, 320],
  'drawable-port-mdpi/splash.png': [320, 480],
  'drawable-port-hdpi/splash.png': [480, 800],
  'drawable-port-xhdpi/splash.png': [720, 1280],
  'drawable-port-xxhdpi/splash.png': [960, 1600],
  'drawable-port-xxxhdpi/splash.png': [1280, 1920],
  'drawable-land-mdpi/splash.png': [480, 320],
  'drawable-land-hdpi/splash.png': [800, 480],
  'drawable-land-xhdpi/splash.png': [1280, 720],
  'drawable-land-xxhdpi/splash.png': [1600, 960],
  'drawable-land-xxxhdpi/splash.png': [1920, 1280],
};

const BASE = 'android/app/src/main/res';

for (const [path, [w, h]] of Object.entries(sizes)) {
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;

  const moonSize = Math.min(w, h) * 0.06;
  ctx.fillStyle = '#f5c842';
  ctx.beginPath();
  ctx.arc(cx, cy - moonSize * 1.8, moonSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = BG;
  ctx.beginPath();
  ctx.arc(cx + moonSize * 0.35, cy - moonSize * 1.8 - moonSize * 0.25, moonSize * 0.75, 0, Math.PI * 2);
  ctx.fill();

  const fontSize = Math.min(w, h) * 0.045;
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = `300 ${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Calm Moment', cx, cy + moonSize * 0.8);

  const fullPath = `${BASE}/${path}`;
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, canvas.toBuffer('image/png'));
  console.log(`Generated ${path} (${w}x${h})`);
}

console.log('All splash screens generated');
