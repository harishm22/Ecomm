const fs = require('fs');
const { PNG } = require('pngjs');

fs.createReadStream('public/icon.png')
  .pipe(new PNG())
  .on('parsed', function() {
    console.log('Processing icon.png...');
    
    // Cart is at X: 344..800 (width=456), Y: 227..618 (height=391)
    const cartCenterX = Math.round((344 + 800) / 2); // 572
    const cartCenterY = Math.round((227 + 618) / 2); // 422.5 -> 422
    
    // Create a 560x560 square crop
    const size = 560;
    const half = Math.round(size / 2);
    const startX = cartCenterX - half;
    const startY = cartCenterY - half;
    
    const output = new PNG({ width: size, height: size });
    
    // Target violet colors:
    // Original orange is around (242, 107, 15) to (255, 140, 40)
    // We want violet #7C3AED (124, 58, 237) and #A855F7 (168, 85, 247)
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const srcX = startX + x;
        const srcY = startY + y;
        
        const dstIdx = (size * y + x) * 4;
        
        if (srcX < 0 || srcX >= this.width || srcY < 0 || srcY >= this.height) {
          output.data[dstIdx] = 255;
          output.data[dstIdx + 1] = 255;
          output.data[dstIdx + 2] = 255;
          output.data[dstIdx + 3] = 0; // transparent
          continue;
        }
        
        const srcIdx = (this.width * srcY + srcX) * 4;
        let r = this.data[srcIdx];
        let g = this.data[srcIdx + 1];
        let b = this.data[srcIdx + 2];
        let a = this.data[srcIdx + 3];
        
        // If background is grey (#D0D0D0) or white, make background transparent
        if (r > 195 && g > 195 && b > 195 && Math.abs(r - g) < 15 && Math.abs(g - b) < 15) {
          // If pure white or grey background
          a = 0;
        }
        
        // Check for orange circle and its anti-aliasing:
        // Orange has R > G and R > B, specifically R > 150, G between 50 and 190, B < 120
        if (r > 150 && g > 40 && g < 190 && b < 130 && (r - b) > 60 && (r - g) > 20) {
          // Compute brightness/intensity
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          
          // Map to rich violet gradient from top to bottom
          const verticalFactor = (y / size);
          // Top #A855F7 (168, 85, 247), Bottom #7C3AED (124, 58, 237)
          const targetR = 168 - (168 - 124) * verticalFactor;
          const targetG = 85 - (85 - 58) * verticalFactor;
          const targetB = 247 - (247 - 237) * verticalFactor;
          
          r = Math.round(targetR * (luminance * 1.3));
          g = Math.round(targetG * (luminance * 1.3));
          b = Math.round(targetB * (luminance * 1.3));
          
          if (r > 255) r = 255;
          if (g > 255) g = 255;
          if (b > 255) b = 255;
          a = 255;
        }
        
        output.data[dstIdx] = r;
        output.data[dstIdx + 1] = g;
        output.data[dstIdx + 2] = b;
        output.data[dstIdx + 3] = a;
      }
    }
    
    output.pack().pipe(fs.createWriteStream('public/icon-violet.png'))
      .on('finish', () => {
        console.log('✨ Perfectly crafted public/icon-violet.png with original smooth geometry and violet theme!');
      });
  });
