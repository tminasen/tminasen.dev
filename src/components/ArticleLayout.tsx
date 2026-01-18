import { FC, ReactNode } from 'react';
import { PageTemplate } from '../templates/PageTemplate';
import { HeadComponent } from './HeadComponent';
import { XShareButton } from './atoms/XShareButton';
import { GithubArticleButton } from './atoms/GithubArticleButton';
import { LinkComponent } from './atoms/LinkComponent';

export interface ArticleMeta {
  path: string;
  date: string;
  title: string;
  tag: string[];
  ogpImage: string;
  thumbnailImage: string;
  description?: string;
}

interface Props {
  meta: ArticleMeta;
  children: ReactNode;
}

const TagLink = ({ tag }: { tag: string }) => {
  return (
    <li
      key={tag}
      className="border border-solid border-black rounded-4xl text-base leading-[1.5] px-2"
    >
      <LinkComponent url={`/tags/${tag}`} color="black">
        {tag}
      </LinkComponent>
    </li>
  );
};

export const ArticleLayout: FC<Props> = ({ meta, children }) => {
  return (
    <>
      <HeadComponent
        title={meta.title}
        description={meta.description}
        ogpImage={meta.ogpImage}
        canonicalPath={meta.path}
        ogType="article"
        additionalMetaData={undefined}
      />
      <PageTemplate>
        <article className="max-w-93 sm:max-w-5xl flex flex-col mx-auto">
          <div className="bg-white rounded-sm px-3 sm:px-4 py-1">
            <h1 className="text-2xl sm:text-3xl font-bold leading-[1.5] text-(--color-text-base)">
              {meta.title}
            </h1>
            <ul className="flex items-center mt-2 space-x-1">
              {meta.tag.map((t) => (
                <TagLink key={t} tag={t} />
              ))}
            </ul>
            <time className="block mt-1 text-base leading-[1.5]">
              {meta.date}
            </time>
          </div>
          <div className="prose prose-slate max-w-none bg-white mt-5 sm:mt-8 text-base rounded-sm py-2 px-3 sm:px-4 prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-img:my-2 prose-figure:my-2 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-base prose-ul:my-2 prose-ol:my-2 prose-li:my-0">
            {children}
          </div>
          <div className="flex mt-2 content-center items-center gap-x-2">
            <XShareButton title={meta.title} path={meta.path} />
            <GithubArticleButton path={meta.path} />
          </div>
        </article>
      </PageTemplate>
    </>
  );
};

export default ArticleLayout;
