/**
 * CMS Service — Local & Supabase Synchronization
 * Supports dual-saving: writes to local files on localhost and updates Supabase database in real-time.
 */
import {
  fetchConferencesFromSupabase,
  fetchSpeakersFromSupabase,
  fetchMagazinesFromSupabase,
  clearSupabaseCache,
} from './supabase.js';

import localConferences from '../../conferences/conferences.json';
import localSpeakers from '../pages/speakers/speakers.json';
import { magazinesData as localMagazines } from '../pages/magazines/magazinesData.js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cegedkhhcczfjvrljcbi.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const SUPABASE_AUTH_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

// Detect if we're on localhost
export const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.startsWith('192.168.')
);

/**
 * Fetch all CMS entities with graceful fallback
 */
export async function loadCmsData() {
  let conferences = localConferences;
  let speakers = localSpeakers;
  let magazines = localMagazines;

  try {
    const [cData, sData, mData] = await Promise.allSettled([
      fetchConferencesFromSupabase(),
      fetchSpeakersFromSupabase(),
      fetchMagazinesFromSupabase(),
    ]);

    if (cData.status === 'fulfilled' && Array.isArray(cData.value) && cData.value.length > 0) {
      conferences = cData.value;
    }
    if (sData.status === 'fulfilled' && Array.isArray(sData.value) && sData.value.length > 0) {
      speakers = sData.value;
    }
    if (mData.status === 'fulfilled' && Array.isArray(mData.value) && mData.value.length > 0) {
      magazines = mData.value;
    }
  } catch (err) {
    console.warn('Supabase fetch failed during CMS load, falling back to local files:', err);
  }

  return { conferences, speakers, magazines };
}

/**
 * Save Conferences (updates local files on disk via Vite dev-server endpoint & Supabase)
 */
export async function saveConferences(conferencesList) {
  let localSaved = false;
  let supabaseSaved = false;
  let error = null;

  // 1. Try local dev-server endpoint
  try {
    const res = await fetch('/api/cms/save-conferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conferences: conferencesList }),
    });
    if (res.ok) {
      const result = await res.json();
      localSaved = result.localSaved !== false;
      supabaseSaved = Boolean(result.supabaseSaved);
    }
  } catch (err) {
    console.info('Local CMS dev server not responding, attempting direct Supabase save:', err);
  }

  // 2. Direct Supabase save if not already handled by local server
  if (!supabaseSaved && SUPABASE_URL) {
    try {
      const rows = conferencesList.map((c, idx) => ({
        display_order: typeof c.displayOrder === 'number' ? c.displayOrder : idx + 1,
        slug: c.slug,
        title: c.title,
        image: c.image || null,
        image_url: c.imageUrl || c.image_url || null,
        date: c.date,
        location: c.location,
        theme: c.theme || '',
        description: c.description || '',
        insight_sessions: c.insightSessions || c.insight_sessions || [],
        packages: c.packages || [],
      }));

      const res = await fetch(`${SUPABASE_URL}/rest/v1/conferences?on_conflict=slug`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_AUTH_KEY,
          Authorization: `Bearer ${SUPABASE_AUTH_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify(rows),
      });

      if (res.ok) {
        supabaseSaved = true;
      } else {
        error = await res.text();
      }
    } catch (e) {
      error = e.message;
    }
  }

  clearSupabaseCache();
  return { success: localSaved || supabaseSaved, localSaved, supabaseSaved, error };
}

/**
 * Save Speakers
 */
export async function saveSpeakers(speakersList) {
  let localSaved = false;
  let supabaseSaved = false;
  let error = null;

  try {
    const res = await fetch('/api/cms/save-speakers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speakers: speakersList }),
    });
    if (res.ok) {
      const result = await res.json();
      localSaved = result.localSaved !== false;
      supabaseSaved = Boolean(result.supabaseSaved);
    }
  } catch (err) {
    console.info('Local CMS dev server not responding:', err);
  }

  if (!supabaseSaved && SUPABASE_URL) {
    try {
      const rows = speakersList.map((s, idx) => ({
        id: s.id,
        display_order: typeof s.displayOrder === 'number' ? s.displayOrder : idx + 1,
        name: s.name,
        description: s.description || '',
        image: s.image || '',
        image_url: s.imageUrl || s.image_url || null,
      }));

      const res = await fetch(`${SUPABASE_URL}/rest/v1/speakers?on_conflict=id`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_AUTH_KEY,
          Authorization: `Bearer ${SUPABASE_AUTH_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify(rows),
      });

      if (res.ok) {
        supabaseSaved = true;
      } else {
        error = await res.text();
      }
    } catch (e) {
      error = e.message;
    }
  }

  clearSupabaseCache();
  return { success: localSaved || supabaseSaved, localSaved, supabaseSaved, error };
}

/**
 * Save Magazines
 */
export async function saveMagazines(magazinesList) {
  let localSaved = false;
  let supabaseSaved = false;
  let error = null;

  try {
    const res = await fetch('/api/cms/save-magazines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ magazines: magazinesList }),
    });
    if (res.ok) {
      const result = await res.json();
      localSaved = result.localSaved !== false;
      supabaseSaved = Boolean(result.supabaseSaved);
    }
  } catch (err) {
    console.info('Local CMS dev server not responding:', err);
  }

  if (!supabaseSaved && SUPABASE_URL) {
    try {
      const rows = magazinesList.map((m, idx) => ({
        id: m.id,
        display_order: typeof m.displayOrder === 'number' ? m.displayOrder : idx + 1,
        speaker_id: m.speakerId || m.speaker_id || null,
        name: m.name,
        title: m.title || '',
        tagline: m.tagline || '',
        bio: m.bio || '',
        quote: m.quote || '',
        cover_image: m.coverImage || m.cover_image || '',
        article_url: m.articleUrl || m.article_url || null,
        has_flipbook: Boolean(m.hasFlipbook ?? m.has_flipbook),
        flip_pages: m.flipPages || m.flip_pages || [],
        issue_number: m.issueNumber || m.issue_number || '',
        issue_date: m.issueDate || m.issue_date || '',
        total_pages: m.totalPages || m.total_pages || 1,
        highlights: m.highlights || [],
      }));

      const res = await fetch(`${SUPABASE_URL}/rest/v1/magazines?on_conflict=id`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_AUTH_KEY,
          Authorization: `Bearer ${SUPABASE_AUTH_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify(rows),
      });

      if (res.ok) {
        supabaseSaved = true;
      } else {
        error = await res.text();
      }
    } catch (e) {
      error = e.message;
    }
  }

  clearSupabaseCache();
  return { success: localSaved || supabaseSaved, localSaved, supabaseSaved, error };
}

/**
 * Upload Image (Supports base64 or file upload)
 */
export async function uploadImageFile(file, category = 'conferences') {
  // Convert file to base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      try {
        const res = await fetch('/api/cms/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            base64Data: base64,
            category,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          resolve(data.url || data.publicUrl || base64);
        } else {
          // Fallback to data URL
          resolve(base64);
        }
      } catch {
        resolve(base64);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 1-Click Download of JSON Files for Git Commit
 */
export function downloadJsonFile(filename, data) {
  const jsonStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 1-Click Download of magazinesData.js
 */
export function downloadMagazinesJs(magazinesList) {
  const content = `export const magazinesData = ${JSON.stringify(magazinesList, null, 2)};\n`;
  const blob = new Blob([content], { type: 'application/javascript;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'magazinesData.js';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
