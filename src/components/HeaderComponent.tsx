import { FC } from 'react';
import { LinkComponent } from './atoms/LinkComponent';

type Props = {
  siteTitle: string;
  isTopPage: boolean;
};

const siteTitleClassName =
  'text-base sm:text-2xl font-bold leading-[1.5]';

export const HeaderComponent: FC<Props> = ({ siteTitle, isTopPage }) => {
  const siteTitleLink = (
    <LinkComponent url="/" color="white">
      {siteTitle}
    </LinkComponent>
  );
  return (
    <header className="flex h-16 justify-between items-center px-2 sm:px-7 bg-(--color-header-bg-blue)">
      {isTopPage ? (
        <h1 className={siteTitleClassName}>{siteTitleLink}</h1>
      ) : (
        <p className={siteTitleClassName}>{siteTitleLink}</p>
      )}
      <nav aria-label="グローバルメニュー">
        {/* li 直下のリンクを flex アイテムにして、タップ領域を 24px 以上にする */}
        <ul className="flex items-center gap-1 sm:gap-3 text-sm sm:text-base">
          <li className="flex *:flex *:min-h-6 *:min-w-6 *:items-center *:justify-center *:px-1">
            <LinkComponent url="/tags" color="white">
              タグ
            </LinkComponent>
          </li>
          <li className="flex *:flex *:min-h-6 *:min-w-6 *:items-center *:justify-center *:px-1">
            <a className="no-underline text-white" href="/rss/feed.xml">
              RSS
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};
