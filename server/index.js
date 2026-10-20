import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  initDatabase,
  getAllSongs,
  getSongById,
  createSong,
  updateSongLyrics,
  deleteSong,
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inisialisasi Database SQLite
initDatabase();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Pastikan folder uploads ada
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Konfigurasi Multer untuk penyimpanan file audio fisik
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${Date.now()}-${safeName}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Maksimal 50MB per file audio
});

// Sajikan folder uploads dan audio statis
app.use('/uploads', express.static(uploadsDir));
app.use('/audio', express.static(path.join(__dirname, '../public/audio')));

// ==================== REST API ENDPOINTS ====================

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CoolerLyrics SQLite API', time: new Date() });
});

// 2. Ambil Semua Lagu dari Database SQLite
app.get('/api/songs', (req, res) => {
  try {
    const songs = getAllSongs();
    res.json(songs);
  } catch (err) {
    console.error('Error fetching songs:', err);
    res.status(500).json({ error: 'Gagal mengambil data lagu dari database.' });
  }
});

// 3. Ambil 1 Lagu Berdasarkan ID
app.get('/api/songs/:id', (req, res) => {
  try {
    const song = getSongById(req.params.id);
    if (!song) {
      return res.status(404).json({ error: 'Lagu tidak ditemukan.' });
    }
    res.json(song);
  } catch (err) {
    console.error('Error fetching song:', err);
    res.status(500).json({ error: 'Gagal mengambil data lagu.' });
  }
});

// 4. Tambah Lagu Baru (Mendukung upload file MP3 fisik atau input Spotify embed)
app.post('/api/songs', upload.single('audio'), (req, res) => {
  try {
    const {
      title,
      artist,
      album,
      duration,
      coverArt,
      spotifyTrackId,
      spotifyEmbedUrl,
      rawLrc,
      lyrics,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Judul lagu wajib diisi.' });
    }

    // Tentukan URL audio: jika ada file MP3 yang diunggah, gunakan /uploads/<filename>
    let audioSrc = '';
    if (req.file) {
      audioSrc = `/uploads/${req.file.filename}`;
    } else if (req.body.audioSrc && req.body.audioSrc.trim()) {
      audioSrc = req.body.audioSrc.trim();
    } else {
      audioSrc = '/audio/Manusia(Sumarah).mp3';
    }

    // Parse array lyrics jika dikirim dalam bentuk string JSON
    let parsedLyrics = [];
    if (typeof lyrics === 'string') {
      try {
        parsedLyrics = JSON.parse(lyrics);
      } catch (e) {
        parsedLyrics = [];
      }
    } else if (Array.isArray(lyrics)) {
      parsedLyrics = lyrics;
    }

    const newSongId = 'song-' + Date.now();

    const created = createSong({
      id: newSongId,
      title: title.trim(),
      artist: (artist && artist.trim()) || 'Artis Pilihan',
      album: (album && album.trim()) || 'Single',
      duration: Number(duration) || (parsedLyrics.length > 0 ? Math.ceil(parsedLyrics[parsedLyrics.length - 1].time + 6) : 216),
      coverArt: coverArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
      audioSrc: audioSrc,
      spotifyTrackId: spotifyTrackId || undefined,
      spotifyEmbedUrl: spotifyEmbedUrl || undefined,
      rawLrc: rawLrc || '',
      lyrics: parsedLyrics,
      isCustom: true,
    });

    console.log(`[SQLite] Lagu baru berhasil disimpan ke database: "${created.title}" (${created.audioSrc})`);
    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating song:', err);
    res.status(500).json({ error: 'Gagal menyimpan lagu ke database SQLite.' });
  }
});

// 5. Update Lirik Lagu
app.put('/api/songs/:id/lyrics', (req, res) => {
  try {
    const { lyrics, rawLrc } = req.body;
    const existing = getSongById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Lagu tidak ditemukan.' });
    }

    const updated = updateSongLyrics(req.params.id, lyrics || [], rawLrc || '');
    res.json(updated);
  } catch (err) {
    console.error('Error updating lyrics:', err);
    res.status(500).json({ error: 'Gagal memperbarui lirik lagu.' });
  }
});

// 6. Hapus Lagu dari Database & Hapus File Fisik jika Ada di folder /uploads
app.delete('/api/songs/:id', (req, res) => {
  try {
    const song = getSongById(req.params.id);
    if (!song) {
      return res.status(404).json({ error: 'Lagu tidak ditemukan.' });
    }

    // Jika lagu memiliki file fisik di uploads/, hapus file dari disk
    if (song.audioSrc && song.audioSrc.startsWith('/uploads/')) {
      const filename = path.basename(song.audioSrc);
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`[Storage] File fisik dihapus: ${filePath}`);
        } catch (unlinkErr) {
          console.warn('Gagal menghapus file fisik audio:', unlinkErr);
        }
      }
    }

    deleteSong(req.params.id);
    console.log(`[SQLite] Lagu "${song.title}" berhasil dihapus dari database.`);
    res.json({ success: true, deleted: song });
  } catch (err) {
    console.error('Error deleting song:', err);
    res.status(500).json({ error: 'Gagal menghapus lagu.' });
  }
});

app.listen(PORT, () => {
  console.log(`[Backend] CoolerLyrics SQLite API berjalan di http://localhost:${PORT}`);
});
