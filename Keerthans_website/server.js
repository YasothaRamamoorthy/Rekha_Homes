import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 5174;
const UPLOAD_ROOT = path.join(__dirname, 'public', 'uploads');
const CATEGORIES = ['architecture', 'construction', 'interior'];

async function ensureDirectories() {
  await Promise.all(
    CATEGORIES.map((category) => fs.mkdir(path.join(UPLOAD_ROOT, category), { recursive: true }))
  );
}

await ensureDirectories();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_ROOT));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.body.category;
    const target = CATEGORIES.includes(category) ? category : 'architecture';
    cb(null, path.join(UPLOAD_ROOT, target));
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;
    cb(null, unique);
  },
});

const upload = multer({ storage });

app.post('/api/upload', upload.array('files'), (req, res) => {
  const category = CATEGORIES.includes(req.body.category) ? req.body.category : 'architecture';
  const urls = req.files.map((file) => `/uploads/${category}/${encodeURIComponent(file.filename)}`);
  res.json({ success: true, images: urls });
});

app.get('/api/images', async (req, res) => {
  const category = req.query.category;
  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({ success: false, error: 'Invalid category' });
  }

  try {
    const files = await fs.readdir(path.join(UPLOAD_ROOT, category));
    const images = files
      .filter((file) => !file.startsWith('.'))
      .map((file) => `/uploads/${category}/${encodeURIComponent(file)}`);
    res.json({ success: true, images });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/image', async (req, res) => {
  const category = req.query.category;
  const filename = req.query.name;
  if (!CATEGORIES.includes(category) || !filename) {
    return res.status(400).json({ success: false, error: 'Missing category or filename' });
  }

  const filePath = path.join(UPLOAD_ROOT, category, filename);
  try {
    await fs.unlink(filePath);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Upload API server running at http://localhost:${PORT}`);
});
