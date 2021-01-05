interface _ArticleMetaData {
  path: string;
  date: string;
  title: string;
  tag: string[];
  thumbnailImage: string;
  html: string;
  description: string;
}
export type ArticleMetaData = Readonly<_ArticleMetaData>;

export interface TagCount {
  [key: string]: number;
}
export interface _Tag {
  name: string;
  articleCount: number;
  url: string;
}
export type Tag = Readonly<_Tag>;
