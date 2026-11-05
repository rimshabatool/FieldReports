import {Alert, Linking} from 'react-native';
import {
  Asset,
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';

export type PickedPhoto = {
  uri: string;
  fileName?: string;
  fileSize?: number;
  type?: string;
};

const CAMERA_OPTIONS = {
  mediaType: 'photo' as const,
  saveToPhotos: false,
  includeBase64: false,
  cameraType: 'back' as const,
};

function libraryOptions(remaining: number) {
  return {
    mediaType: 'photo' as const,
    selectionLimit: remaining,
    includeBase64: false,
  };
}

function showPermissionHelp(kind: 'camera' | 'gallery') {
  const message =
    kind === 'camera'
      ? 'Camera access is needed to take a photo for this report. You can turn it on in Settings.'
      : 'Photo library access is needed to attach photos to this report. You can turn it on in Settings.';

  Alert.alert('Permission needed', message, [
    {text: 'Not now', style: 'cancel'},
    {text: 'Open Settings', onPress: () => Linking.openSettings()},
  ]);
}

function toPickedPhotos(assets: Asset[] | undefined): PickedPhoto[] {
  if (!assets) {
    return [];
  }

  return assets
    .filter((asset): asset is Asset & {uri: string} => Boolean(asset.uri))
    .map(asset => ({
      uri: asset.uri,
      fileName: asset.fileName,
      fileSize: asset.fileSize,
      type: asset.type,
    }));
}

function handlePickerResult(
  response: ImagePickerResponse,
  kind: 'camera' | 'gallery',
): PickedPhoto[] {
  if (response.didCancel) {
    return [];
  }

  if (response.errorCode === 'permission') {
    showPermissionHelp(kind);
    return [];
  }

  if (response.errorCode || response.errorMessage) {
    Alert.alert(
      'Could not add photo',
      response.errorMessage || 'Something went wrong while picking a photo.',
    );
    return [];
  }

  return toPickedPhotos(response.assets);
}

export async function pickFromCamera(): Promise<PickedPhoto[]> {
  const response = await launchCamera(CAMERA_OPTIONS);
  return handlePickerResult(response, 'camera');
}

export async function pickFromGallery(
  remaining: number,
): Promise<PickedPhoto[]> {
  if (remaining <= 0) {
    return [];
  }

  const response = await launchImageLibrary(libraryOptions(remaining));
  return handlePickerResult(response, 'gallery');
}

export type PhotoSourceChoice = 'Camera' | 'Gallery';

/** System choice sheet: Camera or Gallery. Cancel returns null. */
export function choosePhotoSource(): Promise<PhotoSourceChoice | null> {
  return new Promise(resolve => {
    Alert.alert('Add photo', undefined, [
      {text: 'Cancel', style: 'cancel', onPress: () => resolve(null)},
      {text: 'Camera', onPress: () => resolve('Camera')},
      {text: 'Gallery', onPress: () => resolve('Gallery')},
    ]);
  });
}

export async function pickPhotos(
  remaining: number,
): Promise<{source: PhotoSourceChoice; photos: PickedPhoto[]} | null> {
  if (remaining <= 0) {
    return null;
  }

  const source = await choosePhotoSource();
  if (!source) {
    return null;
  }

  const photos =
    source === 'Camera'
      ? await pickFromCamera()
      : await pickFromGallery(remaining);

  if (photos.length === 0) {
    return null;
  }

  return {source, photos};
}
