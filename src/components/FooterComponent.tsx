import React from 'react';
import styled from 'styled-components';

const Footer = styled.footer`
  display: flex;
  align-items: center;
  flex-direction: column;
  background-color: #c8d1d6;
`;
const Small = styled.small`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

export const FooterComponent: React.FC = () => (
  <Footer>
    <Small>&copy; Tetsuya Minase</Small>
    <Small>
      &copy;{new Date().getFullYear()}, Built with
      <a href="https://www.gatsbyjs.org">Gatsby</a>
    </Small>
  </Footer>
);
