import { JSX } from 'react';
import { HeaderComponent } from '../components/HeaderComponent';
import { FooterComponent } from '../components/FooterComponent';

interface Props {
  children: JSX.Element | JSX.Element[];
  isTopPage?: boolean;
}

export const PageTemplate: React.FC<Props> = ({ children, isTopPage = false }) => {
  return (
    <div className='flex flex-col relative min-h-lvh min-w-86 sm:min-w-7xl bg-(--color-bg-base)'>
      <a
        className='sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:px-3 focus:py-2 focus:rounded-sm focus:bg-(--color-bg-card) focus:text-(--color-text-base)'
        href='#main-content'
      >
        本文へスキップ
      </a>
      <HeaderComponent
        siteTitle="水無瀬のプログラミング日記"
        isTopPage={isTopPage}
      />
      <div className='flex flex-[1_0_auto] justify-between mt-5 mb-0 mx-1 sm:mx-2'>
        <main id='main-content' className='w-full'>{children}</main>
      </div>
      <FooterComponent />
    </div>
  );
};
