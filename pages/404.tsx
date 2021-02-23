import React from 'react';
import styled from 'styled-components';
import media from 'styled-media-query';
import { PageTemplate } from '../src/templates/PageTemplate';

const Heading = styled.h1`
  font-size: 2.4rem;
  font-weight: bold;
  ${media.lessThan('small')`
    font-size: 2rem;
  `}
`;
const Message = styled.p`
  font-size: 1.6rem;
  margin-top: 8px;
`;


const NotFoundPage = () => (
  <PageTemplate title="Not found" metaData={[]} isEnableViewPort={true} canonicalPath={undefined}>
    <React.Fragment>
      <Heading>NOT FOUND</Heading>
      <Message>そんなページないです🙈</Message>
    </React.Fragment>
  </PageTemplate>
);

export default NotFoundPage;
