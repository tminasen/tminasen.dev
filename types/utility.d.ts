import { ImageSharpFluid } from './graphql-types';

export type Maybe<T> = T | null | undefined;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepReadonly<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};
export type ImageValue = Pick<
  ImageSharpFluid,
  'src' | 'sizes' | 'srcSet' | 'aspectRatio'
>;
