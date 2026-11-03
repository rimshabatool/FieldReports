import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '../theme';

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
    gap: 8,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  help: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
});
