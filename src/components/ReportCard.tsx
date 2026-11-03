import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';
import { StatusPill, StatusTone } from './StatusPill';

type Props = {
  description: string;
  meta: string;
  note?: string;
  statusLabel?: string;
  statusTone?: StatusTone;
  onPress?: () => void;
};

export function ReportCard({
  description,
  meta,
  note,
  statusLabel,
  statusTone,
  onPress,
}: Props) {
  const body = (
    <View style={styles.card}>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.meta}>{meta}</Text>
      {statusLabel && statusTone ? (
        <StatusPill label={statusLabel} tone={statusTone} />
      ) : null}
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </View>
  );

  if (!onPress) {
    return body;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 18,
    gap: 10,
    shadowColor: '#6C5CE7',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  description: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  meta: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  note: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.7,
  },
});
