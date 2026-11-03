import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { magazinesData } from './src/pages/magazines/magazinesData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const env = {};
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx !== -1) {
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
}

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'magazines';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
};

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.avif') return 'image/avif';
  return 'application/octet-stream';
}

function toSafeSlug(str) {
  return str.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '').toLowerCase();
}

// Convert a local public path like '/magazines/Laura Denktash.avif' or '/magazines/krista_fee/krista_fee_1.avif'
// into a clean per-speaker folder path inside the `magazines` bucket
function getStorageObjectPath(magazineId, localWebPath) {
  const folder = toSafeSlug(magazineId);
  const ext = path.extname(localWebPath).toLowerCase() || '.avif';
  const base = toSafeSlug(path.basename(localWebPath, path.extname(localWebPath)));
  return `${folder}/${base}${ext}`;
}

async function ensureBucket() {
  console.log(`Checking/creating storage bucket "${BUCKET_NAME}"...`);
  const checkRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${BUCKET_NAME}`, {
    method: 'GET',
    headers,
  });

  if (checkRes.ok) {
    console.log(`Bucket "${BUCKET_NAME}" already exists.`);
    await fetch(`${SUPABASE_URL}/storage/v1/bucket/${BUCKET_NAME}`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: BUCKET_NAME, name: BUCKET_NAME, public: true }),
    });
    return;
  }

  const createRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: BUCKET_NAME,
      name: BUCKET_NAME,
      public: true,
    }),
  });

  const createData = await createRes.json();
  if (!createRes.ok) {
    throw new Error(`Failed to create bucket: ${JSON.stringify(createData)}`);
  }
  console.log(`Created public bucket "${BUCKET_NAME}".`);
}

async function uploadFileToStorage(localWebPath, objectPath) {
  const relativeLocalPath = localWebPath.replace(/^\//, '');
  const fullLocalPath = path.join(__dirname, 'public', relativeLocalPath);

  if (!fs.existsSync(fullLocalPath)) {
    throw new Error(`Local file not found: ${fullLocalPath}`);
  }

  const buffer = fs.readFileSync(fullLocalPath);
  const contentType = getMimeType(fullLocalPath);

  for (let attempt = 1; attempt <= 3; attempt++) {
    const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${objectPath}`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': contentType,
        'x-upsert': 'true',
      },
      body: buffer,
    });

    if (uploadRes.ok) {
      console.log(`  Uploaded: ${objectPath}`);
      return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${objectPath}`;
    } else {
      const errText = await uploadRes.text();
      console.warn(`  Attempt ${attempt} failed for ${objectPath} (${uploadRes.status})`);
      if (attempt === 3) {
        throw new Error(`Failed to upload ${objectPath}: ${errText}`);
      }
    }
  }
}

async function migrateMagazines() {
  const rows = [];

  for (let idx = 0; idx < magazinesData.length; idx++) {
    const mag = magazinesData[idx];
    console.log(`Processing magazine [${idx + 1}/${magazinesData.length}]: ${mag.name}`);

    // Upload cover image into speaker's folder
    const coverObjPath = getStorageObjectPath(mag.id, mag.coverImage);
    const coverPublicUrl = await uploadFileToStorage(mag.coverImage, coverObjPath);

    // Upload flipbook pages (if any) into speaker's folder
    const flipPageUrls = [];
    if (Array.isArray(mag.flipPages) && mag.flipPages.length > 0) {
      for (const pageWebPath of mag.flipPages) {
        const pageObjPath = getStorageObjectPath(mag.id, pageWebPath);
        const pagePublicUrl = await uploadFileToStorage(pageWebPath, pageObjPath);
        flipPageUrls.push(pagePublicUrl);
      }
    }

    rows.push({
      id: mag.id,
      display_order: idx + 1,
      speaker_id: mag.speakerId || null,
      name: mag.name,
      title: mag.title || '',
      tagline: mag.tagline || '',
      bio: mag.bio || '',
      quote: mag.quote || '',
      cover_image: coverPublicUrl,
      article_url: mag.articleUrl || null,
      has_flipbook: Boolean(mag.hasFlipbook),
      flip_pages: flipPageUrls,
      issue_number: mag.issueNumber || '',
      issue_date: mag.issueDate || '',
      category: mag.category || '',
      badge: mag.badge || '',
      total_pages: mag.totalPages || 1,
      featured: Boolean(mag.featured),
      highlights: mag.highlights || [],
    });
  }

  console.log(`Upserting ${rows.length} magazines into public.magazines...`);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/magazines?on_conflict=id`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Table upsert failed (${res.status}): ${errText}`);
  }

  const inserted = await res.json();
  console.log(`Successfully upserted ${inserted.length} magazines into Supabase!`);
}

(async () => {
  try {
    await ensureBucket();
    await migrateMagazines();
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
})();

