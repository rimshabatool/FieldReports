import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, TextButton } from '../components/Buttons';
import { ReportCard } from '../components/ReportCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { StatusTone } from '../components/StatusPill';
import { PhoneStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<PhoneStackParamList, 'Outbox'>;

type PhoneReport = {
  id: string;
  description: string;
  photoCount: number;
  tone: StatusTone;
  label: string;
  note?: string;
};

const SAMPLE_REPORTS: PhoneReport[] = [
  {
    id: 'stair-crack',
    description: 'Crack along the north stair',
    photoCount: 3,
    tone: 'saved',
    label: 'Saved on this phone',
  },
  {
    id: 'basement-water',
    description: 'Water at the basement door',
    photoCount: 1,
    tone: 'waiting',
    label: 'Waiting for signal',
  },
  {
    id: 'loose-railing',
    description: 'Loose railing on the third floor',
    photoCount: 5,
    tone: 'uploading',
    label: 'Uploading',
    note: 'Sending photo 2 of 5',
  },
  {
    id: 'exit-sign',
    description: 'Blocked exit sign',
    photoCount: 2,
    tone: 'failed',
    label: 'Failed',
    note: 'Will not retry.',
  },
];

export function OutboxScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [reports, setReports] = useState(SAMPLE_REPORTS);

  function confirmClear() {
    Alert.alert(
      'Clear this phone',
      'This removes reports stored on this phone. Reports already on the server stay there.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear this phone',
          style: 'destructive',
          onPress: () => setReports([]),
        },
      ],
    );
  }

  return (
    <View style={styles.fill}>
      <ScrollView
        style={styles.fill}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12 },
        ]}
        keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Your Reports" />
        {reports.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nothing waiting to send.</Text>
            <Text style={styles.emptyBody}>
              A new report stays here until it reaches the server.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {reports.map(report => (
              <ReportCard
                key={report.id}
                description={report.description}
                meta={`${report.photoCount} ${
                  report.photoCount === 1 ? 'photo' : 'photos'
                }`}
                statusLabel={report.label}
                statusTone={report.tone}
                note={report.note}
              />
            ))}
          </View>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label="New report"
          onPress={() => navigation.navigate('Compose')}
        />
        <TextButton label="Clear this phone" onPress={confirmClear} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 16,
    gap: 20,
  },
  list: {
    gap: 12,
  },
  empty: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 18,
    gap: 6,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  emptyBody: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
  },
  footer: {
    paddingHorizontal: spacing.screen,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 4,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
});
