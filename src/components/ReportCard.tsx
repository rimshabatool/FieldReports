import {Pressable, StyleSheet, Text, View} from 'react-native';

import {colors, radii, scale, spacing, typography} from '../theme';
import {StatusPill, StatusTone, statusAccent} from './StatusPill';

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
  const accent = statusAccent(statusTone);
  const body = (
    <View style={[styles.card, {borderLeftColor: accent}]}>
      <Text style={styles.description} numberOfLines={3}>
        {description}
      </Text>
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
      android_ripple={{color: 'transparent'}}
      onPress={onPress}
      style={({pressed}) => pressed && styles.pressed}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderLeftWidth: scale.s(4),
    paddingVertical: spacing.card,
    paddingRight: spacing.card,
    paddingLeft: scale.s(12),
    gap: scale.s(6),
    shadowColor: '#1E1B2E',
    shadowOpacity: 0.06,
    shadowRadius: scale.s(8),
    shadowOffset: {width: 0, height: scale.vs(3)},
    elevation: 2,
  },
  description: {
    color: colors.text,
    fontSize: typography.cardTitle,
    fontWeight: '700',
    lineHeight: scale.vs(18),
  },
  meta: {
    color: colors.muted,
    fontSize: typography.meta,
    lineHeight: scale.vs(16),
  },
  note: {
    color: colors.muted,
    fontSize: typography.meta,
    lineHeight: scale.vs(16),
  },
  pressed: {
    opacity: 0.7,
  },
});
