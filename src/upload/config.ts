import {Platform} from 'react-native';

export const SERVER_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8787'
    : 'http://127.0.0.1:8787';

export const UPLOAD_TIMEOUT_MS = 45_000;
export const FETCH_TIMEOUT_MS = 15_000;

export function getServerBaseUrl() {
  return SERVER_BASE_URL;
}
