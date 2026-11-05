import {Pressable, StyleSheet, Text} from 'react-native';

import {colors, hitSlop, radii, scale, typography} from '../theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

const NO_RIPPLE = {color: 'transparent'} as const;

export function PrimaryButton({label, onPress, disabled}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{disabled: !!disabled}}
      disabled={disabled}
      android_ripple={NO_RIPPLE}
      onPress={onPress}
      style={({pressed}) => [
        styles.primary,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <Text style={styles.primaryLabel}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({label, onPress, disabled}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{disabled: !!disabled}}
      disabled={disabled}
      android_ripple={NO_RIPPLE}
      onPress={onPress}
      style={({pressed}) => [
        styles.secondary,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <Text style={[styles.secondaryLabel, disabled && styles.disabledLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function TextButton({label, onPress, disabled}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{disabled: !!disabled}}
      disabled={disabled}
      android_ripple={NO_RIPPLE}
      onPress={onPress}
      style={({pressed}) => [
        styles.textHit,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <Text style={[styles.textLabel, disabled && styles.disabledLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    minHeight: hitSlop.button,
    borderRadius: radii.md,
    backgroundColor: colors.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale.s(14),
  },
  primaryLabel: {
    color: colors.buttonText,
    fontSize: typography.button,
    fontWeight: '600',
  },
  secondary: {
    minHeight: hitSlop.button,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale.s(10),
  },
  secondaryLabel: {
    color: colors.text,
    fontSize: typography.button,
    fontWeight: '600',
  },
  textHit: {
    minHeight: hitSlop.text,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale.s(8),
  },
  textLabel: {
    color: colors.danger,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
  disabledLabel: {
    color: colors.muted,
  },
});
