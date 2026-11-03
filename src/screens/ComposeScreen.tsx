import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { FieldInput } from '../components/FieldInput';
import { PhotoTile, PhotoTiles } from '../components/PhotoTiles';
import { PhoneStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<PhoneStackParamList, 'Compose'>;

const MAX_PHOTOS = 5;

export function ComposeScreen({ navigation }: Props) {
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<PhotoTile[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const atLimit = photos.length >= MAX_PHOTOS;
  const descriptionMissing = description.trim().length === 0;
  const photosMissing = photos.length === 0;

  function addPhoto(source: 'Camera' | 'Gallery') {
    if (atLimit) {
      return;
    }

    setPhotos(current => [
      ...current,
      { id: `${source}-${current.length + 1}`, source },
    ]);
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
        <Text style={styles.label}>Photos</Text>
        <Text style={styles.help}>
          {photos.length} of {MAX_PHOTOS}. Use the camera or the gallery.
        </Text>
        <View style={styles.row}>
          <View style={styles.action}>
            <SecondaryButton
              label="Camera"
              disabled={atLimit}
              onPress={() => addPhoto('Camera')}
            />
          </View>
          <View style={styles.action}>
            <SecondaryButton
              label="Gallery"
              disabled={atLimit}
              onPress={() => addPhoto('Gallery')}
            />
          </View>
        </View>
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
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  action: {
    flex: 1,
  },
});
