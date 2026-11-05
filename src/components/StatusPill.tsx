import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, scale, typography } from '../theme';

export type StatusTone = 'saved' | 'waiting' | 'uploading' | 'failed';

const tones = {
  saved: {
    background: colors.savedBackground,
    text: colors.savedText,
  },
  waiting: {
    background: colors.waitingBackground,
    text: colors.waitingText,
  },
  uploading: {
    background: colors.uploadingBackground,
    text: colors.uploadingText,
  },
  failed: {
    background: colors.failedBackground,
    text: colors.failedText,
  },
};

export function statusAccent(tone?: StatusTone): string {
  return tone ? tones[tone].text : colors.button;
}

type Props = {
  label: string;
  tone: StatusTone;
};

export function StatusPill({ label, tone }: Props) {
  const palette = tones[tone];

  return (
    <View style={[styles.pill, { backgroundColor: palette.background }]}>
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    paddingHorizontal: scale.s(20),
    paddingVertical: scale.vs(5),
  },
  label: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
});
