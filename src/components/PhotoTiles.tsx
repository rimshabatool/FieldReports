import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

export type PhotoTile = {
  id: string;
  source: string;
  uri?: string;
};

type Props = {
  photos: PhotoTile[];
  onRemove?: (id: string) => void;
};

export function PhotoTiles({ photos, onRemove }: Props) {
  return (
    <View style={styles.grid}>
      {photos.map((photo, index) => {
        const hasImage = Boolean(photo.uri);
        return (
          <View key={photo.id} style={styles.tile}>
            {photo.uri ? (
              <Image source={{ uri: photo.uri }} style={styles.image} />
            ) : null}
            <View
              style={[styles.content, hasImage ? styles.contentOnImage : null]}
            >
              <Text
                style={[styles.index, hasImage ? styles.onImageText : null]}
              >
                Photo {index + 1}
              </Text>
              <Text
                style={[styles.source, hasImage ? styles.onImageText : null]}
              >
                {photo.source}
              </Text>
              {onRemove ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove photo ${index + 1}`}
                  hitSlop={8}
                  onPress={() => onRemove(photo.id)}
                  style={styles.removeHit}
                >
                  <Text
                    style={[
                      styles.remove,
                      hasImage ? styles.onImageText : null,
                    ]}
                  >
                    Remove
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        );
      })}
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
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  contentOnImage: {
    backgroundColor: 'rgba(30, 27, 46, 0.28)',
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
  onImageText: {
    color: colors.card,
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
