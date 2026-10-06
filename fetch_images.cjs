const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const baseDir = path.join(__dirname, 'conferences');
const imgDir = path.join(baseDir, 'conference_imgs');

if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
}
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
}

function getOriginalWixUrl(url) {
  const match = url.match(/(https:\/\/static\.wixstatic\.com\/media\/[^/]+\.(jpg|jpeg|png|webp|avif))/i);
  if (match) return match[1];
  return url;
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 5000) {
      console.log(`  [SKIP] Already exists: ${path.basename(destPath)}`);
      return resolve({ skipped: true });
    }

    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);

    proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(destPath);
        return downloadImage(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        return reject(new Error(`HTTP ${res.statusCode}: ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        const size = fs.statSync(destPath).size;
        if (size < 1000) {
          fs.unlinkSync(destPath);
          return reject(new Error(`File too small (${size} bytes) — likely a placeholder`));
        }
        console.log(`  [OK] ${path.basename(destPath)} (${Math.round(size/1024)}KB)`);
        resolve({ size });
      });
    }).on('error', (err) => {
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

(async () => {
    const conferences = JSON.parse(fs.readFileSync(path.join(baseDir, 'conferences.json'), 'utf8'));

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1440,900',
      ]
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    
    for (const conf of conferences) {
        const slug = conf.slug;
        const url = `https://www.nextconferences.org/conference/${slug}`;
        console.log(`Processing: ${slug}`);
        
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
            
            // Scroll to load lazy images
            for (let i = 0; i < 15; i++) {
                await page.evaluate(() => window.scrollBy(0, 400));
                await new Promise(r => setTimeout(r, 300));
            }
            await new Promise(r => setTimeout(r, 2000));
            
            const imgUrl = await page.evaluate(() => {
                const imgs = Array.from(document.querySelectorAll('img')).map(img => ({ src: img.src || img.dataset.src || '', alt: img.alt || '' }));
                for (const img of imgs) {
                    const src = img.src;
                    const alt = img.alt;
                    if (src.includes('wixstatic.com/media') && !alt.includes('Texture') && !alt.includes('Logo') && !src.includes('NEXT') && (src.includes('.avif') || src.includes('.jpg') || src.includes('.png'))) {
                        if (src.includes('Instagram') || src.includes('Facebook') || src.includes('Twitter') || src.includes('LinkedIn') || src.includes('YouTube') || src.includes('140,al_c') || src.includes('153,al_c') || alt.includes('Instagram') || alt.includes('Facebook')) continue;
                        return src;
                    }
                }
                return '';
            });

            if (imgUrl) {
                const originalUrl = getOriginalWixUrl(imgUrl);
                const dest = path.join(imgDir, conf.image);
                await downloadImage(originalUrl, dest);
                console.log(`Downloaded image for ${slug} from ${originalUrl}`);
            } else {
                console.log(`No image found for ${slug}`);
            }
        } catch (e) {
            console.error(`Failed to process ${slug}: ${e.message}`);
        }
    }
    
    await browser.close();
    console.log('Done downloading images!');
})();
