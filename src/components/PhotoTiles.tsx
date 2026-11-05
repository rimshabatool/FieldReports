import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, hitSlop, radii, scale, typography } from '../theme';

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
  const insets = useSafeAreaInsets();
  const [fullUri, setFullUri] = useState<string | null>(null);

  return (
    <>
      <View style={styles.grid}>
        {photos.map((photo, index) => {
          const hasImage = Boolean(photo.uri);
          return (
            <View key={photo.id} style={styles.tile}>
              {photo.uri ? (
                <Pressable
                  accessibilityRole="imagebutton"
                  accessibilityLabel={`View photo ${index + 1} full screen`}
                  onPress={() => setFullUri(photo.uri ?? null)}
                  style={StyleSheet.absoluteFill}
                >
                  <Image source={{ uri: photo.uri }} style={styles.image} />
                </Pressable>
              ) : null}
              <View
                style={[
                  styles.content,
                  hasImage ? styles.contentOnImage : null,
                ]}
                pointerEvents="box-none"
              >
                <Text
                  style={[styles.index, hasImage ? styles.onImageText : null]}
                >
                  Photo {index + 1}
                </Text>
                {!hasImage ? (
                  <Text style={styles.source}>{photo.source}</Text>
                ) : null}
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

      <Modal
        visible={fullUri != null}
        transparent
        animationType="fade"
        onRequestClose={() => setFullUri(null)}
      >
        <View style={styles.fullScreen}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close full screen photo"
            onPress={() => setFullUri(null)}
            style={[styles.closeHit, { top: insets.top + scale.vs(8) }]}
          >
            <Text style={styles.closeLabel}>Close</Text>
          </Pressable>
          {fullUri ? (
            <Image
              source={{ uri: fullUri }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale.s(10),
    alignItems: 'flex-start',
  },
  tile: {
    width: '47%',
    aspectRatio: 1.05,
    alignSelf: 'flex-start',
    borderRadius: radii.lg,
    backgroundColor: colors.tile,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    ...StyleSheet.absoluteFill,
    padding: scale.s(12),
    justifyContent: 'space-between',
  },
  contentOnImage: {
    backgroundColor: 'rgba(30, 27, 46, 0.2)',
  },
  index: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
  source: {
    color: colors.muted,
    fontSize: typography.meta,
  },
  onImageText: {
    color: colors.card,
  },
  removeHit: {
    minHeight: hitSlop.remove,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  remove: {
    color: colors.danger,
    fontSize: typography.meta,
    fontWeight: '600',
  },
  fullScreen: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  closeHit: {
    position: 'absolute',
    right: scale.s(16),
    zIndex: 2,
    minHeight: hitSlop.close,
    paddingHorizontal: scale.s(14),
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  closeLabel: {
    color: '#FFFFFF',
    fontSize: typography.body,
    fontWeight: '600',
  },
});
