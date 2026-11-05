const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 8787;
const MAX_BYTES = 5 * 1024 * 1024;
const MIN_PHOTOS = 1;
const MAX_PHOTOS = 5;
const SLOW_MS = 8000;

const FAIL_MODES = new Set(['off', 'slow', 'drop', 'refuse', 'hang']);

let failMode = FAIL_MODES.has(process.env.FAIL_MODE)
  ? process.env.FAIL_MODE
  : 'off';

const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const reportsByClientId = new Map();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safe = String(file.originalname || 'photo')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .slice(0, 80);
    cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_BYTES,
    files: MAX_PHOTOS,
  },
});

const app = express();
app.use(express.json());

function publicBase(req) {
  return `${req.protocol}://${req.get('host')}`;
}

function toPublicReport(req, report) {
  const base = publicBase(req);
  return {
    clientId: report.clientId,
    description: report.description,
    receivedAt: report.receivedAt,
    photoCount: report.photos.length,
    photos: report.photos.map(photo => ({
      filename: photo.filename,
      url: `${base}/uploads/${encodeURIComponent(photo.filename)}`,
    })),
  };
}

function removeFiles(filenames) {
  for (const filename of filenames) {
    const fullPath = path.join(uploadsDir, filename);
    fs.unlink(fullPath, () => {});
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function applyFailMode(req, res, files) {
  const mode = failMode;

  if (mode === 'off') {
    return 'continue';
  }

  console.log(`[fail-mode] ${mode} on POST /reports`);

  if (mode === 'slow') {
    await delay(SLOW_MS);
    return 'continue';
  }

  if (mode === 'refuse') {
    removeFiles(files.map(file => file.filename));
    res.status(403).json({ error: 'Upload refused by fail mode.' });
    return 'stop';
  }

  if (mode === 'drop') {
    removeFiles(files.map(file => file.filename));
    req.socket.destroy();
    return 'stop';
  }

  if (mode === 'hang') {
    removeFiles(files.map(file => file.filename));
    return 'stop';
  }

  return 'continue';
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, failMode });
});

app.get('/fail-mode', (_req, res) => {
  res.json({
    failMode,
    modes: [...FAIL_MODES],
    slowMs: SLOW_MS,
  });
});

app.post('/fail-mode', (req, res) => {
  const next = String(req.body.mode || '')
    .trim()
    .toLowerCase();
  if (!FAIL_MODES.has(next)) {
    res.status(400).json({
      error: `mode must be one of: ${[...FAIL_MODES].join(', ')}`,
    });
    return;
  }
  failMode = next;
  console.log(`[fail-mode] set to ${failMode}`);
  res.json({ failMode });
});

app.get('/reports', (req, res) => {
  const reports = Array.from(reportsByClientId.values())
    .sort((a, b) => (a.receivedAt < b.receivedAt ? 1 : -1))
    .map(report => toPublicReport(req, report));
  res.json({ reports });
});

app.get('/reports/:clientId', (req, res) => {
  const report = reportsByClientId.get(req.params.clientId);
  if (!report) {
    res.status(404).json({ error: 'Report not found.' });
    return;
  }
  res.json(toPublicReport(req, report));
});

app.post('/reports', (req, res) => {
  upload.array('photos', MAX_PHOTOS)(req, res, async err => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
          error: `Each photo must be under ${MAX_BYTES} bytes at the server.`,
        });
        return;
      }
      if (
        err.code === 'LIMIT_FILE_COUNT' ||
        err.code === 'LIMIT_UNEXPECTED_FILE'
      ) {
        res.status(400).json({
          error: `Send between ${MIN_PHOTOS} and ${MAX_PHOTOS} photos.`,
        });
        return;
      }
      res.status(400).json({ error: err.message });
      return;
    }
    if (err) {
      res.status(400).json({ error: err.message || 'Upload failed.' });
      return;
    }

    const files = Array.isArray(req.files) ? req.files : [];

    try {
      const outcome = await applyFailMode(req, res, files);
      if (outcome === 'stop') {
        return;
      }
    } catch (failError) {
      removeFiles(files.map(file => file.filename));
      res.status(500).json({
        error:
          failError instanceof Error ? failError.message : 'Fail mode error.',
      });
      return;
    }

    const clientId = String(req.body.clientId || '').trim();
    const description = String(req.body.description || '').trim();

    if (!clientId) {
      removeFiles(files.map(file => file.filename));
      res.status(400).json({ error: 'clientId is required.' });
      return;
    }

    const existing = reportsByClientId.get(clientId);
    if (existing) {
      removeFiles(files.map(file => file.filename));
      res.status(200).json(toPublicReport(req, existing));
      return;
    }

    if (!description) {
      removeFiles(files.map(file => file.filename));
      res.status(400).json({ error: 'description is required.' });
      return;
    }

    if (files.length < MIN_PHOTOS || files.length > MAX_PHOTOS) {
      removeFiles(files.map(file => file.filename));
      res.status(400).json({
        error: `Send between ${MIN_PHOTOS} and ${MAX_PHOTOS} photos.`,
      });
      return;
    }

    const report = {
      clientId,
      description,
      receivedAt: new Date().toISOString(),
      photos: files.map(file => ({ filename: file.filename })),
    };
    reportsByClientId.set(clientId, report);
    res.status(201).json(toPublicReport(req, report));
  });
});

app.use('/uploads', express.static(uploadsDir));

app.listen(PORT, () => {
  console.log(`Field Reports server on http://127.0.0.1:${PORT}`);
  console.log(
    `Fail mode: ${failMode} (POST /fail-mode {"mode":"slow|drop|refuse|hang|off"})`,
  );
});
