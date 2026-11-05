import {
  clearAllStoredReports,
  copyPhotoToStore,
  deleteReportPhotos,
  loadQueue,
  saveQueue,
} from '../storage/fileStore';
import {
  createClientId,
  QueuedPhoto,
  QueuedReport,
  QueueStatus,
} from './types';

function requestUpload(): void {
  // Lazy import avoids a cycle with uploader.ts at module load.
  const { kickUploader } = require('./uploader') as typeof import('./uploader');
  kickUploader().catch(() => {});
}

function requestAbortUpload(): void {
  const { abortUploader } =
    require('./uploader') as typeof import('./uploader');
  abortUploader();
}

type Listener = (reports: QueuedReport[]) => void;

let reports: QueuedReport[] = [];
let hydrated = false;
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) {
    listener(reports.slice());
  }
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  listener(reports.slice());
  return () => {
    listeners.delete(listener);
  };
}

export function getReports(): QueuedReport[] {
  return reports.slice();
}

/** Read the queue from disk. Safe to call on every cold start. */
export async function hydrateQueue(): Promise<QueuedReport[]> {
  reports = await loadQueue();
  hydrated = true;
  emit();
  return getReports();
}

export async function ensureHydrated(): Promise<void> {
  if (!hydrated) {
    await hydrateQueue();
  }
}

export type NewReportInput = {
  description: string;
  photos: { uri: string; source: string }[];
};

export async function addReport(input: NewReportInput): Promise<QueuedReport> {
  await ensureHydrated();

  const clientId = createClientId();
  const photos: QueuedPhoto[] = [];

  for (let index = 0; index < input.photos.length; index += 1) {
    const photo = input.photos[index];
    const path = await copyPhotoToStore(clientId, index, photo.uri);
    photos.push({
      id: `${clientId}-photo-${index + 1}`,
      path,
      source: photo.source,
    });
  }

  const report: QueuedReport = {
    clientId,
    description: input.description.trim(),
    createdAt: new Date().toISOString(),
    status: 'saved',
    photos,
  };

  reports = [report, ...reports];
  await saveQueue(reports);
  emit();
  requestUpload();
  return report;
}

export async function updateReportStatus(
  clientId: string,
  status: QueueStatus,
  note?: string,
): Promise<void> {
  await ensureHydrated();
  const exists = reports.some(report => report.clientId === clientId);
  if (!exists) {
    return;
  }
  reports = reports.map(report =>
    report.clientId === clientId
      ? {
          ...report,
          status,
          note: note === undefined ? report.note : note,
        }
      : report,
  );
  await saveQueue(reports);
  emit();
}
export async function removeReport(clientId: string): Promise<void> {
  await ensureHydrated();
  const exists = reports.some(report => report.clientId === clientId);
  if (!exists) {
    return;
  }
  reports = reports.filter(report => report.clientId !== clientId);
  await deleteReportPhotos(clientId);
  await saveQueue(reports);
  emit();
}

export async function setReportsWaitingForSignal(): Promise<void> {
  await ensureHydrated();
  let changed = false;
  reports = reports.map(report => {
    if (
      report.status === 'saved' ||
      report.status === 'uploading' ||
      report.status === 'waiting'
    ) {
      if (report.status !== 'waiting' || report.note !== undefined) {
        changed = true;
        return {
          ...report,
          status: 'waiting' as const,
          note: undefined,
        };
      }
    }
    return report;
  });
  if (changed) {
    await saveQueue(reports);
    emit();
  }
}

export async function clearLocalQueue(): Promise<void> {
  requestAbortUpload();
  await ensureHydrated();
  const snapshot = reports.slice();
  reports = [];
  emit();
  await clearAllStoredReports(snapshot);
  emit();
}
