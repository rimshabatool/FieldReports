import { ms, s, vs } from 'react-native-size-matters';

export const colors = {
  background: '#F1ECF7',
  card: '#FFFFFF',
  text: '#1E1B2E',
  muted: '#8A849E',
  line: '#E6DFEF',
  button: '#9B87D4',
  buttonText: '#FFFFFF',
  danger: '#C43B64',
  tile: '#EFE8F6',
  savedBackground: '#EDE8F5',
  savedText: '#7A68B8',
  waitingBackground: '#FFF3D6',
  waitingText: '#8A5A00',
  uploadingBackground: '#E4F0FF',
  uploadingText: '#1D4E89',
  failedBackground: '#FDE8EE',
  failedText: '#A12648',
};

export const scale = {
  s,
  vs,
  ms,
};

export const spacing = {
  screen: s(16),
  card: s(12),
  sm: s(6),
  md: s(8),
  lg: s(14),
  xl: s(18),
};

export const typography = {
  hero: ms(26),
  title: ms(18),
  cardTitle: ms(14),
  body: ms(13),
  label: ms(13),
  meta: ms(12),
  caption: ms(11),
  button: ms(14),
};

export const radii = {
  sm: s(10),
  md: s(12),
  lg: s(14),
  xl: s(16),
  pill: 999,
};

export const hitSlop = {
  button: vs(40),
  text: vs(34),
  remove: vs(26),
  close: vs(36),
};
