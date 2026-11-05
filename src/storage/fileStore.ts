import ReactNativeBlobUtil from 'react-native-blob-util';

import {QueuedReport} from '../upload/types';

const QUEUE_FILE = 'queue.json';
const PHOTOS_DIR = 'report-photos';

function rootDir(): string {
  return ReactNativeBlobUtil.fs.dirs.DocumentDir;
}

function queuePath(): string {
  return `${rootDir()}/${QUEUE_FILE}`;
}

function photosRoot(): string {
  return `${rootDir()}/${PHOTOS_DIR}`;
}

function stripFileScheme(uri: string): string {
  return uri.startsWith('file://') ? uri.replace('file://', '') : uri;
}

async function ensureDir(path: string): Promise<void> {
  const exists = await ReactNativeBlobUtil.fs.exists(path);
  if (!exists) {
    await ReactNativeBlobUtil.fs.mkdir(path);
  }
}

export async function loadQueue(): Promise<QueuedReport[]> {
  const path = queuePath();
  const exists = await ReactNativeBlobUtil.fs.exists(path);
  if (!exists) {
    return [];
  }

  const raw = await ReactNativeBlobUtil.fs.readFile(path, 'utf8');
  if (!raw || !raw.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as {reports?: QueuedReport[]};
    return Array.isArray(parsed.reports) ? parsed.reports : [];
  } catch {
    return [];
  }
}

export async function saveQueue(reports: QueuedReport[]): Promise<void> {
  await ensureDir(rootDir());
  await ReactNativeBlobUtil.fs.writeFile(
    queuePath(),
    JSON.stringify({reports}, null, 2),
    'utf8',
  );
}

export async function copyPhotoToStore(
  clientId: string,
  index: number,
  sourceUri: string,
): Promise<string> {
  const reportDir = `${photosRoot()}/${clientId}`;
  await ensureDir(photosRoot());
  await ensureDir(reportDir);

  const dest = `${reportDir}/photo-${index + 1}.jpg`;
  const source = stripFileScheme(sourceUri);
  const alreadyThere = await ReactNativeBlobUtil.fs.exists(dest);
  if (alreadyThere) {
    await ReactNativeBlobUtil.fs.unlink(dest);
  }
  await ReactNativeBlobUtil.fs.cp(source, dest);
  return dest;
}

async function removePathRecursive(target: string): Promise<void> {
  const exists = await ReactNativeBlobUtil.fs.exists(target);
  if (!exists) {
    return;
  }

  const stat = await ReactNativeBlobUtil.fs.stat(target);
  if (stat.type === 'directory') {
    const entries = await ReactNativeBlobUtil.fs.ls(target);
    for (const name of entries) {
      await removePathRecursive(`${target}/${name}`);
    }
  }

  await ReactNativeBlobUtil.fs.unlink(target);
}

export async function deleteReportPhotos(clientId: string): Promise<void> {
  await removePathRecursive(`${photosRoot()}/${clientId}`);
}

export async function clearAllStoredReports(): Promise<void> {
  await removePathRecursive(photosRoot());
  await saveQueue([]);
}
