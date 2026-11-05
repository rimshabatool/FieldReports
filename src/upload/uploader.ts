import NetInfo from '@react-native-community/netinfo';

import { UploadRequestError, uploadReport } from './api';
import {
  ensureHydrated,
  getReports,
  removeReport,
  setReportsWaitingForSignal,
  updateReportStatus,
} from './queue';
import { QueuedReport } from './types';

let runToken = 0;
let loopRunning = false;
let netUnsubscribe: (() => void) | null = null;

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

async function uploadOne(report: QueuedReport, token: number): Promise<void> {
  if (token !== runToken) {
    return;
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
      return;
    }
    await removeReport(report.clientId);
  } catch (error) {
    if (token !== runToken) {
      return;
    }

    if (error instanceof UploadRequestError && !error.retryable) {
      await updateReportStatus(
        report.clientId,
        'failed',
        error.message || 'Will not retry.',
      );
      return;
    }

    const online = await isOnline();
    if (!online) {
      await updateReportStatus(
        report.clientId,
        'waiting',
        'Waiting for signal',
      );
      return;
    }

    const message =
      error instanceof Error ? error.message : 'Will retry.';
    const timedOut = /timed?\s*out|aborted|network request failed/i.test(
      message,
    );
    await updateReportStatus(
      report.clientId,
      'saved',
      timedOut ? 'No response — will retry.' : message,
    );
    await delay(1500);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
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

      await uploadOne(next, token);
    }
  } finally {
    loopRunning = false;
  }
}

export function abortUploader(): void {
  runToken += 1;
  loopRunning = false;
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
      setReportsWaitingForSignal().catch(() => {});
    }
  });

  return () => {
    if (netUnsubscribe) {
      netUnsubscribe();
      netUnsubscribe = null;
    }
  };
}
