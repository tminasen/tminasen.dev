import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

import { HeaderComponent } from '../components/HeaderComponent';
import { FooterComponent } from '../components/FooterComponent';
import styled from 'styled-components';
import media from 'styled-media-query';
import { SubColumnComponent } from '../components/SubColumnComponent';
import SEO from '../components/seo';
import { SiteTitleQueryQuery } from '../../types/graphql-types';
import { Maybe } from '../../types/utility';

type Props = {
  title: Maybe<string>;
  children: JSX.Element | JSX.Element[];
};

const BodyWrapper = styled.div`
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;
const ContentsWrapper = styled.div`
  flex: 1 0 auto;
  display: flex;
  justify-content: space-between;
  margin: 0 3rem;
  ${media.lessThan('small')`
    margin: 0 1rem;
  `}
`;
const Main = styled.main`
  width: 80%;
  ${media.lessThan('small')`
    width: 100%;
  `}
`;

export const PageTemplate: React.FC<Props> = ({ title, children }) => {
  const data: SiteTitleQueryQuery = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);
  return (
    <BodyWrapper>
      <SEO title={title} meta={undefined} description={undefined} />
      <HeaderComponent siteTitle={data.site?.siteMetadata?.title || ''} />
      <ContentsWrapper>
        <Main>{children}</Main>
        <SubColumnComponent />
      </ContentsWrapper>
      <FooterComponent />
    </BodyWrapper>
  );
};
