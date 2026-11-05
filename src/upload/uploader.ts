import NetInfo from '@react-native-community/netinfo';

import {UploadRequestError, uploadReport} from './api';
import {
  ensureHydrated,
  getReports,
  removeReport,
  setReportsWaitingForSignal,
  updateReportStatus,
} from './queue';
import {QueuedReport} from './types';

const SERVER_RETRY_MS = 12_000;

let runToken = 0;
let loopRunning = false;
let netUnsubscribe: (() => void) | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;

function stateLooksOnline(state: {
  isConnected: boolean | null;
  isInternetReachable?: boolean | null;
}): boolean {
  return state.isConnected !== false && state.isInternetReachable !== false;
}

async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return stateLooksOnline(state);
}

function nextUploadCandidate(): QueuedReport | undefined {
  return getReports().find(
    report =>
      report.status === 'saved' ||
      report.status === 'waiting' ||
      report.status === 'uploading',
  );
}

function clearRetryTimer(): void {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
}

function scheduleServerRetry(): void {
  clearRetryTimer();
  retryTimer = setTimeout(() => {
    retryTimer = null;
    kickUploader().catch(() => {});
  }, SERVER_RETRY_MS);
}

type UploadOutcome = 'done' | 'offline' | 'server_unreachable';

async function uploadOne(
  report: QueuedReport,
  token: number,
): Promise<UploadOutcome> {
  if (token !== runToken) {
    return 'done';
  }

  const total = report.photos.length;
  await updateReportStatus(
    report.clientId,
    'uploading',
    total > 1 ? `Sending ${total} photos` : 'Sending photo',
  );

  try {
    await uploadReport(report);
    if (token !== runToken) {
      return 'done';
    }
    await removeReport(report.clientId);
    return 'done';
  } catch (error) {
    if (token !== runToken) {
      return 'done';
    }

    if (error instanceof UploadRequestError && !error.retryable) {
      await updateReportStatus(
        report.clientId,
        'failed',
        error.message || 'Will not retry.',
      );
      return 'done';
    }

    const online = await isOnline();
    if (!online) {
      await updateReportStatus(
        report.clientId,
        'waiting',
        'Waiting for signal',
      );
      return 'offline';
    }

    const message = error instanceof Error ? error.message : 'Will retry.';
    const timedOut = /timed?\s*out|aborted|network request failed/i.test(
      message,
    );
    await updateReportStatus(
      report.clientId,
      'waiting',
      timedOut
        ? 'No response — will retry.'
        : 'Server unreachable — will retry.',
    );
    return 'server_unreachable';
  }
}

export async function kickUploader(): Promise<void> {
  if (loopRunning) {
    return;
  }

  loopRunning = true;
  const token = runToken;

  try {
    await ensureHydrated();

    while (token === runToken) {
      const online = await isOnline();
      if (!online) {
        await setReportsWaitingForSignal();
        break;
      }

      const next = nextUploadCandidate();
      if (!next) {
        break;
      }

      const outcome = await uploadOne(next, token);
      if (outcome === 'offline') {
        break;
      }
      if (outcome === 'server_unreachable') {
        scheduleServerRetry();
        break;
      }
    }
  } finally {
    loopRunning = false;
  }
}

export function abortUploader(): void {
  runToken += 1;
  loopRunning = false;
  clearRetryTimer();
}

export function startUploader(): () => void {
  kickUploader().catch(() => {});

  if (netUnsubscribe) {
    return netUnsubscribe;
  }

  netUnsubscribe = NetInfo.addEventListener(state => {
    if (stateLooksOnline(state)) {
      kickUploader().catch(() => {});
    } else {
      clearRetryTimer();
      setReportsWaitingForSignal().catch(() => {});
    }
  });

  return () => {
    clearRetryTimer();
    if (netUnsubscribe) {
      netUnsubscribe();
      netUnsubscribe = null;
    }
  };
}
