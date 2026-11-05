import {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {ReportCard} from '../components/ReportCard';
import {ScreenHeader} from '../components/ScreenHeader';
import {ServerStackParamList} from '../navigation/types';
import {colors, radii, scale, spacing, typography} from '../theme';
import {
  fetchServerReports,
  formatReceivedAt,
  ServerReport,
} from '../upload/api';
import {photoCountLabel} from '../upload/types';

type Props = NativeStackScreenProps<ServerStackParamList, 'ServerReports'>;

export function ServerReportsScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const [reports, setReports] = useState<ServerReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setReports(await fetchServerReports());
      setError(null);
    } catch (loadError) {
      setReports([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Could not reach the server.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => {});
    }, [load]),
  );

  return (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={[
        styles.content,
        {paddingTop: insets.top + scale.vs(12)},
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            load(true).catch(() => {});
          }}
          tintColor={colors.button}
        />
      }>
      <ScreenHeader
        title="Received Reports"
        subtitle="Loaded from the server."
      />

      {loading && !refreshing ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={colors.button} />
          <Text style={styles.muted}>Loading from the server…</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <View style={styles.centerBox}>
          <Text style={styles.emptyTitle}>Server not reachable</Text>
          <Text style={styles.muted}>{error}</Text>
          <Text style={styles.muted}>
            Pull to refresh. This screen never shows reports that are only on
            this phone.
          </Text>
        </View>
      ) : null}

      {!loading && !error && reports.length === 0 ? (
        <View style={styles.centerBox}>
          <Text style={styles.emptyTitle}>Nothing on the server yet.</Text>
          <Text style={styles.muted}>
            When a report finishes uploading, it shows up here.
          </Text>
        </View>
      ) : null}

      {!loading && !error && reports.length > 0 ? (
        <View style={styles.list}>
          {reports.map(report => (
            <ReportCard
              key={report.clientId}
              description={report.description}
              meta={`${photoCountLabel(report.photoCount)} · ${formatReceivedAt(
                report.receivedAt,
              )}`}
              onPress={() =>
                navigation.navigate('ServerReport', {
                  clientId: report.clientId,
                  description: report.description,
                  photoCount: report.photoCount,
                  receivedAt: report.receivedAt,
                  photos: report.photos ?? [],
                })
              }
            />
          ))}
        </View>
      ) : null}
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
    paddingBottom: scale.vs(24),
    gap: scale.s(20),
  },
  list: {
    gap: scale.s(12),
  },
  centerBox: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: spacing.card,
    gap: scale.s(6),
  },
  emptyTitle: {
    color: colors.text,
    fontSize: typography.button,
    fontWeight: '600',
  },
  muted: {
    color: colors.muted,
    fontSize: typography.label,
    lineHeight: scale.vs(19),
  },
});
