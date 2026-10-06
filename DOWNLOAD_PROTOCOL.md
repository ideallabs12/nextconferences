# 📋 NEXT Conferences — Data Download Protocol

> **Purpose:** Step-by-step instructions for an AI agent to correctly download images and JSON data from the NEXT Conferences website using a headless Puppeteer browser.
> **Critical Rule:** NEVER use DOM text scraping for images. NEVER save screenshots. ALWAYS extract the actual `src` URL from `<img>` tags and download the file via HTTP.

---

## 🗂️ Output Folder Structure

Every download session must produce EXACTLY this structure:

```
next_data/
├── images_folder/
│   ├── conference_images/      ← conference card banner images
│   ├── speaker_images/         ← speaker portrait photos
│   ├── gallery_images/         ← event gallery photos
│   ├── committee_images/       ← committee member photos
│   └── logo/                   ← NEXT logo and brand assets
└── json_files/
    ├── conferences.json
    ├── speakers.json
    ├── gallery.json
    ├── packages.json
    ├── faqs.json
    ├── committee.json
    ├── about.json
    ├── social_media.json
    ├── reviews.json
    └── power_features.json
```

**Create all folders before downloading anything:**
```js
const dirs = [
  'next_data/images_folder/conference_images',
  'next_data/images_folder/speaker_images',
  'next_data/images_folder/gallery_images',
  'next_data/images_folder/committee_images',
  'next_data/images_folder/logo',
  'next_data/json_files',
];
dirs.forEach(d => fs.mkdirSync(d, { recursive: true }));
```

---

## ⚙️ Puppeteer Setup (Mandatory)

```js
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: true,                          // ← MUST be true (headless)
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
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
);
```

---

## 🖼️ Critical Image Download Rules

### ❌ NEVER DO THIS:
```js
// WRONG — captures a screenshot pixel image, NOT the actual content image
await page.screenshot({ path: 'image.png' });

// WRONG — reads DOM text, does not give you real image URLs
const html = await page.content();

// WRONG — Wix lazy-load URLs are low-res cropped versions
// e.g. "https://static.wixstatic.com/media/abc~mv2.jpg/v1/fill/w_400,h_300/abc~mv2.jpg"
// This is a CROPPED THUMBNAIL, not the original
```

### ✅ ALWAYS DO THIS:
```js
// CORRECT — use page.evaluate() inside Puppeteer to read actual img.src
const imageUrls = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('img'))
    .map(img => img.src || img.getAttribute('data-src') || '')
    .filter(src => src.startsWith('http') && !src.includes('data:'));
});

// CORRECT — for Wix sites, strip the resize params to get ORIGINAL image
function getOriginalWixUrl(url) {
  // Wix URL pattern: https://static.wixstatic.com/media/HASH~mv2.jpg/v1/fill/w_X,h_Y,.../HASH~mv2.jpg
  // Strip everything after the file extension in the first segment
  const match = url.match(/(https:\/\/static\.wixstatic\.com\/media\/[^/]+\.(jpg|jpeg|png|webp|avif))/i);
  if (match) return match[1];
  return url; // fallback to original if pattern doesn't match
}
```

### ✅ Correct Download Function:
```js
import https from 'https';
import http from 'http';
import fs from 'fs';

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    // Skip if file already exists (safe re-run)
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 5000) {
      console.log(`  [SKIP] Already exists: ${path.basename(destPath)}`);
      return resolve({ skipped: true });
    }

    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);

    proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      // Handle redirects
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
        // Validate file is not empty/corrupt
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
```

---

## 📄 Page-by-Page Download Instructions

### When the user gives you a URL + section name, follow this exact pattern:

---

### 🏛️ CONFERENCES PAGE
**URL:** `https://www.nextconferences.org/conferences`

```js
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });

// Step 1: Scroll slowly to trigger lazy-load
for (let i = 0; i < 20; i++) {
  await page.evaluate(() => window.scrollBy(0, 400));
  await new Promise(r => setTimeout(r, 500));
}
await new Promise(r => setTimeout(r, 3000)); // wait for all images to load

// Step 2: Extract conference cards
const conferences = await page.evaluate(() => {
  const results = [];
  // Find all images that are conference banners (large, not icons/logos)
  document.querySelectorAll('img').forEach(img => {
    const src = img.src || img.dataset.src || '';
    if (!src || src.includes('data:') || src.includes('.svg')) return;

    // Only large images (conference banners are usually > 200px wide)
    const rect = img.getBoundingClientRect();
    if (img.naturalWidth < 200 && rect.width < 100) return;

    // Walk up to find card text (title, date, location)
    let el = img.parentElement;
    let title = '', date = '', location = '';
    for (let depth = 0; depth < 10; depth++) {
      if (!el) break;
      const text = el.innerText || '';
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

      // Date pattern: contains month name and year
      const dateLine = lines.find(l => /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d/i.test(l));
      // Location pattern: city, country
      const locLine = lines.find(l => /,\s*[A-Z][a-z]+/.test(l) && l.length < 60 && !l.includes('📅'));
      // Title: longest meaningful line
      const titleLine = lines.find(l => l.length > 20 && l.length < 200 && !/^\d/.test(l) && !l.includes('📅'));

      if (dateLine || titleLine) {
        title = titleLine || '';
        date = dateLine ? dateLine.replace('📅', '').trim() : '';
        location = locLine || '';
        break;
      }
      el = el.parentElement;
    }

    if (src.startsWith('http')) {
      results.push({ title, date, location, raw_image_url: src });
    }
  });
  return results;
});

// Step 3: Get original Wix URLs & download
const seen = new Set();
let confIndex = 0;
const confData = [];

for (const conf of conferences) {
  const originalUrl = getOriginalWixUrl(conf.raw_image_url);
  if (seen.has(originalUrl)) continue;
  seen.add(originalUrl);

  const ext = originalUrl.match(/\.(jpg|jpeg|png|webp|avif)/i)?.[1] || 'jpg';
  const filename = `conf_${confIndex}_NEXT_Premier_League_.${ext}`;
  const destPath = `next_data/images_folder/conference_images/${filename}`;

  try {
    await downloadImage(originalUrl, destPath);
    confData.push({
      id: `next_${String(confIndex + 1).padStart(2, '0')}`,
      title: conf.title,
      date: conf.date,
      location: conf.location,
      local_url: `images_folder/conference_images/${filename}`,
    });
    confIndex++;
  } catch(e) {
    console.log(`  [FAIL] conf_${confIndex}: ${e.message}`);
  }
}

fs.writeFileSync('next_data/json_files/conferences.json', JSON.stringify(confData, null, 2));
```

---

### 🎤 SPEAKERS PAGE
**URL:** `https://www.nextconferences.org/speakers`

```js
// Same scroll pattern as above...

const speakers = await page.evaluate(() => {
  const results = [];
  document.querySelectorAll('img').forEach(img => {
    const src = img.src || img.dataset.src || '';
    if (!src || src.includes('data:') || src.includes('.svg')) return;

    // Speaker photos: look for circular/portrait images
    // Walk up to find name
    let el = img.parentElement;
    for (let depth = 0; depth < 8; depth++) {
      if (!el) break;
      const lines = (el.innerText || '').split('\n').map(l => l.trim()).filter(Boolean);

      // Name: 2-5 words, starts with capital, no special chars
      const nameLine = lines.find(l => {
        const words = l.trim().split(/\s+/);
        return words.length >= 2 && words.length <= 6 &&
               /^[A-Z]/.test(l) &&
               !l.includes('@') && !l.includes('http') &&
               !['Contact Us', 'Privacy Policy', 'Home', 'About', 'Gallery',
                 'Conferences', 'Speakers', 'FAQ'].includes(l);
      });

      if (nameLine) {
        const bioLine = lines.find(l => l !== nameLine && l.length > 15);
        results.push({ name: nameLine, info: bioLine || '', raw_image_url: src });
        break;
      }
      el = el.parentElement;
    }
  });
  return results;
});

// Deduplicate by name
const seenNames = new Set();
const speakerData = [];

for (const sp of speakers) {
  if (!sp.name || seenNames.has(sp.name)) continue;
  // Skip non-person entries
  if (['Contact Us','Privacy Policy','Terms','Home','About'].includes(sp.name)) continue;
  seenNames.add(sp.name);

  const originalUrl = getOriginalWixUrl(sp.raw_image_url);
  const ext = originalUrl.match(/\.(jpg|jpeg|png|webp|avif)/i)?.[1] || 'jpg';
  const safeFilename = sp.name.replace(/[<>:"/\\|?*]/g, '').trim() + '.' + ext;
  const destPath = `next_data/images_folder/speaker_images/${safeFilename}`;

  try {
    await downloadImage(originalUrl, destPath);
    speakerData.push({
      name: sp.name,
      info: sp.info,
      image_url: `images_folder/speaker_images/${safeFilename}`,
    });
  } catch(e) {
    console.log(`  [FAIL] speaker ${sp.name}: ${e.message}`);
    speakerData.push({ name: sp.name, info: sp.info, image_url: '' });
  }
}

fs.writeFileSync('next_data/json_files/speakers.json', JSON.stringify(speakerData, null, 2));
```

---

### 🖼️ GALLERY PAGE
**URL:** `https://www.nextconferences.org/gallery`

```js
// Scroll more aggressively for gallery (all images need to load)
for (let i = 0; i < 30; i++) {
  await page.evaluate(() => window.scrollBy(0, 500));
  await new Promise(r => setTimeout(r, 600));
}
await new Promise(r => setTimeout(r, 4000));

const galleryUrls = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('img'))
    .map(img => img.src || img.dataset.src || '')
    .filter(src =>
      src.startsWith('http') &&
      !src.includes('data:') &&
      !src.includes('.svg') &&
      !src.includes('logo') &&
      !src.includes('icon')
    );
});

const uniqueUrls = [...new Set(galleryUrls)];
const galleryData = [];

for (let i = 0; i < uniqueUrls.length; i++) {
  const originalUrl = getOriginalWixUrl(uniqueUrls[i]);
  const ext = originalUrl.match(/\.(jpg|jpeg|png|webp|avif)/i)?.[1] || 'jpg';
  const filename = `gallery_${i + 1}.${ext}`;
  const destPath = `next_data/images_folder/gallery_images/${filename}`;

  try {
    await downloadImage(originalUrl, destPath);
    // Only keep if it's a real photo (> 50KB = real event photo, not icon)
    if (fs.statSync(destPath).size > 50000) {
      galleryData.push({
        id: `gallery_${i + 1}`,
        image_url: `images_folder/gallery_images/${filename}`,
      });
    } else {
      fs.unlinkSync(destPath); // delete tiny logos/icons
    }
  } catch(e) {
    console.log(`  [FAIL] gallery_${i+1}: ${e.message}`);
  }
}

fs.writeFileSync('next_data/json_files/gallery.json', JSON.stringify(galleryData, null, 2));
```

---

## 🛡️ Precautions — Data Safety Rules

### Before Starting:
- [ ] Verify `next_data/` folder does NOT already exist with important data
- [ ] Create all subdirectories first before writing any files
- [ ] Test with ONE image download before running full batch

### During Download:
- [ ] Always call `getOriginalWixUrl()` before downloading — never download the resized thumbnail
- [ ] Check file size after download — reject anything under 5KB (placeholder/broken)
- [ ] Use `[SKIP]` logic — if file already exists and is > 5KB, do not re-download
- [ ] Log every download attempt with result (OK / FAIL / SKIP)
- [ ] Add `await new Promise(r => setTimeout(r, 300))` between downloads to avoid rate-limiting

### After Download:
- [ ] Audit: count files in each folder vs entries in JSON — they must match
- [ ] Validate: every entry in JSON must have a corresponding file on disk
- [ ] Do NOT delete any downloaded file unless explicitly asked
- [ ] Write JSON only AFTER all images for that section are downloaded

### File Naming Rules:
- Conferences: `conf_0_NEXT_Premier_League_.jpg`, `conf_1_NEXT_Premier_League_.jpg`, ...
- Speakers: `Speaker Name.jpg` (exact name, spaces allowed, no special chars)
- Gallery: `gallery_1.jpg`, `gallery_2.jpg`, ...
- Committee: `member_name.avif` or `.jpg`

---

## 📦 JSON File Formats

### conferences.json
```json
[
  {
    "id": "next_01",
    "title": "Conference Full Title",
    "date": "March 08-10, 2027",
    "location": "Paris, France",
    "local_url": "images_folder/conference_images/conf_0_NEXT_Premier_League_.jpg",
    "about_conference": "",
    "theme": "",
    "insight_sessions": []
  }
]
```

### speakers.json
```json
[
  {
    "name": "Speaker Full Name",
    "info": "Their role and bio",
    "image_url": "images_folder/speaker_images/Speaker Full Name.jpg"
  }
]
```

### gallery.json
```json
[
  {
    "id": "gallery_1",
    "image_url": "images_folder/gallery_images/gallery_1.jpg"
  }
]
```

### packages.json
```json
[
  {
    "title": "Registration",
    "price": 899,
    "currency": "$",
    "features": ["Feature 1", "Feature 2"]
  }
]
```

---

## 🚀 Usage — How to Use This Document

1. Tell the AI: **"Download [section name] from [URL]"**
2. The AI will:
   - Launch Puppeteer headless browser
   - Navigate to the URL
   - Scroll to load all lazy images
   - Extract actual `img.src` URLs
   - Run `getOriginalWixUrl()` on each URL
   - Download each image to the correct subfolder
   - Build and write the JSON file
   - Print a summary of what was downloaded

3. Example commands:
   - `"Download speakers from https://www.nextconferences.org/speakers"`
   - `"Download conference images from https://www.nextconferences.org/conferences"`
   - `"Download gallery from https://www.nextconferences.org/gallery"`

---

## ⚠️ Known Wix Website Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Images are blurry/small | Downloaded resized Wix thumbnail | Use `getOriginalWixUrl()` to strip `/v1/fill/...` |
| Image is a screenshot | Used `page.screenshot()` | Never use screenshot — only use `img.src` → download |
| Image is blank/1KB | Wix lazy-load not triggered | Scroll more (30 iterations × 500ms) before extracting |
| "Contact Us" in speakers | DOM text matched nav links | Filter by name validation (must be 2-6 words, capital start) |
| Conference location = title | Text extraction hit wrong element | Walk up DOM more levels; look for city/country pattern |
| Rate limited | Too many fast requests | Add 300ms delay between each download |
