import {StyleSheet, Text, View} from 'react-native';

import {colors, scale, typography} from '../theme';

type Props = {
  title: string;
  subtitle?: string;
};

export function ScreenHeader({title, subtitle}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: scale.s(4),
  },
  title: {
    color: colors.text,
    fontSize: typography.hero,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: scale.vs(18),
    letterSpacing: 0.1,
  },
});
