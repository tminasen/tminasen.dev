import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

import { HeaderComponent } from '../components/HeaderComponent';
import { FooterComponent } from '../components/FooterComponents';
import styled from 'styled-components';

type Props = {
  children: JSX.Element;
};

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;
const MainWrapper = styled.div`
  flex: 1 0 auto;
  margin: 0 auto;
  max-width: 9.6rem;
  padding: 0 1.1rem 1.5rem;
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
      <MainWrapper
        style={{
          margin: `0 auto`,
          maxWidth: 960,
          padding: `0 1.0875rem 1.45rem`,
        }}
      >
        <main>{children}</main>
      </MainWrapper>
      <FooterComponent />
    </BodyWrapper>
  );
};
