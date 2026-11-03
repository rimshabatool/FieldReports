import { ScrollView, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PhotoTiles } from '../components/PhotoTiles';
import { ServerStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<ServerStackParamList, 'ServerReport'>;

export function ServerReportScreen({ route }: Props) {
  const { description, photoCount, receivedAt } = route.params;
  const photos = Array.from({ length: photoCount }, (_, index) => ({
    id: `server-photo-${index + 1}`,
    source: 'On the server',
  }));

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Received Report</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.meta}>{receivedAt}</Text>
      <PhotoTiles photos={photos} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.screen,
    gap: 14,
    paddingBottom: 32,
  },
  kicker: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  description: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
  meta: {
    color: colors.muted,
    fontSize: 15,
  },
});
