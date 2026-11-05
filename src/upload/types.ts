export type QueuedPhoto = {
  id: string;
  /** Absolute file path on this phone (copied into app storage). */
  path: string;
  source: string;
};

/**
 * Local queue status only. "Uploaded" is not a phone-queue status —
 * once the server has it, the report leaves this list in a later step.
 */
export type QueueStatus = 'saved' | 'waiting' | 'uploading' | 'failed';

export type QueuedReport = {
  clientId: string;
  description: string;
  createdAt: string;
  status: QueueStatus;
  note?: string;
  photos: QueuedPhoto[];
};

export function statusLabel(status: QueueStatus): string {
  switch (status) {
    case 'saved':
      return 'Saved on this phone';
    case 'waiting':
      return 'Waiting for signal';
    case 'uploading':
      return 'Uploading';
    case 'failed':
      return 'Failed';
  }
}

export function createClientId(): string {
  return `report-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}
