interface _MarkdownMetaData {
  path: string;
  date: string;
  title: string;
  tag: string[];
  thumbnailImage: string;
  ogpImage: string;
}

export type MarkdownMetaData = Readonly<_MarkdownMetaData>;

interface ThumbnailImage {
  readonly url: string;
  readonly size: {
    readonly pc: {
      readonly width: number;
      readonly height: number;
    };
    readonly sp: {
      readonly width: number;
      readonly height: number;
    };
  };
}

interface _ArticleMetaData {
  path: string;
  date: string;
  title: string;
  tag: string[];
  thumbnailImage: ThumbnailImage;
  ogpImage: string;
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
