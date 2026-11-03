import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

type Props = {
  title: string;
  subtitle?: string;
};

export function ScreenHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
});
