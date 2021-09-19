export const color: { [key: string]: string } = {
  textBlack: '#333333',
  textWhite: '#ffffff',
  textQuote: '#8b949e',
  textCodeBlock: '#24292f',
  bgWhite: '#ffffff',
  bgGray: '#f5f5f5',
  bgOverlay: 'rgba(0, 0, 0, 0.2)',
  bgCodeBlock: 'rgba(175, 184, 193, 0.2)',
  headerBgBlue: '#448aff',
  borderWhite: '#ffffff',
  borderBlack: '#000000',
  borderGray: '#b3bfc7',
} as const;
export const fontSize = {
  h1: '2.4rem',
  px14: '1.4rem',
  px16: '1.6rem',
  px20: '2rem',
  px24: '2.4rem',
  px28: '2.8rem',
  px32: '3.2rem',
} as const;
export const size = {
  cardImageWidth: '336px',
  cardMaxHeight: '448px',
};
export const layer = {
  backgroundOverlay: 5,
  overlay: 10,
} as const;
