const fs = require('fs');
const { PNG } = require('pngjs');

// Read icon.png
fs.createReadStream('public/icon.png')
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function() {
    console.log('Original parsed: width=', this.width, 'height=', this.height);
    
    // Find bounds of non-white pixels in top 75% of image (excluding "E-COMMERCE" text at bottom)
    let minX = this.width, maxX = 0, minY = this.height, maxY = 0;
    
    for (let y = 0; y < this.height * 0.72; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = (this.width * y + x) << 2;
        const r = this.data[idx];
        const g = this.data[idx + 1];
        const b = this.data[idx + 2];
        const a = this.data[idx + 3];
        
        // Not background white / transparent
        if (a > 50 && (r < 240 || g < 240 || b < 240)) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    
    console.log('Icon bounding box:', { minX, maxX, minY, maxY });
    
    // Add square padding
    const iconW = maxX - minX;
    const iconH = maxY - minY;
    const side = Math.max(iconW, iconH);
    const pad = Math.round(side * 0.12);
    const totalSide = side + pad * 2;
    
    const cropped = new PNG({ width: totalSide, height: totalSide });
    
    // Initialize transparent/white
    for (let i = 0; i < cropped.data.length; i += 4) {
      cropped.data[i] = 255;
      cropped.data[i + 1] = 255;
      cropped.data[i + 2] = 255;
      cropped.data[i + 3] = 0; // transparent background
    }
    
    const offsetX = Math.round((totalSide - iconW) / 2);
    const offsetY = Math.round((totalSide - iconH) / 2);
    
    for (let y = 0; y < iconH; y++) {
      for (let x = 0; x < iconW; x++) {
        const srcX = minX + x;
        const srcY = minY + y;
        if (srcX >= this.width || srcY >= this.height) continue;
        
        const srcIdx = (this.width * srcY + srcX) << 2;
        const dstIdx = (totalSide * (offsetY + y) + (offsetX + x)) << 2;
        
        let r = this.data[srcIdx];
        let g = this.data[srcIdx + 1];
        let b = this.data[srcIdx + 2];
        let a = this.data[srcIdx + 3];
        
        // Detect Orange Circle pixels: high red, moderate green, low blue (r > 180, g between 60 and 160, b < 60)
        // Or if it's noticeably orange hue
        if (r > 160 && g > 40 && g < 180 && b < 100 && r > g * 1.3 && r > b * 2) {
          // Convert orange to theme violet: #7C3AED (124, 58, 237) or #8B5CF6 (139, 92, 246)
          const factor = r / 255;
          r = Math.round(124 * factor + 35 * (1 - factor));
          g = Math.round(58 * factor + 20 * (1 - factor));
          b = Math.round(237 * factor + 180 * (1 - factor));
        }
        
        cropped.data[dstIdx] = r;
        cropped.data[dstIdx + 1] = g;
        cropped.data[dstIdx + 2] = b;
        cropped.data[dstIdx + 3] = a;
      }
    }
    
    cropped.pack().pipe(fs.createWriteStream('public/icon-violet.png'))
      .on('finish', () => {
        console.log('✅ Created public/icon-violet.png with exact original icon and violet theme!');
      });
  });
