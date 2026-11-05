export type QueuedPhoto = {
  id: string;
  path: string;
  source: string;
};

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

export function photoCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'photo' : 'photos'}`;
}

export function createClientId(): string {
  return `report-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}
