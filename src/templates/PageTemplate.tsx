import React, { useState } from 'react';

import { HeaderComponent } from '../components/HeaderComponent';
import { FooterComponent } from '../components/FooterComponent';
import styled from 'styled-components';
import media from 'styled-media-query';
import { color, layer } from '../styles/variable';

interface Props {
  children: JSX.Element | JSX.Element[];
}

const BodyWrapper = styled.div`
  background-color: ${color.bgGray};
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-width: 1064px;
  ${media.lessThan('small')`
    min-width: 345px;
  `}
  position: relative;
`;
const ContentsWrapper = styled.div`
  flex: 1 0 auto;
  display: flex;
  justify-content: space-between;
  margin: 20px 8px 0;
  ${media.lessThan('small')`
    margin: 20px 4px 0;
    justify-content: center;
  `}
`;
const Main = styled.main`
  width: 100%;
`;
const Overlay = styled.div<{ showModal: boolean }>`
  background-color: ${color.bgOverlay};
  position: absolute;
  width: 100%;
  height: 100%;
  display: ${({ showModal }) => (showModal ? 'block' : 'none')};
  z-index: ${layer.backgroundOverlay};
`;

const useModalCondition = () => {
  const [showModal, setShowModal] = useState(false);
  const closeModal = () => setShowModal(false);
  const openModal = () => setShowModal(true);
  return [showModal, closeModal, openModal] as const;
};

export const PageTemplate: React.FC<Props> = ({ children }) => {
  const [showModal, closeModal, openModal] = useModalCondition();
  return (
    <BodyWrapper>
      <HeaderComponent
        siteTitle="水無瀬のプログラミング日記"
        showModal={showModal}
        openModal={openModal}
        closeModal={closeModal}
      />
      <ContentsWrapper>
        <Main>{children}</Main>
      </ContentsWrapper>
      <FooterComponent />
      <Overlay showModal={showModal} />
    </BodyWrapper>
  );
};
