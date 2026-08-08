import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const BG = '#0f0f24';
const MOON_COLOR = '#f5c842';

function drawIcon(size, outPath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;

  const grad = ctx.createRadialGradient(cx, cy * 0.8, 0, cx, cy, size * 0.7);
  grad.addColorStop(0, '#1a1a3e');
  grad.addColorStop(1, '#0a0a18');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const moonR = size * 0.22;
  ctx.fillStyle = MOON_COLOR;
  ctx.beginPath();
  ctx.arc(cx, cy - size * 0.02, moonR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = BG;
  ctx.beginPath();
  ctx.arc(cx + moonR * 0.4, cy - size * 0.02 - moonR * 0.3, moonR * 0.75, 0, Math.PI * 2);
  ctx.fill();

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, canvas.toBuffer('image/png'));
}

// Android icons
const androidBase = 'android/app/src/main/res';
const androidSizes = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
for (const [density, size] of Object.entries(androidSizes)) {
  drawIcon(size, `${androidBase}/mipmap-${density}/ic_launcher.png`);
  drawIcon(size, `${androidBase}/mipmap-${density}/ic_launcher_round.png`);
  console.log(`Android ${density}: ${size}x${size}`);
}

// iOS icons
const iosBase = 'ios/App/App/Assets.xcassets/AppIcon.appiconset';
const iosSizes = [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024];
for (const size of iosSizes) {
  drawIcon(size, `${iosBase}/AppIcon-${size}x${size}.png`);
  console.log(`iOS: ${size}x${size}`);
}

// Write iOS Contents.json
const contents = {
  images: [
    { size: '20x20', idiom: 'iphone', scale: '2x', filename: 'AppIcon-40x40.png' },
    { size: '20x20', idiom: 'iphone', scale: '3x', filename: 'AppIcon-60x60.png' },
    { size: '29x29', idiom: 'iphone', scale: '2x', filename: 'AppIcon-58x58.png' },
    { size: '29x29', idiom: 'iphone', scale: '3x', filename: 'AppIcon-87x87.png' },
    { size: '40x40', idiom: 'iphone', scale: '2x', filename: 'AppIcon-80x80.png' },
    { size: '40x40', idiom: 'iphone', scale: '3x', filename: 'AppIcon-120x120.png' },
    { size: '60x60', idiom: 'iphone', scale: '2x', filename: 'AppIcon-120x120.png' },
    { size: '60x60', idiom: 'iphone', scale: '3x', filename: 'AppIcon-180x180.png' },
    { size: '20x20', idiom: 'ipad', scale: '1x', filename: 'AppIcon-20x20.png' },
    { size: '20x20', idiom: 'ipad', scale: '2x', filename: 'AppIcon-40x40.png' },
    { size: '29x29', idiom: 'ipad', scale: '1x', filename: 'AppIcon-29x29.png' },
    { size: '29x29', idiom: 'ipad', scale: '2x', filename: 'AppIcon-58x58.png' },
    { size: '40x40', idiom: 'ipad', scale: '1x', filename: 'AppIcon-40x40.png' },
    { size: '40x40', idiom: 'ipad', scale: '2x', filename: 'AppIcon-80x80.png' },
    { size: '76x76', idiom: 'ipad', scale: '1x', filename: 'AppIcon-76x76.png' },
    { size: '76x76', idiom: 'ipad', scale: '2x', filename: 'AppIcon-152x152.png' },
    { size: '83.5x83.5', idiom: 'ipad', scale: '2x', filename: 'AppIcon-167x167.png' },
    { size: '1024x1024', idiom: 'ios-marketing', scale: '1x', filename: 'AppIcon-1024x1024.png' },
  ],
  info: { version: 1, author: 'xcode' },
};
writeFileSync(`${iosBase}/Contents.json`, JSON.stringify(contents, null, 2));
console.log('iOS Contents.json written');

// iOS splash storyboard background color
const iosLaunchBase = 'ios/App/App/Assets.xcassets/Splash.imageset';
mkdirSync(iosLaunchBase, { recursive: true });

const splashCanvas = createCanvas(2732, 2732);
const sctx = splashCanvas.getContext('2d');
sctx.fillStyle = '#0a0a18';
sctx.fillRect(0, 0, 2732, 2732);
const scx = 2732 / 2;
const scy = 2732 / 2;
const smr = 120;
sctx.fillStyle = MOON_COLOR;
sctx.beginPath();
sctx.arc(scx, scy - 80, smr, 0, Math.PI * 2);
sctx.fill();
sctx.fillStyle = '#0a0a18';
sctx.beginPath();
sctx.arc(scx + smr * 0.4, scy - 80 - smr * 0.3, smr * 0.75, 0, Math.PI * 2);
sctx.fill();
sctx.fillStyle = '#eeeaf5';
sctx.font = '300 64px sans-serif';
sctx.textAlign = 'center';
sctx.fillText('Calm Moment', scx, scy + 80);
writeFileSync(`${iosLaunchBase}/splash-2732x2732.png`, splashCanvas.toBuffer('image/png'));

const splashContents = {
  images: [
    { idiom: 'universal', filename: 'splash-2732x2732.png', scale: '1x' },
    { idiom: 'universal', filename: 'splash-2732x2732.png', scale: '2x' },
    { idiom: 'universal', filename: 'splash-2732x2732.png', scale: '3x' },
  ],
  info: { version: 1, author: 'xcode' },
};
writeFileSync(`${iosLaunchBase}/Contents.json`, JSON.stringify(splashContents, null, 2));
console.log('iOS splash assets generated');

console.log('\nAll icons and splash screens generated!');
