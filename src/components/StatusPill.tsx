import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

export type StatusTone = 'saved' | 'waiting' | 'uploading' | 'failed';

const tones = {
  saved: { background: colors.savedBackground, text: colors.savedText },
  waiting: { background: colors.waitingBackground, text: colors.waitingText },
  uploading: {
    background: colors.uploadingBackground,
    text: colors.uploadingText,
  },
  failed: { background: colors.failedBackground, text: colors.failedText },
};

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
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
});
