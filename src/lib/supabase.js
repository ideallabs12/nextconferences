const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cegedkhhcczfjvrljcbi.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const CONFERENCES_BUCKET = 'conferences_imgs';
export const SPEAKERS_BUCKET = 'speakers_imgs';
export const GALLERY_BUCKET = 'gallery_imgs';
export const MAGAZINES_BUCKET = 'magazines';
export const COMMITTEE_BUCKET = 'committee_imgs';

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
  if (member.image_url) return member.image_url;
  if (member.imageUrl) return member.imageUrl;
  if (member.image) {
    if (member.image.startsWith('http://') || member.image.startsWith('https://')) {
      return member.image;
    }
    const filename = member.image.split('/').pop();
    return `${SUPABASE_URL}/storage/v1/object/public/${COMMITTEE_BUCKET}/${filename}`;
  }
  return '';
}

export async function fetchCommitteeFromSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
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
    imageUrl: row.image_url || row.imageUrl || getCommitteeImageUrl(row),
  }));
}

export async function fetchFaqsFromSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
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
    issueDate: row.issue_date || row.issueDate || '',
    totalPages: row.total_pages || row.totalPages || 1,
    highlights: Array.isArray(row.highlights) ? row.highlights : [],
  };
}

export async function fetchMagazinesFromSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
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
}

export function getGalleryImageUrl(itemOrPath) {
  if (!itemOrPath) return '';
  if (typeof itemOrPath === 'string') {
    if (itemOrPath.startsWith('http://') || itemOrPath.startsWith('https://')) {
      return itemOrPath;
    }
    const filename = itemOrPath.split('/').pop();
    return `${SUPABASE_URL}/storage/v1/object/public/${GALLERY_BUCKET}/${filename}`;
  }
  if (itemOrPath.image_url) return itemOrPath.image_url;
  if (itemOrPath.imageUrl) return itemOrPath.imageUrl;
  if (itemOrPath.image) {
    const filename = itemOrPath.image.split('/').pop();
    return `${SUPABASE_URL}/storage/v1/object/public/${GALLERY_BUCKET}/${filename}`;
  }
  return '';
}

export async function fetchGalleryFromSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
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
    imageUrl: row.image_url || row.imageUrl || getGalleryImageUrl(row),
  }));
}

export function getSpeakerImageUrl(speaker) {
  if (!speaker) return '';
  if (speaker.image_url) return speaker.image_url;
  if (speaker.imageUrl) return speaker.imageUrl;
  if (speaker.image) {
    if (speaker.image.startsWith('http://') || speaker.image.startsWith('https://')) {
      return speaker.image;
    }
    const filename = speaker.image.split('/').pop();
    return `${SUPABASE_URL}/storage/v1/object/public/${SPEAKERS_BUCKET}/${filename}`;
  }
  return '';
}

export async function fetchSpeakersFromSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
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
    imageUrl: row.image_url || row.imageUrl || getSpeakerImageUrl(row),
  }));
}

export function getConferenceImageUrl(conf) {
  if (!conf) return '';
  if (conf.image_url) return conf.image_url;
  if (conf.imageUrl) return conf.imageUrl;
  if (conf.image) {
    if (conf.image.startsWith('http://') || conf.image.startsWith('https://')) {
      return conf.image;
    }
    return `${SUPABASE_URL}/storage/v1/object/public/${CONFERENCES_BUCKET}/${conf.image}`;
  }
  return '';
}

export function normalizeConference(row) {
  return {
    ...row,
    displayOrder: typeof row.display_order === 'number' ? row.display_order : row.displayOrder,
    imageUrl: row.image_url || row.imageUrl || getConferenceImageUrl(row),
    insightSessions: row.insight_sessions || row.insightSessions || [],
    packages: row.packages || [],
  };
}

export async function fetchConferencesFromSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
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
}

