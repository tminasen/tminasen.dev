import { FC, ReactNode, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { PageTemplate } from '../templates/PageTemplate';
import { HeadComponent } from './HeadComponent';
import { XShareButton } from './atoms/XShareButton';
import { GithubArticleButton } from './atoms/GithubArticleButton';
import { LinkComponent } from './atoms/LinkComponent';
import { metaData } from '../constants/metaData';
import { buildBlogPostingJsonLd, serializeJsonLd } from '../libraries/jsonLd';
import { setupTocHighlight } from '../libraries/tocHighlight';
import type { AdjacentArticles } from '../libraries/adjacentArticles';

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
  adjacent?: AdjacentArticles;
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

const AdjacentArticleCard = ({
  href,
  label,
  title,
  className,
}: {
  href: string;
  label: string;
  title: string;
  className: string;
}) => (
  <Link
    href={href}
    className={`flex flex-col gap-1 rounded-lg border border-solid border-(--color-border) px-4 py-3 no-underline ${className}`}
  >
    <span className="text-xs leading-[1.5] text-(--color-text-muted)">
      {label}
    </span>
    <span className="text-[15px] font-medium leading-[1.5] text-(--color-text-link)">
      {title}
    </span>
  </Link>
);

export const ArticleLayout: FC<Props> = ({ meta, adjacent, children }) => {
  useEffect(() => setupTocHighlight(document), [meta.path]);

  const hasAdjacent = adjacent !== undefined && (adjacent.prev || adjacent.next);

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
            {hasAdjacent && (
              <nav
                aria-label="前後の記事"
                className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                {adjacent.prev && (
                  <AdjacentArticleCard
                    href={adjacent.prev.path}
                    label="← 前の記事"
                    title={adjacent.prev.title}
                    className="sm:col-start-1"
                  />
                )}
                {adjacent.next && (
                  <AdjacentArticleCard
                    href={adjacent.next.path}
                    label="次の記事 →"
                    title={adjacent.next.title}
                    className="sm:col-start-2"
                  />
                )}
              </nav>
            )}
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
