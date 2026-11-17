const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cegedkhhcczfjvrljcbi.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const CONFERENCES_BUCKET = 'conferences_imgs';
export const SPEAKERS_BUCKET = 'speakers_imgs';
export const GALLERY_BUCKET = 'gallery_imgs';
export const MAGAZINES_BUCKET = 'magazines';
export const COMMITTEE_BUCKET = 'committee_imgs';

// Built-in static assets deployed directly on the Vercel Edge CDN (/public)
const LOCAL_CONFERENCE_IMAGES = new Set([
  'mppw_italy.jpg', 'mppw_japan.jpg', 'mppw_paris.jpg', 'mppw_uae.jpg', 'mppw_usa.jpg',
  'nplc_mhp.avif', 'nplc_sphw.jpg', 'nplc_sphwc.avif', 'nplc_wplc.avif',
  'qwle_italy.jpg', 'qwle_japan.jpg', 'qwle_paris.jpg', 'qwle_uae.jpg', 'qwle_usa.jpg',
  'sph-2026.jpg',
  'sphw_italy.jpg', 'sphw_japan.jpg', 'sphw_paris.jpg', 'sphw_uae.jpg', 'sphw_usa.jpg',
  'wplc_italy.jpg', 'wplc_japan.jpg', 'wplc_paris.jpg', 'wplc_uae.jpg', 'wplc_usa.jpg',
]);

const LOCAL_SPEAKER_IMAGES = new Set([
  'speaker_alexandra__sorensen__macare_16.jpeg', 'speaker_anael_milena_oda_9.jpeg',
  'speaker_claudette_milner_12.jpeg', 'speaker_cynthia_concordia_18.jpg',
  'speaker_dr_ruchi_mishra_sharma_5.jpeg', 'speaker_dr__gina_piombino_11.jpeg',
  'speaker_dr__rasimah_jar_7.jpeg', 'speaker_ellen_mannaert_21.jpg',
  'speaker_erika_hacker_19.jpg', 'speaker_ewa_j__kleczyk__phd_20.jpg',
  'speaker_felicia_a__gokool__edd__ms__ma_8.jpeg', 'speaker_jamaal__cottrell_4.jpeg',
  'speaker_jonas_adoro_6.jpg', 'speaker_kate_castro_17.jpeg',
  'speaker_kimly_hoang_nakata_10.jpg', 'speaker_krista_fee_13.jpeg',
  'speaker_laura_denktash_15.png', 'speaker_michelle_burkhard_14.jpeg',
  'speaker_mr__dwayne_meeks_3.jpeg', 'speaker_safyra_bakshani_1.jpeg',
  'speaker_shannon_wallis_22.jpg', 'speaker_venessa_hariparsad_2.jpeg',
]);

const LOCAL_GALLERY_IMAGES = new Set([
  'next_gallery_10.jpg', 'next_gallery_11.jpg', 'next_gallery_12.jpg', 'next_gallery_13.jpg',
  'next_gallery_2.jpg', 'next_gallery_3.jpg', 'next_gallery_4.jpg', 'next_gallery_5.jpg',
  'next_gallery_6.jpg', 'next_gallery_7.jpg', 'next_gallery_8.jpg', 'next_gallery_9.jpg',
]);

const LOCAL_COMMITTEE_IMAGES = new Set([
  'sailaja_manacha_1.avif', 'sean_douglas_1.avif',
]);

// In-memory cache & in-flight request deduplication so navigating or mounting multiple sections never re-fetches
const _cache = new Map();
const _inflight = new Map();

export function clearSupabaseCache() {
  _cache.clear();
  _inflight.clear();
}

function cachedFetch(key, fetcher) {
  if (_cache.has(key)) {
    return Promise.resolve(_cache.get(key));
  }
  if (_inflight.has(key)) {
    return _inflight.get(key);
  }
  const p = fetcher()
    .then((res) => {
      _inflight.delete(key);
      if (res) _cache.set(key, res);
      return res;
    })
    .catch((err) => {
      _inflight.delete(key);
      throw err;
    });
  _inflight.set(key, p);
  return p;
}

function extractFilename(str) {
  if (!str || typeof str !== 'string') return '';
  if (str.startsWith('data:')) return '';
  return str.split('?')[0].split('/').pop() || '';
}

export function getSpeakerSlug(speakerOrName) {
  if (!speakerOrName) return '';
  const raw = typeof speakerOrName === 'string'
    ? speakerOrName
    : (speakerOrName.slug || speakerOrName.name || '');
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getCommitteeImageUrl(member) {
  if (!member) return '';
  const fname = extractFilename(member.image || member.image_url || member.imageUrl);
  if (fname && LOCAL_COMMITTEE_IMAGES.has(fname)) {
    return `/commitee_members/${fname}`;
  }
  if (member.image_url) return member.image_url;
  if (member.imageUrl) return member.imageUrl;
  if (member.image) {
    if (member.image.startsWith('http://') || member.image.startsWith('https://') || member.image.startsWith('data:')) {
      return member.image;
    }
    return `${SUPABASE_URL}/storage/v1/object/public/${COMMITTEE_BUCKET}/${fname}`;
  }
  return '';
}

export async function fetchCommitteeFromSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return cachedFetch('committee', async () => {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/committee?select=*&order=display_order.asc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!res.ok) {
      throw new Error(`Supabase committee fetch failed: ${res.status}`);
    }
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows.map((row) => ({
      ...row,
      displayOrder: typeof row.display_order === 'number' ? row.display_order : row.displayOrder,
      imageUrl: getCommitteeImageUrl(row),
    }));
  });
}

export async function fetchFaqsFromSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return cachedFetch('faqs', async () => {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/faqs?select=*&order=display_order.asc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!res.ok) {
      throw new Error(`Supabase faqs fetch failed: ${res.status}`);
    }
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows.map((row) => ({
      ...row,
      displayOrder: typeof row.display_order === 'number' ? row.display_order : row.displayOrder,
    }));
  });
}

export async function submitContactMessage({ fullName, company, email, message }) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase is not configured');
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/contact_messages`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      full_name: fullName,
      company: company || '',
      email,
      message,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to submit contact message: ${errText}`);
  }
  return true;
}

export async function submitRegistration({
  registrationId,
  conferenceSlug,
  conferenceTitle,
  packageName,
  packagePrice,
  fullName,
  email,
  phone,
  country,
}) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase is not configured');
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/registrations`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      registration_id: registrationId,
      conference_slug: conferenceSlug || '',
      conference_title: conferenceTitle || '',
      package_name: packageName || '',
      package_price: typeof packagePrice === 'number' ? packagePrice : null,
      full_name: fullName,
      email,
      phone,
      country,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to submit registration: ${errText}`);
  }
  return true;
}

export function normalizeMagazine(row) {
  return {
    ...row,
    displayOrder: typeof row.display_order === 'number' ? row.display_order : row.displayOrder,
    speakerId: row.speaker_id !== undefined ? row.speaker_id : row.speakerId,
    coverImage: row.cover_image || row.coverImage || '',
    articleUrl: row.article_url !== undefined ? row.article_url : row.articleUrl,
    hasFlipbook: row.has_flipbook !== undefined ? Boolean(row.has_flipbook) : Boolean(row.hasFlipbook),
    flipPages: Array.isArray(row.flip_pages) ? row.flip_pages : (row.flipPages || []),
    issueNumber: row.issue_number || row.issueNumber || '',
    issueDate: row.issue_date || row.issue_date || '',
    totalPages: row.total_pages || row.totalPages || 1,
    highlights: Array.isArray(row.highlights) ? row.highlights : [],
  };
}

export async function fetchMagazinesFromSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return cachedFetch('magazines', async () => {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/magazines?select=*&order=display_order.asc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!res.ok) {
      throw new Error(`Supabase magazines fetch failed: ${res.status}`);
    }
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows.map(normalizeMagazine);
  });
}

export function getGalleryImageUrl(itemOrPath) {
  if (!itemOrPath) return '';
  if (typeof itemOrPath === 'string') {
    const fname = extractFilename(itemOrPath);
    if (fname && LOCAL_GALLERY_IMAGES.has(fname)) {
      return `/gallery_imgs/${fname}`;
    }
    if (itemOrPath.startsWith('http://') || itemOrPath.startsWith('https://') || itemOrPath.startsWith('data:')) {
      return itemOrPath;
    }
    return `${SUPABASE_URL}/storage/v1/object/public/${GALLERY_BUCKET}/${fname}`;
  }
  const fname = extractFilename(itemOrPath.image || itemOrPath.image_url || itemOrPath.imageUrl);
  if (fname && LOCAL_GALLERY_IMAGES.has(fname)) {
    return `/gallery_imgs/${fname}`;
  }
  if (itemOrPath.image_url) return itemOrPath.image_url;
  if (itemOrPath.imageUrl) return itemOrPath.imageUrl;
  if (itemOrPath.image) {
    return `${SUPABASE_URL}/storage/v1/object/public/${GALLERY_BUCKET}/${fname}`;
  }
  return '';
}

export async function fetchGalleryFromSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return cachedFetch('gallery', async () => {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/gallery?select=*&order=display_order.asc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!res.ok) {
      throw new Error(`Supabase gallery fetch failed: ${res.status}`);
    }
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows.map((row) => ({
      ...row,
      displayOrder: typeof row.display_order === 'number' ? row.display_order : row.displayOrder,
      imageUrl: getGalleryImageUrl(row),
    }));
  });
}

export function getSpeakerImageUrl(speaker) {
  if (!speaker) return '';
  const fname = extractFilename(speaker.image || speaker.image_url || speaker.imageUrl);
  if (fname && LOCAL_SPEAKER_IMAGES.has(fname)) {
    return `/speakers_imgs/${fname}`;
  }
  if (speaker.image_url) return speaker.image_url;
  if (speaker.imageUrl) return speaker.imageUrl;
  if (speaker.image) {
    if (speaker.image.startsWith('http://') || speaker.image.startsWith('https://') || speaker.image.startsWith('data:')) {
      return speaker.image;
    }
    return `${SUPABASE_URL}/storage/v1/object/public/${SPEAKERS_BUCKET}/${fname}`;
  }
  return '';
}

export async function fetchSpeakersFromSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return cachedFetch('speakers', async () => {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/speakers?select=*&order=display_order.asc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!res.ok) {
      throw new Error(`Supabase speakers fetch failed: ${res.status}`);
    }
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows.map((row) => ({
      ...row,
      displayOrder: typeof row.display_order === 'number' ? row.display_order : row.displayOrder,
      imageUrl: getSpeakerImageUrl(row),
    }));
  });
}

export function getConferenceImageUrl(conf) {
  if (!conf) return '';
  const fname = extractFilename(conf.image || conf.image_url || conf.imageUrl);
  if (fname && LOCAL_CONFERENCE_IMAGES.has(fname)) {
    return `/conferences_imgs/${fname}`;
  }
  if (conf.image_url) return conf.image_url;
  if (conf.imageUrl) return conf.imageUrl;
  if (conf.image) {
    if (conf.image.startsWith('http://') || conf.image.startsWith('https://') || conf.image.startsWith('data:')) {
      return conf.image;
    }
    return `${SUPABASE_URL}/storage/v1/object/public/${CONFERENCES_BUCKET}/${fname}`;
  }
  return '';
}

export function normalizeConference(row) {
  return {
    ...row,
    displayOrder: typeof row.display_order === 'number' ? row.display_order : row.displayOrder,
    imageUrl: getConferenceImageUrl(row),
    insightSessions: row.insight_sessions || row.insightSessions || [],
    packages: row.packages || [],
  };
}

export async function fetchConferencesFromSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return cachedFetch('conferences', async () => {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/conferences?select=*&order=display_order.asc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!res.ok) {
      throw new Error(`Supabase fetch failed: ${res.status}`);
    }
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows.map(normalizeConference);
  });
}
