import { Link } from "gatsby"
import React from "react"
import styled from 'styled-components';

type Props = {
  siteTitle: string;
}

const Header = styled.header`
  background: rebeccapurple;
  margin-bottom: 1.45rem;
`;
const Heading = styled.h1`
  margin: 0;
`;
const Wrapper = styled.div`
  margin: 0 auto;
  max-width: 960px;
  padding: 1.45rem 1.0875rem;
`;

export const HeaderComponent: React.FC<Props> = ({ siteTitle }) => (
  <Header>
    <Wrapper>
      <Heading>
        <Link
          to="/"
          style={{
            color: `white`,
            textDecoration: `none`,
          }}
        >
          {siteTitle}
        </Link>
      </Heading>
    </Wrapper>
  </Header>
);
