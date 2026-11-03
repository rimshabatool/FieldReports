import {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {PrimaryButton, SecondaryButton} from '../components/Buttons';
import {FieldInput} from '../components/FieldInput';
import {PhotoTile, PhotoTiles} from '../components/PhotoTiles';
import {PhoneStackParamList} from '../navigation/types';
import {pickPhotos} from '../photos/pickMedia';
import {colors, spacing} from '../theme';
import {preparePhotosUnderLimit} from '../upload/imagePrep';

type Props = NativeStackScreenProps<PhoneStackParamList, 'Compose'>;

const MAX_PHOTOS = 5;

export function ComposeScreen({navigation}: Props) {
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<PhotoTile[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [picking, setPicking] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const busy = picking || compressing;
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

      const room = MAX_PHOTOS - photos.length;
      const selected = result.photos.slice(0, room);

      setPicking(false);
      setCompressing(true);

      const prepared = await preparePhotosUnderLimit(
        selected.map(photo => photo.uri),
      );

      setPhotos(current => {
        const stillRoom = MAX_PHOTOS - current.length;
        if (stillRoom <= 0) {
          return current;
        }

        const additions = prepared.slice(0, stillRoom).map((photo, index) => ({
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

  function saveOnPhone() {
    setShowErrors(true);
    if (descriptionMissing || photosMissing) {
      return;
    }

    navigation.goBack();
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
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
        <Text style={styles.label}>Photos</Text>
        <Text style={styles.help}>
          {photos.length} of {MAX_PHOTOS}. Each photo is shrunk under 5 MB on
          this phone.
        </Text>
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
      <PrimaryButton label="Save on this phone" onPress={saveOnPhone} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.screen,
    gap: 22,
    paddingBottom: 32,
  },
  photos: {
    gap: 10,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  help: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  compressing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  compressingText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});

