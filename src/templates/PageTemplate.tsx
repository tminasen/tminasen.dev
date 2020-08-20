import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

import { HeaderComponent } from '../components/HeaderComponent';
import { FooterComponent } from '../components/FooterComponent';
import styled from 'styled-components';
import { SubColumnComponent } from '../components/SubColumnComponent';

type Props = {
  children: JSX.Element;
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
`;
const Main = styled.main`
  width: 70%;
`;

export const PageTemplate: React.FC<Props> = ({ children }) => {
  const data = useStaticQuery(graphql`
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
      <HeaderComponent siteTitle={data.site.siteMetadata.title} />
      <ContentsWrapper>
        <Main>{children}</Main>
        <SubColumnComponent />
      </ContentsWrapper>
      <FooterComponent />
    </BodyWrapper>
  );
};
