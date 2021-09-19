import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { getArticleMetaData } from '../../src/libraries/articles';
import { PageTemplate } from '../../src/templates/PageTemplate';
import { ArticleMetaData } from '../../types/article';
import { Optional } from '../../types/utility';
import styled from 'styled-components';
import { color, fontSize } from '../../src/styles/variable';
import media from 'styled-media-query';
import { TwitterShareButton } from '../../src/components/atoms/TwitterShareButton';
import { GithubArticleButton } from '../../src/components/atoms/GithubArticleButton';
import { MdTemplate } from '../../src/templates/MdTemplate';
import { LinkComponent } from '../../src/components/atoms/LinkComponent';

export const config = { amp: true };

interface Props {
  id: string;
  articleMetaData: ArticleMetaData[];
}

const Article = styled.article`
  max-width: 980px;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  ${media.lessThan('small')`
    max-width: 372px;
  `}
`;
const TitleWrapper = styled.div`
  background-color: ${color.bgWhite};
  border-radius: 4px;
  padding: 0 16px;
  ${media.lessThan('small')`
    padding: 0 12px;
  `}
`;
const ArticleTitle = styled.h1`
  font-size: ${fontSize.px28};
  font-weight: bolder;
  line-height: 1.5;
  ${media.lessThan('small')`
    font-size: ${fontSize.px24}
  `}
`;
const ArticleDate = styled.time`
  display: block;
  margin-top: 4px;
  font-size: ${fontSize.px14};
  line-height: 1.5;
`;
const TagList = styled.ul`
  display: flex;
  align-items: center;
  margin-top: 4px;
`;
const TagListItem = styled.li`
  border: solid 1px ${color.borderBlack};
  border-radius: 30px;
  font-size: ${fontSize.px14};
  line-height: 1.5;
  padding: 0 4px;
  & + & {
    margin-left: 4px;
  }
`;
const SnsLink = styled.div`
  margin-top: 8px;
`;

const TagLink = ({ tag }: { tag: string }): JSX.Element => {
  return (
    <TagListItem>
      <LinkComponent url={`/tags/${tag}`} color="black">
        {tag}
      </LinkComponent>
    </TagListItem>
  );
};

const articlePage = ({ id, articleMetaData }: Props) => {
  const targetMetaData: Optional<ArticleMetaData> = articleMetaData.filter(
    data => data.path === `/blog/${id}`,
  )[0];
  if (targetMetaData == null) {
    return null;
  }
  return (
    <PageTemplate
      title={targetMetaData.title}
      isEnableViewPort={false}
      isHiddenMenu={true}
      canonicalPath={targetMetaData.path}
      ogType="article"
    >
      <Article>
        <TitleWrapper>
          <ArticleTitle>{targetMetaData.title}</ArticleTitle>
          <TagList>
            {targetMetaData.tag.map(t => (
              <TagLink tag={t} />
            ))}
          </TagList>
          <ArticleDate>{targetMetaData.date}</ArticleDate>
        </TitleWrapper>
        <MdTemplate html={targetMetaData.html} />
        <SnsLink>
          <TwitterShareButton
            title={targetMetaData.title}
            path={targetMetaData.path}
          />
          <GithubArticleButton path={targetMetaData.path} />
        </SnsLink>
      </Article>
    </PageTemplate>
  );
};

export default articlePage;

export const getStaticPaths: GetStaticPaths = async () => {
  const metaData = await getArticleMetaData();
  const paths: string[] = metaData.map(data => data.path);
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id = params?.id;
  if (id == null || Array.isArray(id)) {
    return { props: { id: null } };
  }
  const articleMetaData: ArticleMetaData[] = await getArticleMetaData();
  return { props: { id, articleMetaData } };
};
