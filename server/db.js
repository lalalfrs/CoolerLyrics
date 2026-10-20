import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initialPlaylist } from '../src/data/playlistData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.sqlite');
export const db = new DatabaseSync(dbPath);

// Inisialisasi tabel SQLite
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      album TEXT,
      duration INTEGER DEFAULT 0,
      cover_art TEXT,
      audio_src TEXT NOT NULL,
      spotify_track_id TEXT,
      spotify_embed_url TEXT,
      raw_lrc TEXT,
      lyrics_json TEXT,
      is_custom INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
  `);

  // Periksa apakah tabel songs kosong
  const countRow = db.prepare('SELECT COUNT(*) as count FROM songs').get();
  if (countRow.count === 0) {
    console.log('[SQLite] Table songs kosong, melakukan seeding lagu awal...');
    const insert = db.prepare(`
      INSERT INTO songs (
        id, title, artist, album, duration, cover_art, audio_src,
        spotify_track_id, spotify_embed_url, raw_lrc, lyrics_json, is_custom
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const song of initialPlaylist) {
      insert.run(
        song.id,
        song.title,
        song.artist || 'Barasuara',
        song.album || 'Jalaran Sadrah (2024)',
        song.duration || 216,
        song.coverArt || '',
        song.audioSrc,
        song.spotifyTrackId || null,
        song.spotifyEmbedUrl || null,
        song.rawLrc || '',
        JSON.stringify(song.lyrics || []),
        0
      );
    }
    console.log(`[SQLite] Berhasil men-seed ${initialPlaylist.length} lagu default.`);
  }
}

// Format baris SQLite ke objek lagu yang digunakan React
export function formatSongRow(row) {
  let lyrics = [];
  try {
    if (row.lyrics_json) {
      lyrics = JSON.parse(row.lyrics_json);
    }
  } catch (e) {
    lyrics = [];
  }

  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    album: row.album || '',
    duration: Number(row.duration) || 0,
    coverArt: row.cover_art || '',
    audioSrc: row.audio_src,
    spotifyTrackId: row.spotify_track_id || undefined,
    spotifyEmbedUrl: row.spotify_embed_url || undefined,
    rawLrc: row.raw_lrc || '',
    lyrics: lyrics,
    isCustom: Boolean(row.is_custom),
    createdAt: row.created_at,
  };
}

// Query mengambil semua lagu
export function getAllSongs() {
  const rows = db.prepare('SELECT * FROM songs ORDER BY is_custom ASC, created_at ASC').all();
  return rows.map(formatSongRow);
}

// Query mengambil 1 lagu berdasarkan ID
export function getSongById(id) {
  const row = db.prepare('SELECT * FROM songs WHERE id = ?').get(id);
  return row ? formatSongRow(row) : null;
}

// Menambahkan lagu baru ke database SQLite
export function createSong(songData) {
  const insert = db.prepare(`
    INSERT INTO songs (
      id, title, artist, album, duration, cover_art, audio_src,
      spotify_track_id, spotify_embed_url, raw_lrc, lyrics_json, is_custom
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    songData.id,
    songData.title,
    songData.artist,
    songData.album,
    songData.duration,
    songData.coverArt,
    songData.audioSrc,
    songData.spotifyTrackId || null,
    songData.spotifyEmbedUrl || null,
    songData.rawLrc || '',
    JSON.stringify(songData.lyrics || []),
    songData.isCustom ? 1 : 0
  );

  return getSongById(songData.id);
}

// Memperbarui lirik dan raw LRC lagu
export function updateSongLyrics(id, lyrics, rawLrc) {
  const update = db.prepare(`
    UPDATE songs SET lyrics_json = ?, raw_lrc = ? WHERE id = ?
  `);
  update.run(JSON.stringify(lyrics), rawLrc, id);
  return getSongById(id);
}

// Menghapus lagu dari database
export function deleteSong(id) {
  const song = getSongById(id);
  if (!song) return null;

  db.prepare('DELETE FROM songs WHERE id = ?').run(id);
  return song;
}
