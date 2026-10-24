const DB_NAME = 'vinyl-offline-cache';
const DB_VERSION = 1;
const STORE_NAME = 'audio-blobs';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'trackId' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export type CachedTrack = {
  trackId: string;
  blob: Blob;
  title: string;
  artist: string;
  audioPath: string;
  cachedAt: number;
};

export async function saveTrackOffline(track: {
  id: string;
  title: string;
  artist: string;
  audio_path: string;
}): Promise<void> {
  const response = await fetch(track.audio_path);
  if (!response.ok) throw new Error(`Failed to fetch audio: ${response.status}`);
  const blob = await response.blob();

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({
      trackId: track.id,
      blob,
      title: track.title,
      artist: track.artist,
      audioPath: track.audio_path,
      cachedAt: Date.now(),
    });
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function removeTrackOffline(trackId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    store = tx.objectStore(STORE_NAME);
    store.delete(trackId);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function getCachedTrackIds(): Promise<Set<string>> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAllKeys();
    req.onsuccess = () => {
      db.close();
      resolve(new Set(req.result as string[]));
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

export async function getCachedTrackBlob(trackId: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(trackId);
    req.onsuccess = () => {
      db.close();
      const result = req.result as CachedTrack | undefined;
      resolve(result ? result.blob : null);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

export async function getCachedTracks(): Promise<CachedTrack[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      db.close();
      resolve(req.result as CachedTrack[]);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

export async function getCachedTrackCount(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.count();
    req.onsuccess = () => {
      db.close();
      resolve(req.result);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}
