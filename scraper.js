import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
            }
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                   .on('error', reject)
                   .once('close', () => resolve(filepath));
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        });
    });
};

const scrapeSpeakers = async () => {
    const targetUrl = 'https://www.nextconferences.org/speakers';
    const speakersDir = path.join(__dirname, 'src', 'pages', 'speakers', 'speakers_imgs');
    const speakersDataPath = path.join(__dirname, 'src', 'pages', 'speakers', 'speakers.json');
    
    // Ensure directory exists
    if (!fs.existsSync(speakersDir)) {
        fs.mkdirSync(speakersDir, { recursive: true });
    }

    console.log(`Starting headless browser to scrape speakers from: ${targetUrl}`);
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36');

    try {
        console.log(`Navigating to ${targetUrl}`);
        await page.goto(targetUrl, { waitUntil: 'networkidle2' });

        // Scroll down a few times to ensure dynamic content loads
        for (let i = 0; i < 5; i++) {
            await page.evaluate(() => window.scrollBy(0, window.innerHeight));
            await new Promise(r => setTimeout(r, 1000));
        }

        console.log('Extracting speaker data...');
        const speakers = await page.evaluate(() => {
            const speakerNodes = Array.from(document.querySelectorAll('.wixui-repeater__item'));
            const data = [];
            
            speakerNodes.forEach((node) => {
                const imgNode = node.querySelector('.wixui-image img');
                const nameNode = node.querySelector('.font_5') || node.querySelector('[style*="font-size:22px"]');
                const descNode = node.querySelector('.font_8');
                
                if (imgNode && nameNode) {
                    let imgUrl = imgNode.src;
                    if (imgUrl.includes('srcset') || !imgUrl) {
                        imgUrl = imgNode.getAttribute('src');
                    }
                    // Clean up URL if it's a small Wix thumbnail, try to get the original or a larger version
                    imgUrl = imgUrl.split('/v1/')[0] || imgUrl;
                    
                    data.push({
                        name: nameNode.textContent.trim(),
                        description: descNode ? descNode.textContent.trim() : '',
                        imageSrc: imgUrl
                    });
                }
            });
            
            return data;
        });

        console.log(`Found ${speakers.length} speakers. Downloading images...`);
        
        let downloadedCount = 0;
        const finalSpeakersData = [];

        for (let i = 0; i < speakers.length; i++) {
            let { name, description, imageSrc } = speakers[i];
            
            // Format filename
            const ext = imageSrc.split('.').pop().split('?')[0].split('~')[0] || 'jpg';
            const safeName = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            const filename = `speaker_${safeName}_${i + 1}.${ext}`;
            const filepath = path.join(speakersDir, filename);
            
            try {
                await downloadImage(imageSrc, filepath);
                console.log(`✅ Downloaded: ${filename} (${name})`);
                downloadedCount++;
                
                finalSpeakersData.push({
                    id: i + 1,
                    name,
                    description,
                    image: `/src/pages/speakers/speakers_imgs/${filename}`
                });
            } catch (err) {
                console.error(`❌ Failed to download image for ${name} (${imageSrc}): ${err.message}`);
                // Add them without an image if download fails
                finalSpeakersData.push({
                    id: i + 1,
                    name,
                    description,
                    image: null
                });
            }
        }
        
        // Save the JSON data
        fs.writeFileSync(speakersDataPath, JSON.stringify(finalSpeakersData, null, 2));
        console.log(`\\n🎉 Successfully downloaded ${downloadedCount} images and saved data to speakers.json`);
    } catch (error) {
        console.error('An error occurred during scraping:', error);
    } finally {
        await browser.close();
    }
};

(async () => {
    await scrapeSpeakers();
})();
