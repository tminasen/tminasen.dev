import { FC } from 'react';
import { LinkComponent } from './atoms/LinkComponent';

type Props = {
  siteTitle: string;
  showModal: boolean;
  openModal: () => void;
  closeModal: () => void;
};

export const HeaderComponent: FC<Props> = ({
  siteTitle,
  showModal,
  openModal,
  closeModal,
}) => {
  return (
    <header className="flex relative bg-(--color-header-bg-blue) max-h-[64px] justify-center items-center">
      <button
        className="menu-button absolute w-7 sm:w-9 left-1 sm:left-7 no-underline bg-transparent"
        onClick={openModal}
      >
        メニュー
      </button>
      <h1 className="text-2xl sm:text-4xl font-bold leading-[1.5] ml-2 sm:ml-0">
        <LinkComponent url="/" color="white">
          {siteTitle}
        </LinkComponent>
      </h1>
      <nav
        className={`${
          showModal ? 'block' : 'hidden'
        } absolute left-1 sm:left-7 top-2 z-10 bg-white min-w-[360px] sm:min-w-[500px] min-h-[75vh] rounded-sm`}
      >
        <button
          className="close-button relative border-none bg-transparent w-10 h-10"
          onClick={closeModal}
        >
          閉じる
        </button>
        <ul>
          <li className="flex justify-center">
            <LinkComponent url="/tags" color="black">
              <span className="text-2xl sm:text-3xl font-bold underline">
                タグ一覧
              </span>
            </LinkComponent>
          </li>
        </ul>
      </nav>
    </header>
  );
};
