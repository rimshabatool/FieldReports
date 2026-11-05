import {ScrollView, StyleSheet, Text} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {PhotoTiles} from '../components/PhotoTiles';
import {ServerStackParamList} from '../navigation/types';
import {colors, scale, spacing, typography} from '../theme';
import {formatReceivedAt} from '../upload/api';

type Props = NativeStackScreenProps<ServerStackParamList, 'ServerReport'>;

export function ServerReportScreen({route}: Props) {
  const {description, receivedAt, photos} = route.params;
  const tiles = (photos ?? []).map((photo, index) => ({
    id: photo.filename || `server-photo-${index + 1}`,
    source: 'On the server',
    uri: photo.url,
  }));

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Received Report</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.meta}>{formatReceivedAt(receivedAt)}</Text>
      {tiles.length > 0 ? <PhotoTiles photos={tiles} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.screen,
    gap: scale.s(14),
    paddingBottom: scale.vs(32),
  },
  kicker: {
    color: colors.muted,
    fontSize: typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  description: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
    lineHeight: scale.vs(30),
  },
  meta: {
    color: colors.muted,
    fontSize: typography.label,
  },
});
