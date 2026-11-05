import {useCallback, useEffect, useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {PrimaryButton, TextButton} from '../components/Buttons';
import {ReportCard} from '../components/ReportCard';
import {ScreenHeader} from '../components/ScreenHeader';
import {PhoneStackParamList} from '../navigation/types';
import {colors, scale, spacing, typography} from '../theme';
import {
  clearLocalQueue,
  ensureHydrated,
  getReports,
  subscribe,
} from '../upload/queue';
import {QueuedReport, photoCountLabel, statusLabel} from '../upload/types';

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
          reports.length === 0 && styles.contentEmpty,
          {paddingTop: insets.top + scale.vs(12)},
        ]}
        keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Your Reports" />
        {reports.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No reports yet</Text>
            <Text style={styles.emptyBody}>
              New ones stay here until they reach the server.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {reports.map(report => (
              <ReportCard
                key={report.clientId}
                description={report.description}
                meta={photoCountLabel(report.photos.length)}
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
        {reports.length > 0 ? (
          <TextButton
            label={clearing ? 'Clearing…' : 'Clear this phone'}
            disabled={clearing}
            onPress={confirmClear}
          />
        ) : null}
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
    paddingBottom: scale.vs(16),
    gap: scale.s(20),
  },
  contentEmpty: {
    flexGrow: 1,
  },
  list: {
    gap: scale.s(12),
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    gap: scale.s(8),
  },
  emptyTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  emptyBody: {
    color: colors.muted,
    fontSize: typography.meta,
    lineHeight: scale.vs(17),
    textAlign: 'center',
    maxWidth: scale.s(240),
  },
  footer: {
    paddingHorizontal: spacing.screen,
    paddingTop: scale.vs(4),
    paddingBottom: scale.vs(6),
    gap: scale.s(0),
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
});
