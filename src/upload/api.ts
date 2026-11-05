import ReactNativeBlobUtil from 'react-native-blob-util';

import {
  FETCH_TIMEOUT_MS,
  getServerBaseUrl,
  UPLOAD_TIMEOUT_MS,
} from './config';
import {QueuedReport} from './types';

export type ServerPhoto = {
  filename: string;
  url: string;
};

export type ServerReport = {
  clientId: string;
  description: string;
  receivedAt: string;
  photoCount: number;
  photos: ServerPhoto[];
};

export type UploadSuccess = ServerReport;

export class UploadRequestError extends Error {
  status: number;
  retryable: boolean;

  constructor(message: string, status: number, retryable: boolean) {
    super(message);
    this.name = 'UploadRequestError';
    this.status = status;
    this.retryable = retryable;
  }
}

function filePart(path: string, index: number) {
  const clean = path.startsWith('file://') ? path.replace('file://', '') : path;
  return {
    name: 'photos',
    filename: `photo-${index + 1}.jpg`,
    type: 'image/jpeg',
    data: ReactNativeBlobUtil.wrap(clean),
  };
}

export async function uploadReport(
  report: QueuedReport,
): Promise<UploadSuccess> {
  const parts = [
    {name: 'clientId', data: report.clientId},
    {name: 'description', data: report.description},
    ...report.photos.map((photo, index) => filePart(photo.path, index)),
  ];

  let status = 0;
  let bodyText = '';

  try {
    const response = await ReactNativeBlobUtil.config({
      timeout: UPLOAD_TIMEOUT_MS,
    }).fetch(
      'POST',
      `${getServerBaseUrl()}/reports`,
      {'Content-Type': 'multipart/form-data'},
      parts,
    );
    status = response.info().status;
    const textResult = response.text();
    bodyText = typeof textResult === 'string' ? textResult : await textResult;
  } catch (error) {
    throw new UploadRequestError(
      error instanceof Error ? error.message : 'Network request failed.',
      0,
      true,
    );
  }

  let parsed: UploadSuccess | {error?: string} | null = null;
  try {
    parsed = bodyText ? (JSON.parse(bodyText) as UploadSuccess) : null;
  } catch {
    parsed = null;
  }

  if (status >= 200 && status < 300 && parsed && 'clientId' in parsed) {
    return parsed;
  }

  const serverError =
    parsed && typeof parsed === 'object' && 'error' in parsed
      ? parsed.error
      : undefined;
  const message = serverError
    ? String(serverError)
    : `Upload failed (${status || 'network'}).`;

  throw new UploadRequestError(
    message,
    status,
    status === 0 || status >= 500,
  );
}

export async function fetchServerReports(): Promise<ServerReport[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${getServerBaseUrl()}/reports`, {
      signal: controller.signal,
    });
  } catch {
    throw new Error('Could not reach the server.');
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new Error(`Could not load server reports (${response.status}).`);
  }

  const body = (await response.json()) as {reports?: ServerReport[]};
  return Array.isArray(body.reports) ? body.reports : [];
}

export function formatReceivedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}
