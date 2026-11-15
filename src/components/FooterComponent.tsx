import { FC } from 'react';
import { metaData } from '../constants/metaData';

const FOOTER_LINKS = [
  { label: 'RSS', href: '/rss/feed.xml' },
  { label: 'GitHub', href: metaData.githubUrl },
  { label: 'X', href: metaData.xUrl },
  { label: 'llms.txt', href: '/llms.txt' },
] as const;

export const FooterComponent: FC = () => (
  <footer className='flex items-center flex-col gap-3 py-6 bg-(--color-bg-footer) text-(--color-text-base) mt-3'>
    <ul className='flex flex-wrap justify-center gap-x-6 gap-y-1'>
      {FOOTER_LINKS.map(({ label, href }) => (
        <li key={label}>
          <a
            href={href}
            className='inline-flex min-h-6 items-center text-sm text-(--color-text-link) underline'
          >
            {label}
          </a>
        </li>
      ))}
    </ul>
    <small className='text-[13px] text-(--color-text-muted)'>
      {`© ${new Date().getFullYear()} tminasen ・ This site uses Google Analytics.`}
    </small>
  </footer>
);
