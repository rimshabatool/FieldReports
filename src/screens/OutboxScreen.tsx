import {useCallback, useEffect, useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {PrimaryButton, TextButton} from '../components/Buttons';
import {ReportCard} from '../components/ReportCard';
import {ScreenHeader} from '../components/ScreenHeader';
import {PhoneStackParamList} from '../navigation/types';
import {colors, spacing} from '../theme';
import {
  clearLocalQueue,
  ensureHydrated,
  getReports,
  subscribe,
} from '../upload/queue';
import {QueuedReport, statusLabel} from '../upload/types';

type Props = NativeStackScreenProps<PhoneStackParamList, 'Outbox'>;

export function OutboxScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const [reports, setReports] = useState<QueuedReport[]>(getReports());
  const [clearing, setClearing] = useState(false);

  useEffect(() => subscribe(setReports), []);

  useFocusEffect(
    useCallback(() => {
      ensureHydrated().catch(() => {});
    }, []),
  );

  function confirmClear() {
    if (clearing || reports.length === 0) {
      return;
    }

    Alert.alert(
      'Clear this phone',
      'Stops any upload in progress and deletes reports and photos stored on this phone only. Reports already on the server stay there.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear this phone',
          style: 'destructive',
          onPress: () => {
            setClearing(true);
            clearLocalQueue()
              .catch(() => {
                Alert.alert(
                  'Could not clear',
                  'Something went wrong while clearing this phone.',
                );
              })
              .finally(() => {
                setClearing(false);
              });
          },
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
          {paddingTop: insets.top + 12},
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
                key={report.clientId}
                description={report.description}
                meta={`${report.photos.length} ${
                  report.photos.length === 1 ? 'photo' : 'photos'
                }`}
                statusLabel={statusLabel(report.status)}
                statusTone={report.status}
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
        <TextButton
          label={clearing ? 'Clearing…' : 'Clear this phone'}
          disabled={clearing || reports.length === 0}
          onPress={confirmClear}
        />
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
