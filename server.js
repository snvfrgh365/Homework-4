const path = require('path');
const fs = require('fs');

const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();

app.use(express.json());

const isAzure = !!process.env.WEBSITE_SITE_NAME;
const dataDir = isAzure ? '/home/data' : __dirname;

if (isAzure) {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (error) {
    // If we cannot create the directory, let sqlite open fail and report.
  }
}

const dbPath = path.join(dataDir, 'data.db');
const db = new sqlite3.Database(dbPath);

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(rows);
    });
  });
}

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function runCallback(error) {
      if (error) {
        reject(error);
        return;
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  );
});

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const PCHOME_CACHE_TTL_MS = 60_000;
const pchomeCache = new Map();

function fetchWithTimeout(url, options = {}, timeoutMs = 10_000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => {
    clearTimeout(timeoutId);
  });
}

function getCachedPchomePrice(query) {
  const key = query.toLowerCase();
  const hit = pchomeCache.get(key);

  if (!hit) {
    return null;
  }

  if (Date.now() > hit.expiresAt) {
    pchomeCache.delete(key);
    return null;
  }

  return hit.data;
}

function setCachedPchomePrice(query, data) {
  const key = query.toLowerCase();
  pchomeCache.set(key, { data, expiresAt: Date.now() + PCHOME_CACHE_TTL_MS });
}

app.get('/api/prices', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

  let sql = 'SELECT id, date, name, price, created_at FROM prices';
  const params = [];

  if (q) {
    sql += ' WHERE name LIKE ?';
    params.push(`%${q}%`);
  }

  sql += ' ORDER BY date DESC, id DESC';

  try {
    const rows = await allAsync(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('GET /api/prices failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/prices', async (req, res) => {
  const body = req.body && typeof req.body === 'object' ? req.body : {};

  const date = typeof body.date === 'string' ? body.date.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const rawPrice = body.price;

  const hasPrice = !(rawPrice === undefined || rawPrice === null || rawPrice === '');
  const price = hasPrice ? Number(rawPrice) : Number.NaN;

  if (!DATE_RE.test(date)) {
    res.status(400).json({ error: 'date 必須是 YYYY-MM-DD' });
    return;
  }

  if (!name) {
    res.status(400).json({ error: 'name 不可為空' });
    return;
  }

  if (!Number.isInteger(price) || price < 0) {
    res.status(400).json({ error: 'price 必須是非負整數' });
    return;
  }

  try {
    const result = await runAsync('INSERT INTO prices (date, name, price) VALUES (?, ?, ?)', [
      date,
      name,
      price,
    ]);

    const created = await allAsync(
      'SELECT id, date, name, price, created_at FROM prices WHERE id = ?',
      [result.lastID]
    );

    res.status(201).json(created[0]);
  } catch (error) {
    console.error('POST /api/prices failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/pchome-price', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

  if (!q) {
    res.status(400).json({ error: 'q 不可為空' });
    return;
  }

  if (q.length > 80) {
    res.status(400).json({ error: 'q 太長（請縮短關鍵字）' });
    return;
  }

  const cached = getCachedPchomePrice(q);
  if (cached) {
    res.json({ ...cached, cached: true });
    return;
  }

  const url =
    'https://ecshweb.pchome.com.tw/search/v3.3/all/results?q=' +
    encodeURIComponent(q) +
    '&page=1&sort=sale/dc';

  try {
    const resp = await fetchWithTimeout(
      url,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
      },
      10_000
    );

    if (!resp.ok) {
      res.status(502).json({ error: `PChome 回應失敗 (${resp.status})` });
      return;
    }

    const data = await resp.json();
    const first = data && Array.isArray(data.prods) ? data.prods[0] : null;

    if (!first || !first.Id) {
      res.status(404).json({ error: '找不到商品（請改一下 CPU 關鍵字）' });
      return;
    }

    const result = {
      query: q,
      id: first.Id,
      name: first.name,
      price: first.price,
      url: `https://24h.pchome.com.tw/prod/${first.Id}`,
      fetchedAt: new Date().toISOString(),
    };

    setCachedPchomePrice(q, result);
    res.json(result);
  } catch (error) {
    console.error('GET /api/pchome-price failed:', error);
    res.status(502).json({ error: '抓取失敗（可能是網路或 PChome 暫時無法存取）' });
  }
});

app.use('/vendor', express.static(path.join(__dirname, 'node_modules', 'chart.js', 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

const DEFAULT_PORT = 3000;
const envPortRaw = process.env.PORT;
const envPort = envPortRaw !== undefined && envPortRaw !== null ? String(envPortRaw).trim() : '';

if (envPort && (!Number.isFinite(Number(envPort)) || Number(envPort) <= 0)) {
  console.error(`Invalid PORT: ${envPortRaw}`);
  process.exit(1);
}

const initialPort = envPort ? Number(envPort) : DEFAULT_PORT;
const MAX_PORT_TRIES = 20;

function startServer(port, triesLeft) {
  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`SQLite DB: ${dbPath}`);
  });

  server.on('error', (error) => {
    if (error && error.code === 'EADDRINUSE' && !envPort && triesLeft > 0) {
      console.warn(`Port ${port} is in use, trying ${port + 1}...`);
      startServer(port + 1, triesLeft - 1);
      return;
    }

    console.error('Server failed to start:', error);
    process.exitCode = 1;
  });
}

startServer(initialPort, MAX_PORT_TRIES);
