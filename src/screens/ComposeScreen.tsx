import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { FieldInput } from '../components/FieldInput';
import { PhotoTile, PhotoTiles } from '../components/PhotoTiles';
import { PhoneStackParamList } from '../navigation/types';
import { pickPhotos } from '../photos/pickMedia';
import { colors, scale, spacing, typography } from '../theme';
import { preparePhotosUnderLimit } from '../upload/imagePrep';
import { addReport } from '../upload/queue';

type Props = NativeStackScreenProps<PhoneStackParamList, 'Compose'>;

const MAX_PHOTOS = 5;

export function ComposeScreen({ navigation }: Props) {
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<PhotoTile[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [picking, setPicking] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [saving, setSaving] = useState(false);
  const busy = picking || compressing || saving;
  const atLimit = photos.length >= MAX_PHOTOS;
  const remaining = MAX_PHOTOS - photos.length;
  const descriptionMissing = description.trim().length === 0;
  const photosMissing = photos.length === 0;

  async function addPhotos() {
    if (atLimit || busy) {
      return;
    }

    setPicking(true);
    try {
      const result = await pickPhotos(remaining);
      if (!result) {
        return;
      }

      setPicking(false);
      setCompressing(true);

      const prepared = await preparePhotosUnderLimit(
        result.photos.map(photo => photo.uri),
      );

      setPhotos(current => {
        const room = MAX_PHOTOS - current.length;
        if (room <= 0) {
          return current;
        }

        const additions = prepared.slice(0, room).map((photo, index) => ({
          id: `${result.source}-${Date.now()}-${index}`,
          source: result.source,
          uri: photo.uri,
        }));
        return [...current, ...additions];
      });
    } catch (error) {
      Alert.alert(
        'Could not prepare photo',
        error instanceof Error
          ? error.message
          : 'The photo could not be shrunk under 5 MB.',
      );
    } finally {
      setPicking(false);
      setCompressing(false);
    }
  }

  async function saveOnPhone() {
    setShowErrors(true);
    if (descriptionMissing || photosMissing || busy) {
      return;
    }

    setSaving(true);
    try {
      await addReport({
        description,
        photos: photos.flatMap(photo =>
          photo.uri ? [{uri: photo.uri, source: photo.source}] : [],
        ),
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Could not save',
        error instanceof Error
          ? error.message
          : 'The report could not be saved on this phone.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <FieldInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="What did you see?"
        multiline
        error={
          showErrors && descriptionMissing
            ? 'A description is required.'
            : undefined
        }
      />
      <View style={styles.photos}>
        <View style={styles.photosHeader}>
          <Text style={styles.label}>Photos</Text>
          {photos.length > 0 ? (
            <Text style={styles.count}>
              {photos.length}/{MAX_PHOTOS}
            </Text>
          ) : null}
        </View>
        <SecondaryButton
          label="Add photo"
          disabled={atLimit || busy}
          onPress={addPhotos}
        />
        {compressing ? (
          <View style={styles.compressing} accessibilityLiveRegion="polite">
            <ActivityIndicator color={colors.button} />
            <Text style={styles.compressingText}>Image is compressing…</Text>
          </View>
        ) : null}
        {atLimit ? (
          <Text style={styles.help}>5 photos is the maximum.</Text>
        ) : null}
        {showErrors && photosMissing ? (
          <Text style={styles.error}>Add at least one photo.</Text>
        ) : null}
        {photos.length > 0 ? (
          <PhotoTiles
            photos={photos}
            onRemove={id =>
              setPhotos(current => current.filter(photo => photo.id !== id))
            }
          />
        ) : null}
      </View>
      <PrimaryButton
        label={saving ? 'Saving…' : 'Save on this phone'}
        disabled={busy}
        onPress={saveOnPhone}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.screen,
    gap: scale.s(22),
    paddingBottom: scale.vs(32),
  },
  photos: {
    gap: scale.s(10),
  },
  photosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.text,
    fontSize: typography.label,
    fontWeight: '600',
  },
  count: {
    color: colors.muted,
    fontSize: typography.meta,
    fontWeight: '600',
  },
  help: {
    color: colors.muted,
    fontSize: typography.caption,
    lineHeight: scale.vs(18),
  },
  error: {
    color: colors.danger,
    fontSize: typography.meta,
    lineHeight: scale.vs(20),
  },
  compressing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale.s(10),
    paddingVertical: scale.vs(8),
  },
  compressingText: {
    color: colors.text,
    fontSize: typography.meta,
    fontWeight: '600',
  },
});
