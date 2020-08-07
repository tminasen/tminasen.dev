import { Link } from 'gatsby';
import React from 'react';
import styled from 'styled-components';

type Props = {
  siteTitle: string;
};

const Header = styled.header`
  background: #448aff;
  margin-bottom: 1.45rem;
`;
const Heading = styled.h1`
  margin: 0;
  font-size: 3rem;
`;
const Wrapper = styled.div`
  margin: 0 auto;
  max-width: 96rem;
  padding: 1.5rem 1.1rem;
`;
const linkStyle: React.CSSProperties = {
  color: '#ffffff',
  textDecoration: 'none',
};

export const HeaderComponent: React.FC<Props> = ({ siteTitle }) => (
  <Header>
    <Wrapper>
      <Heading>
        <Link to="/" style={linkStyle}>
          {siteTitle}
        </Link>
      </Heading>
    </Wrapper>
  </Header>
);
