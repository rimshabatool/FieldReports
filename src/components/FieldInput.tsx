import {StyleSheet, Text, TextInput, View} from 'react-native';

import {colors, hitSlop, radii, scale, typography} from '../theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  help?: string;
  error?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'url';
  autoCapitalize?: 'none' | 'sentences';
};

export function FieldInput({
  label,
  value,
  onChangeText,
  placeholder,
  help,
  error,
  multiline,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCapitalize !== 'none'}
        keyboardAppearance="light"
        style={[styles.input, multiline && styles.multiline]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {help ? <Text style={styles.help}>{help}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: scale.s(8),
  },
  label: {
    color: colors.text,
    fontSize: typography.label,
    fontWeight: '600',
  },
  input: {
    minHeight: hitSlop.button,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    color: colors.text,
    fontSize: typography.body,
    paddingHorizontal: scale.s(14),
    paddingVertical: scale.vs(12),
  },
  multiline: {
    minHeight: scale.vs(120),
    textAlignVertical: 'top',
  },
  help: {
    color: colors.muted,
    fontSize: typography.caption,
    lineHeight: scale.vs(18),
  },
  error: {
    color: colors.danger,
    fontSize: typography.meta,
    lineHeight: scale.vs(20),
  },
});
