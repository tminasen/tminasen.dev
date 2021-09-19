import React from 'react';
import styled from 'styled-components';
import media from 'styled-media-query';
import { LinkComponent } from './atoms/LinkComponent';
import { color, fontSize, layer } from '../styles/variable';

type Props = {
  siteTitle: string;
  // TODO: ampで対応する方法思いついたらやめる
  isHiddenMenu: boolean;
  showModal: boolean;
  openModal: () => void;
  closeModal: () => void;
};

const Header = styled.header`
  display: flex;
  position: relative;
  background: ${color.headerBgBlue};
  max-height: 64px;
  align-items: center;
  justify-content: center;
`;
const Heading = styled.h1`
  font-size: ${fontSize.px32};
  font-weight: bold;
  line-height: 1.5;
  ${media.lessThan('small')`
    font-size: ${fontSize.px24};
    margin-left: 12px;
  `}
`;

const MenuButton = styled.button`
  font-size: 0;
  position: absolute;
  width: 48px;
  left: 28px;
  border: none;
  background-color: transparent;
  &::before,
  &::after {
    content: '';
    display: block;
    height: 8px;
  }
  &::before {
    border-top: solid 4px ${color.borderWhite};
  }
  &::after {
    border-top: solid 4px ${color.borderWhite};
    border-bottom: solid 4px ${color.borderWhite};
  }
  &:hover {
    cursor: pointer;
  }
  ${media.lessThan('small')`
    width: 28px;
    left: 0;
    &::before,
    &::after {
      content: '';
      display: block;
      height: 4px;
      width: 24px;
    }
  `}
`;

const MenuDialog = styled.div<{ showModal: boolean }>`
  display: ${({ showModal }) => (showModal ? 'block' : 'none')};
  position: absolute;
  left: 28px;
  top: 8px;
  z-index: ${layer.overlay};
  background-color: ${color.bgWhite};
  min-width: 500px;
  min-height: 80vh;
  border-radius: 4px;
  ${media.lessThan('small')`
    min-width: 360px;
    left: 4px;
  `}
`;
const CloseButton = styled.button`
  font-size: 0;
  border: none;
  background-color: transparent;
  position: relative;
  top: 4px;
  left: 4px;
  width: 40px;
  height: 40px;
  &::before,
  &::after {
    content: '';
    display: block;
    position: absolute;
    width: 28px;
    border-top: solid 2px ${color.textBlack};
  }
  &::before {
    transform: rotateZ(45deg);
  }
  &::after {
    transform: rotateZ(135deg);
  }
  &:hover {
    cursor: pointer;
  }
`;
const LinkItem = styled.li`
  display: flex;
  justify-content: center;
`;
const LinkText = styled.span`
  font-size: ${fontSize.px32};
  font-weight: 700;
  ${media.lessThan('small')`
    font-size: ${fontSize.px24};
  `}
`;

export const HeaderComponent: React.FC<Props> = ({
  siteTitle,
  isHiddenMenu,
  showModal,
  openModal,
  closeModal,
}) => {
  return (
    <Header>
      {isHiddenMenu ? null : (
        <MenuButton onClick={openModal}>メニュー</MenuButton>
      )}
      <Heading>
        <LinkComponent url="/" color="white">
          {siteTitle}
        </LinkComponent>
      </Heading>
      <MenuDialog showModal={showModal}>
        <CloseButton onClick={closeModal}>閉じる</CloseButton>
        <ul>
          <LinkItem>
            <LinkComponent url="/tags" color="black">
              <LinkText>タグ一覧</LinkText>
            </LinkComponent>
          </LinkItem>
        </ul>
      </MenuDialog>
    </Header>
  );
};
