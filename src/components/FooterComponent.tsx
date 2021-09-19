import React from 'react';
import styled from 'styled-components';

const Footer = styled.footer`
  display: flex;
  align-items: center;
  flex-direction: column;
  background-color: #c8d1d6;
  margin-top: 12px;
`;
const Small = styled.small`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

export const FooterComponent: React.FC = () => (
  <Footer>
    <Small>&copy;{new Date().getFullYear()} tminasen</Small>
    <Small>This site uses Google Analytics.</Small>
  </Footer>
);
