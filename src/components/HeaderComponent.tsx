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
      <h1 className="text-2xl sm:text-4xl font-bold leading-[1.5] ml-2 sm:ml-0">
        <LinkComponent url="/" color="white">
          {siteTitle}
        </LinkComponent>
      </h1>
      <nav
        className="absolute left-1 sm:left-7 top-2 z-10"
        aria-label="グローバルメニュー"
      >
        <button
          className="menu-button relative w-7 sm:w-9 no-underline bg-transparent border-none"
          onClick={openModal}
          type="button"
          aria-controls="global-menu"
          aria-expanded={showModal}
          aria-label="メニューを開く"
        >
          メニュー
        </button>
        <div
          id="global-menu"
          className={`${
            showModal ? 'block' : 'hidden'
          } mt-2 bg-(--color-bg-card) min-w-[360px] sm:min-w-[500px] min-h-[75vh] rounded-sm`}
        >
          <button
            className="close-button relative border-none bg-transparent w-10 h-10"
            onClick={closeModal}
            type="button"
            aria-label="メニューを閉じる"
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
        </div>
      </nav>
    </header>
  );
};
