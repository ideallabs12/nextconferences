const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

const baseDir = path.join(__dirname, 'conferences');
const imgDir = path.join(baseDir, 'conference_imgs');

if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir);
}
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir);
}

function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                const file = fs.createWriteStream(dest);
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            } else {
                resolve(); // resolve anyway to not crash
            }
        }).on('error', (err) => {
            resolve();
        });
    });
}

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    console.log('Fetching conferences list...');
    await page.goto('https://www.nextconferences.org/conferences', { waitUntil: 'networkidle2' });
    
    const conferenceLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/conference/"]'));
        return Array.from(new Set(links.map(a => {
            const href = a.getAttribute('href');
            return href.includes('nextconferences.org') ? href.replace('https://www.nextconferences.org', '') : href;
        })));
    });
    
    console.log(`Found ${conferenceLinks.length} conferences.`);
    
    const conferences = [];
    
    for (const link of conferenceLinks) {
        const slug = link.replace('/conference/', '');
        const url = `https://www.nextconferences.org${link}`;
        console.log(`Processing: ${slug}`);
        
        await page.goto(url, { waitUntil: 'networkidle2' });
        
        const data = await page.evaluate(() => {
            // Extracting details based on layout
            const title = document.querySelector('h1')?.innerText?.trim() || '';
            const theme = document.querySelector('h2')?.innerText?.trim() || ''; // Guessing
            
            // Look for date and location
            let date = '';
            let location = '';
            document.querySelectorAll('p').forEach(p => {
                if (p.innerText.includes('📅')) date = p.innerText.replace('📅', '').trim();
                if (p.innerText.includes('📍')) location = p.innerText.replace('📍', '').trim();
            });

            // The images are from wixstatic
            const imgs = Array.from(document.querySelectorAll('img')).map(img => ({ src: img.src || '', alt: img.alt || '' }));
            let imgUrl = '';
            for (const img of imgs) {
                const src = img.src;
                const alt = img.alt;
                if (src.includes('wixstatic.com/media') && !alt.includes('Texture') && !alt.includes('Logo') && !src.includes('NEXT') && (src.includes('.avif') || src.includes('.jpg') || src.includes('.png'))) {
                    // Try to avoid the tiny social icons
                    if (src.includes('Instagram') || src.includes('Facebook') || src.includes('Twitter') || src.includes('LinkedIn') || src.includes('YouTube') || src.includes('140,al_c') || src.includes('153,al_c') || alt.includes('Instagram') || alt.includes('Facebook')) continue;
                    
                    // We found the first image that isn't a texture, logo, or social icon.
                    imgUrl = src;
                    break;
                }
            }


            // Get all text content for description and insight sessions
            // Here we just grab the innerText of the main container for simplicity,
            // or we try to structure it.
            const textContent = document.body.innerText;

            return {
                title,
                theme,
                date,
                location,
                imgUrl,
                textContent
            };
        });
        
        let localImgName = '';
        if (data.imgUrl) {
            const ext = path.extname(data.imgUrl).split('?')[0] || '.jpg';
            localImgName = `${slug}${ext}`;
            const dest = path.join(imgDir, localImgName);
            await downloadImage(data.imgUrl, dest);
            console.log(`Downloaded image for ${slug}`);
        }
        
        conferences.push({
            slug,
            title: data.title,
            image: localImgName,
            date: data.date,
            location: data.location,
            theme: data.theme,
            description: "Please check script logic for better extraction.",
            rawText: data.textContent
        });
    }
    
    fs.writeFileSync(path.join(baseDir, 'conferences.json'), JSON.stringify(conferences, null, 2));
    
    await browser.close();
    console.log('Done!');
})();
