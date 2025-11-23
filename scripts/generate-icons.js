const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'assets', 'icon.svg');
const assetsPath = path.join(__dirname, '..', 'assets');

const svgContent = fs.readFileSync(svgPath, 'utf8');

async function generateIcons() {
  console.log('Generating icons...');

  // Main icon (1024x1024)
  await sharp(Buffer.from(svgContent))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsPath, 'icon.png'));
  console.log('Created icon.png (1024x1024)');

  // Adaptive icon for Android (1024x1024)
  await sharp(Buffer.from(svgContent))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsPath, 'adaptive-icon.png'));
  console.log('Created adaptive-icon.png (1024x1024)');

  // Splash icon (same as icon)
  await sharp(Buffer.from(svgContent))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsPath, 'splash-icon.png'));
  console.log('Created splash-icon.png (1024x1024)');

  // Favicon (48x48)
  await sharp(Buffer.from(svgContent))
    .resize(48, 48)
    .png()
    .toFile(path.join(assetsPath, 'favicon.png'));
  console.log('Created favicon.png (48x48)');

  // PWA icons
  const pwaSizes = [72, 96, 128, 144, 152, 192, 384, 512];
  for (const size of pwaSizes) {
    await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toFile(path.join(assetsPath, `icon-${size}.png`));
    console.log(`Created icon-${size}.png`);
  }

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
