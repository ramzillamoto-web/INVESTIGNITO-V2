import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Exact SVG of the uploaded white fedora + sunglasses on solid black background
const svgWhiteOnBlack = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Solid Black Background -->
  <rect width="512" height="512" fill="#000000" />
  
  <!-- Centered Icon Group -->
  <g transform="translate(0, 5)">
    <!-- Fedora Crown (White) -->
    <path
      d="M 194 230
         C 188 195, 194 175, 206 158
         C 218 140, 235 145, 256 160
         C 277 145, 294 140, 306 158
         C 318 175, 324 195, 318 230
         Z"
      fill="#ffffff"
    />

    <!-- Hat Ribbon / Band (Solid Black Cutout) -->
    <path
      d="M 188 232
         C 225 244, 287 244, 324 232
         L 326 248
         C 287 261, 225 261, 186 248
         Z"
      fill="#000000"
    />

    <!-- Fedora Wide Curved Brim (White) -->
    <path
      d="M 138 256
         C 178 232, 334 232, 374 256
         C 388 266, 376 288, 342 284
         C 292 278, 220 278, 170 284
         C 136 288, 124 266, 138 256
         Z"
      fill="#ffffff"
    />

    <!-- Left Sunglasses Lens (White) -->
    <path
      d="M 189 298
         C 189 292, 244 292, 244 298
         C 244 322, 238 333, 216 333
         C 195 333, 189 322, 189 298
         Z"
      fill="#ffffff"
    />

    <!-- Right Sunglasses Lens (White) -->
    <path
      d="M 268 298
         C 268 292, 323 292, 323 298
         C 323 322, 317 333, 296 333
         C 274 333, 268 322, 268 298
         Z"
      fill="#ffffff"
    />

    <!-- Sunglasses Bridge (White) -->
    <path
      d="M 242 298
         H 270
         V 305
         H 242
         Z"
      fill="#ffffff"
    />
  </g>
</svg>
`;

async function generateAll() {
  const pubDir = path.resolve('public');
  
  // Write SVG files
  fs.writeFileSync(path.join(pubDir, 'investignito-app-icon.svg'), svgWhiteOnBlack);
  fs.writeFileSync(path.join(pubDir, 'investignito-logo.svg'), svgWhiteOnBlack);
  fs.writeFileSync(path.join(pubDir, 'favicon.svg'), svgWhiteOnBlack);

  const svgBuffer = Buffer.from(svgWhiteOnBlack);

  // Generate PNG sizes
  const sizes = [
    { name: 'icon-32.png', size: 32 },
    { name: 'icon-64.png', size: 64 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'icon-maskable-512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
  ];

  for (const item of sizes) {
    await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png()
      .toFile(path.join(pubDir, item.name));
    console.log(`Generated ${item.name}`);
  }

  console.log('All icons generated successfully!');
}

generateAll().catch(console.error);
