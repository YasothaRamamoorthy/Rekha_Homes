import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = parseInt(process.env.PORT || '5174', 10);
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

const TESTIMONIALS_FILE = path.join(__dirname, 'data', 'testimonials.json');

async function ensureDataFile() {
  try {
    await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
    await fs.access(TESTIMONIALS_FILE);
  } catch (err) {
    // create empty file
    await fs.writeFile(TESTIMONIALS_FILE, JSON.stringify([]), 'utf8');
  }
}

await ensureDataFile();

app.get('/api/testimonials', async (req, res) => {
  try {
    const raw = await fs.readFile(TESTIMONIALS_FILE, 'utf8');
    const items = JSON.parse(raw || '[]');
    res.json({ success: true, testimonials: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/testimonials', async (req, res) => {
  try {
    const { message, author } = req.body;
    if (!message || !author) return res.status(400).json({ success: false, error: 'Missing fields' });
    const raw = await fs.readFile(TESTIMONIALS_FILE, 'utf8');
    const items = JSON.parse(raw || '[]');
    const item = { message: String(message).trim(), author: String(author).trim(), createdAt: new Date().toISOString() };
    items.unshift(item);
    await fs.writeFile(TESTIMONIALS_FILE, JSON.stringify(items, null, 2), 'utf8');
    res.json({ success: true, testimonial: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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

// Email transporter configuration (using Gmail with app-specific password)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'yasotha1708@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Career application endpoint
app.post('/api/apply', upload.single('resume'), async (req, res) => {
  try {
    const { name, degree, status, years, phone } = req.body;
    const file = req.file;

    if (!name || !degree || !status || !phone || !file) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    if (status === 'experienced' && !years) {
      return res.status(400).json({ success: false, error: 'Years of experience is required for experienced applicants' });
    }

    // Prepare email content
    let emailContent = `
      <h2>New Job Application</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Degree/Qualification:</strong> ${degree}</p>
      <p><strong>Experience Level:</strong> ${status}</p>
    `;

    if (status === 'experienced') {
      emailContent += `<p><strong>Years of Experience:</strong> ${years}</p>`;
    }

    emailContent += `
      <p><strong>Phone Number:</strong> ${phone}</p>
      <p><strong>Resume:</strong> Attached as ${file.originalname}</p>
    `;

    const mailOptions = {
      from: 'yasotha1708@gmail.com',
      to: 'yasotha1708@gmail.com',
      subject: `Job Application - ${name}`,
      html: emailContent,
      attachments: [
        {
          filename: file.originalname,
          path: file.path,
        },
      ],
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Clean up uploaded file after sending
    await fs.unlink(file.path);

    res.json({ success: true, message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Upload API server running at http://localhost:${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Upload API is already running at http://localhost:${PORT}`);
    return;
  }

  throw error;
});
