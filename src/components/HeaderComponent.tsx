import { Link } from 'gatsby';
import React from 'react';
import styled from 'styled-components';
import { fontColor } from '../styles/variable';

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
  max-width: 96rem;
  padding: 1.5rem 1.1rem;
`;
const LinkStyle: React.CSSProperties = {
  color: fontColor.white,
  textDecoration: 'none',
};

export const HeaderComponent: React.FC<Props> = ({ siteTitle }) => (
  <Header>
    <Wrapper>
      <Heading>
        <Link to="/" style={LinkStyle}>
          {siteTitle}
        </Link>
      </Heading>
    </Wrapper>
  </Header>
);
