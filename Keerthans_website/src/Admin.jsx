import React, { useState, useEffect } from 'react';

const DEFAULT_PASSWORD = 'admin123';
const CATEGORIES = ['architecture', 'construction', 'interior'];

async function fetchImages() {
  const result = {};
  for (const category of CATEGORIES) {
    const res = await fetch(`/api/images?category=${category}`);
    if (!res.ok) {
      result[category] = [];
      continue;
    }
    const json = await res.json();
    result[category] = Array.isArray(json.images) ? json.images : [];
  }
  return result;
}

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [store, setStore] = useState({ architecture: [], construction: [], interior: [] });
  const [category, setCategory] = useState('architecture');
  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshStore();
  }, []);

  async function refreshStore() {
    setLoading(true);
    const loaded = await fetchImages();
    setStore(loaded);
    setLoading(false);
  }

  function handleLogin(e) {
    e.preventDefault();
    if (password === DEFAULT_PASSWORD) {
      setLoggedIn(true);
      setPassword('');
    } else {
      alert('Incorrect password');
    }
  }

  function handleFiles(e) {
    setFiles(e.target.files);
  }

  async function handleUpload() {
    if (!files || files.length === 0) {
      return alert('Select files first');
    }

    const form = new FormData();
    form.append('category', category);
    Array.from(files).forEach((file) => form.append('files', file));

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: form,
    });

    if (!res.ok) {
      alert('Upload failed');
      return;
    }

    alert('Uploaded ' + files.length + ' image(s) to ' + category);
    setFiles(null);
    refreshStore();
  }

  async function handleDelete(cat, src) {
    if (!confirm('Delete this image?')) return;
    const filename = decodeURIComponent(src.split('/').pop());
    const res = await fetch(`/api/image?category=${cat}&name=${filename}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      alert('Delete failed');
      return;
    }
    refreshStore();
  }

  if (!loggedIn) {
    return (
      <div style={{ padding: 40, maxWidth: 540, margin: '40px auto' }}>
        <h2>Admin Login</h2>
        <p>Enter the admin password to upload and manage images.</p>
        <form onSubmit={handleLogin}>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            style={{ padding: 10, width: '100%', marginBottom: 12 }}
          />
          <button className="button" type="submit">
            Login
          </button>
        </form>
        <p style={{ marginTop: 12, fontSize: 12, color: '#555' }}>
          Default password: <strong>{DEFAULT_PASSWORD}</strong>
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '24px auto' }}>
      <h2>Admin — Image Manager</h2>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <label>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="architecture">Architecture</option>
          <option value="construction">Construction</option>
          <option value="interior">Interior Design</option>
        </select>
        <input type="file" multiple accept="image/*" onChange={handleFiles} />
        <button className="button" onClick={handleUpload}>
          Upload
        </button>
      </div>

      <div>
        <h3>Stored Images</h3>
        {loading ? (
          <p>Loading images…</p>
        ) : (
          CATEGORIES.map((cat) => (
            <div key={cat} style={{ marginBottom: 18 }}>
              <h4 style={{ textTransform: 'capitalize' }}>{cat}</h4>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {store[cat] && store[cat].length ? (
                  store[cat].map((src, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <img
                        src={src}
                        alt="stored"
                        style={{ width: 160, height: 100, objectFit: 'cover', borderRadius: 8 }}
                      />
                      <button
                        onClick={() => handleDelete(cat, src)}
                        style={{ position: 'absolute', right: 6, top: 6 }}
                        aria-label="delete"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#666' }}>No images</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
