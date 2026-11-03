import { ScrollView, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReportCard } from '../components/ReportCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { ServerStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<ServerStackParamList, 'ServerReports'>;

const SERVER_REPORTS = [
  {
    id: 'roof-leak',
    description: 'Roof leak above room 12',
    photoCount: 2,
    receivedAt: '30 Oct, 2:14 PM',
  },
  {
    id: 'east-window',
    description: 'Broken window on the east wall',
    photoCount: 4,
    receivedAt: '30 Oct, 4:02 PM',
  },
  {
    id: 'conduit',
    description: 'Loose conduit in the stairwell',
    photoCount: 1,
    receivedAt: '31 Oct, 9:20 AM',
  },
];

export function ServerReportsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}>
      <ScreenHeader
        title="Received Reports"
        subtitle="Loaded from the server."
      />
      <View style={styles.list}>
        {SERVER_REPORTS.map(report => (
          <ReportCard
            key={report.id}
            description={report.description}
            meta={`${report.photoCount} ${
              report.photoCount === 1 ? 'photo' : 'photos'
            } · ${report.receivedAt}`}
            onPress={() => navigation.navigate('ServerReport', report)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 24,
    gap: 20,
  },
  list: {
    gap: 12,
  },
});
