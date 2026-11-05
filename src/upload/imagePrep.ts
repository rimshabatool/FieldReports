import { getFileSize, getImageMetaData, Image } from 'react-native-compressor';

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

type CompressStep = {
  maxWidth: number;
  quality: number;
};

const COMPRESS_STEPS: CompressStep[] = [
  { maxWidth: 2048, quality: 0.82 },
  { maxWidth: 1600, quality: 0.72 },
  { maxWidth: 1280, quality: 0.62 },
  { maxWidth: 1024, quality: 0.52 },
  { maxWidth: 800, quality: 0.42 },
  { maxWidth: 640, quality: 0.32 },
];

export type PreparedPhoto = {
  uri: string;
  bytes: number;
};

async function bytesForUri(uri: string): Promise<number> {
  try {
    const size = await getFileSize(uri);
    const parsed = Number(size);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  } catch {
  }

  const meta = await getImageMetaData(uri);
  const parsed = Number(meta.size);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error('Could not read photo size.');
  }
  return parsed;
}

export async function preparePhotoUnderLimit(
  uri: string,
): Promise<PreparedPhoto> {
  let currentUri = uri;
  let bytes = await bytesForUri(currentUri);

  if (bytes <= MAX_PHOTO_BYTES) {
    return { uri: currentUri, bytes };
  }

  currentUri = await Image.compress(uri, {
    compressionMethod: 'auto',
    output: 'jpg',
  });
  bytes = await bytesForUri(currentUri);
  if (bytes <= MAX_PHOTO_BYTES) {
    return { uri: currentUri, bytes };
  }

  for (const step of COMPRESS_STEPS) {
    currentUri = await Image.compress(currentUri, {
      compressionMethod: 'manual',
      maxWidth: step.maxWidth,
      quality: step.quality,
      output: 'jpg',
    });
    bytes = await bytesForUri(currentUri);
    if (bytes <= MAX_PHOTO_BYTES) {
      return { uri: currentUri, bytes };
    }
  }

  throw new Error('Could not get this photo under 5 MB.');
}

export async function preparePhotosUnderLimit(
  uris: string[],
): Promise<PreparedPhoto[]> {
  const prepared: PreparedPhoto[] = [];
  for (const uri of uris) {
    prepared.push(await preparePhotoUnderLimit(uri));
  }
  return prepared;
}

