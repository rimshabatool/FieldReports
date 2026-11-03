import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

export type PhotoTile = {
  id: string;
  source: string;
};

type Props = {
  photos: PhotoTile[];
  onRemove?: (id: string) => void;
};

export function PhotoTiles({ photos, onRemove }: Props) {
  return (
    <View style={styles.grid}>
      {photos.map((photo, index) => (
        <View key={photo.id} style={styles.tile}>
          <Text style={styles.index}>Photo {index + 1}</Text>
          <Text style={styles.source}>{photo.source}</Text>
          {onRemove ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove photo ${index + 1}`}
              hitSlop={8}
              onPress={() => onRemove(photo.id)}
              style={styles.removeHit}>
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    width: '47%',
    aspectRatio: 1.05,
    borderRadius: 20,
    backgroundColor: colors.tile,
    padding: 12,
    justifyContent: 'space-between',
  },
  index: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  source: {
    color: colors.muted,
    fontSize: 14,
  },
  removeHit: {
    minHeight: 32,
    justifyContent: 'center',
  },
  remove: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
});
