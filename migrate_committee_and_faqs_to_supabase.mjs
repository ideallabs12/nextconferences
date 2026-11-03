import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
const COMMITTEE_BUCKET = 'committee_imgs';

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

async function ensureBucket() {
  console.log(`Checking/creating storage bucket "${COMMITTEE_BUCKET}"...`);
  const checkRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${COMMITTEE_BUCKET}`, {
    method: 'GET',
    headers,
  });

  if (checkRes.ok) {
    console.log(`Bucket "${COMMITTEE_BUCKET}" already exists.`);
    await fetch(`${SUPABASE_URL}/storage/v1/bucket/${COMMITTEE_BUCKET}`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: COMMITTEE_BUCKET, name: COMMITTEE_BUCKET, public: true }),
    });
    return;
  }

  const createRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: COMMITTEE_BUCKET,
      name: COMMITTEE_BUCKET,
      public: true,
    }),
  });

  const createData = await createRes.json();
  if (!createRes.ok) {
    throw new Error(`Failed to create bucket: ${JSON.stringify(createData)}`);
  }
  console.log(`Created public bucket "${COMMITTEE_BUCKET}".`);
}

async function uploadCommitteeImages() {
  const imgDir = path.join(__dirname, 'public', 'commitee_members');
  const files = fs.readdirSync(imgDir);

  const listRes = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${COMMITTEE_BUCKET}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix: '', limit: 100 }),
  });
  const existingSet = new Set();
  if (listRes.ok) {
    const existing = await listRes.json();
    for (const obj of existing) {
      if (obj.name) existingSet.add(obj.name);
    }
  }

  console.log(`Found ${files.length} local committee images (${existingSet.size} already in bucket). Uploading missing images...`);

  for (const file of files) {
    if (existingSet.has(file)) continue;
    const filePath = path.join(imgDir, file);
    if (!fs.statSync(filePath).isFile()) continue;

    const buffer = fs.readFileSync(filePath);
    const contentType = getMimeType(file);

    for (let attempt = 1; attempt <= 3; attempt++) {
      const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/${COMMITTEE_BUCKET}/${file}`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': contentType,
          'x-upsert': 'true',
        },
        body: buffer,
      });

      if (uploadRes.ok) {
        console.log(`  Uploaded: ${file}`);
        break;
      } else {
        const errText = await uploadRes.text();
        console.warn(`  Attempt ${attempt} failed for ${file} (${uploadRes.status})`);
        if (attempt === 3) {
          console.error(`Failed to upload ${file}: ${errText}`);
        }
      }
    }
  }
}

async function migrateCommitteeData() {
  const jsonPath = path.join(__dirname, 'src', 'pages', 'committee', 'committee.json');
  const committee = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const rows = committee.map((member, idx) => {
    const filename = member.image ? path.basename(member.image) : '';
    const publicImgUrl = filename
      ? `${SUPABASE_URL}/storage/v1/object/public/${COMMITTEE_BUCKET}/${filename}`
      : null;
    return {
      id: member.id,
      display_order: typeof member.displayOrder === 'number' ? member.displayOrder : idx + 1,
      name: member.name,
      details: member.details || '',
      image: filename,
      image_url: publicImgUrl,
    };
  });

  console.log(`Attempting to upsert ${rows.length} committee members into public.committee...`);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/committee?on_conflict=id`, {
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
    console.error(`Committee table upsert response (${res.status}): ${errText}`);
    return false;
  }

  const inserted = await res.json();
  console.log(`Successfully upserted ${inserted.length} committee members into Supabase!`);
  return true;
}

async function migrateFaqsData() {
  const jsonPath = path.join(__dirname, 'src', 'pages', 'faqs', 'faqs.json');
  const faqsJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const faqs = faqsJson.faqs || [];

  const rows = faqs.map((faq, idx) => ({
    id: idx + 1,
    display_order: idx + 1,
    question: faq.question,
    answer: faq.answer,
  }));

  console.log(`Attempting to upsert ${rows.length} FAQs into public.faqs...`);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/faqs?on_conflict=id`, {
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
    console.error(`FAQs table upsert response (${res.status}): ${errText}`);
    return false;
  }

  const inserted = await res.json();
  console.log(`Successfully upserted ${inserted.length} FAQs into Supabase!`);
  return true;
}

(async () => {
  try {
    await ensureBucket();
    await uploadCommitteeImages();
    await migrateCommitteeData();
    await migrateFaqsData();
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
})();

