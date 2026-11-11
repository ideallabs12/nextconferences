import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import fs from 'fs';
import path from 'path';

function cmsServerPlugin() {
  return {
    name: 'cms-local-sync-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/cms/')) {
          return next();
        }

        const env = loadEnv('development', process.cwd(), '');
        const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://cegedkhhcczfjvrljcbi.supabase.co';
        const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

        const supabaseHeaders = SERVICE_KEY ? {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=representation',
        } : null;

        // Parse JSON body helper
        const readJsonBody = () => new Promise((resolve, reject) => {
          const chunks = [];
          req.on('data', c => chunks.push(c));
          req.on('end', () => {
            try {
              const str = Buffer.concat(chunks).toString('utf8');
              resolve(str ? JSON.parse(str) : {});
            } catch (e) {
              reject(e);
            }
          });
          req.on('error', reject);
        });

        const sendJson = (status, obj) => {
          res.writeHead(status, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(obj));
        };

        try {
          // ─── 1. Save Conferences ───
          if (req.url === '/api/cms/save-conferences' && req.method === 'POST') {
            const body = await readJsonBody();
            const conferences = body.conferences;
            if (!Array.isArray(conferences)) {
              return sendJson(400, { error: 'Invalid conferences data' });
            }

            // Write to both local JSON files
            const path1 = path.join(process.cwd(), 'conferences', 'conferences.json');
            const path2 = path.join(process.cwd(), 'src', 'pages', 'conferences', 'conferences.json');
            const jsonStr = JSON.stringify(conferences, null, 2);

            fs.writeFileSync(path1, jsonStr, 'utf8');
            if (fs.existsSync(path.dirname(path2))) {
              fs.writeFileSync(path2, jsonStr, 'utf8');
            }

            // Upsert to Supabase with Service Role Key
            let supabaseSaved = false;
            if (supabaseHeaders) {
              try {
                const rows = conferences.map((c, idx) => ({
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

                const sRes = await fetch(`${SUPABASE_URL}/rest/v1/conferences?on_conflict=slug`, {
                  method: 'POST',
                  headers: supabaseHeaders,
                  body: JSON.stringify(rows),
                });
                supabaseSaved = sRes.ok;
              } catch (se) {
                console.warn('[CMS Plugin] Supabase conference sync warning:', se.message);
              }
            }

            return sendJson(200, { ok: true, localSaved: true, supabaseSaved });
          }

          // ─── 2. Save Speakers ───
          if (req.url === '/api/cms/save-speakers' && req.method === 'POST') {
            const body = await readJsonBody();
            const speakers = body.speakers;
            if (!Array.isArray(speakers)) {
              return sendJson(400, { error: 'Invalid speakers data' });
            }

            const spPath = path.join(process.cwd(), 'src', 'pages', 'speakers', 'speakers.json');
            fs.writeFileSync(spPath, JSON.stringify(speakers, null, 2), 'utf8');

            let supabaseSaved = false;
            if (supabaseHeaders) {
              try {
                const rows = speakers.map((s, idx) => ({
                  id: s.id,
                  display_order: typeof s.displayOrder === 'number' ? s.displayOrder : idx + 1,
                  name: s.name,
                  description: s.description || '',
                  image: s.image || '',
                  image_url: s.imageUrl || s.image_url || null,
                }));

                const sRes = await fetch(`${SUPABASE_URL}/rest/v1/speakers?on_conflict=id`, {
                  method: 'POST',
                  headers: supabaseHeaders,
                  body: JSON.stringify(rows),
                });
                supabaseSaved = sRes.ok;
              } catch (se) {
                console.warn('[CMS Plugin] Supabase speaker sync warning:', se.message);
              }
            }

            return sendJson(200, { ok: true, localSaved: true, supabaseSaved });
          }

          // ─── 3. Save Magazines ───
          if (req.url === '/api/cms/save-magazines' && req.method === 'POST') {
            const body = await readJsonBody();
            const magazines = body.magazines;
            if (!Array.isArray(magazines)) {
              return sendJson(400, { error: 'Invalid magazines data' });
            }

            const magPath = path.join(process.cwd(), 'src', 'pages', 'magazines', 'magazinesData.js');
            const jsContent = `export const magazinesData = ${JSON.stringify(magazines, null, 2)};\n`;
            fs.writeFileSync(magPath, jsContent, 'utf8');

            let supabaseSaved = false;
            if (supabaseHeaders) {
              try {
                const rows = magazines.map((m, idx) => ({
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

                const sRes = await fetch(`${SUPABASE_URL}/rest/v1/magazines?on_conflict=id`, {
                  method: 'POST',
                  headers: supabaseHeaders,
                  body: JSON.stringify(rows),
                });
                supabaseSaved = sRes.ok;
              } catch (se) {
                console.warn('[CMS Plugin] Supabase magazine sync warning:', se.message);
              }
            }

            return sendJson(200, { ok: true, localSaved: true, supabaseSaved });
          }

          // ─── 4. Image Upload ───
          if (req.url === '/api/cms/upload-image' && req.method === 'POST') {
            const body = await readJsonBody();
            const { filename, base64Data, category = 'conferences' } = body;
            if (!filename || !base64Data) {
              return sendJson(400, { error: 'Missing filename or base64Data' });
            }

            // Extract pure base64
            const base64Clean = base64Data.replace(/^data:[^;]+;base64,/, '');
            const buffer = Buffer.from(base64Clean, 'base64');

            // Determine folder and bucket
            let subFolder = 'conferences_imgs';
            let bucket = 'conferences_imgs';
            if (category === 'speakers') {
              subFolder = 'speakers_imgs';
              bucket = 'speakers_imgs';
            } else if (category === 'magazines') {
              subFolder = 'magazines';
              bucket = 'magazines';
            }

            // Clean sanitized safe filename
            const cleanName = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
            const targetDir = path.join(process.cwd(), 'public', subFolder);
            if (!fs.existsSync(targetDir)) {
              fs.mkdirSync(targetDir, { recursive: true });
            }
            const targetFilePath = path.join(targetDir, cleanName);
            fs.writeFileSync(targetFilePath, buffer);

            const localUrl = `/${subFolder}/${cleanName}`;
            let publicUrl = localUrl;

            // Upload to Supabase Storage if Service Key is present
            if (SERVICE_KEY) {
              try {
                const mime = filename.endsWith('.png') ? 'image/png'
                  : filename.endsWith('.webp') ? 'image/webp'
                  : filename.endsWith('.avif') ? 'image/avif'
                  : 'image/jpeg';

                const upRes = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${cleanName}`, {
                  method: 'POST',
                  headers: {
                    apikey: SERVICE_KEY,
                    Authorization: `Bearer ${SERVICE_KEY}`,
                    'Content-Type': mime,
                    'x-upsert': 'true',
                  },
                  body: buffer,
                });

                if (upRes.ok) {
                  publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${cleanName}`;
                }
              } catch (ue) {
                console.warn('[CMS Plugin] Supabase storage upload warning:', ue.message);
              }
            }

            return sendJson(200, { ok: true, url: publicUrl, localUrl });
          }

          // Unhandled CMS endpoint
          return sendJson(404, { error: 'CMS endpoint not found' });
        } catch (err) {
          console.error('[CMS Plugin Error]', err);
          return sendJson(500, { error: err.message });
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cmsServerPlugin()],
});
