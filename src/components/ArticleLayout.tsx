import { FC, ReactNode } from 'react';
import Head from 'next/head';
import { PageTemplate } from '../templates/PageTemplate';
import { HeadComponent } from './HeadComponent';
import { XShareButton } from './atoms/XShareButton';
import { GithubArticleButton } from './atoms/GithubArticleButton';
import { LinkComponent } from './atoms/LinkComponent';
import { metaData } from '../constants/metaData';
import { buildBlogPostingJsonLd, serializeJsonLd } from '../libraries/jsonLd';

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
      className="flex *:flex *:min-h-8 *:items-center *:px-3 *:py-1 border border-solid border-(--color-border) rounded-full bg-(--color-bg-card) text-sm leading-[1.5]"
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
      <Head>
        <link
          rel="alternate"
          type="text/markdown"
          href={`${metaData.domain}${meta.path}.md`}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(buildBlogPostingJsonLd(meta)),
          }}
        />
      </Head>
      <PageTemplate>
        <article className="max-w-93 sm:max-w-[760px] flex flex-col mx-auto">
          <div className="bg-(--color-bg-card) rounded-xl px-4 py-5 sm:px-10 sm:py-8">
            <h1 className="text-2xl sm:text-3xl font-bold leading-[1.5] text-(--color-text-base)">
              {meta.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3">
              <time
                className="text-sm leading-[1.5] text-(--color-text-muted)"
                dateTime={meta.date}
              >
                {meta.date}
              </time>
              <ul className="flex flex-wrap items-center gap-2">
                {meta.tag.map(t => (
                  <TagLink key={t} tag={t} />
                ))}
              </ul>
            </div>
            <div className="prose prose-slate prose-article dark:prose-invert max-w-none mt-6 text-base">
              {children}
            </div>
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
