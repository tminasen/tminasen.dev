import { FC } from 'react';
import { Maybe } from '../../types/utility';
import { metaData } from '../../constants/metaData';

type Props = {
  title: Maybe<string>;
  path: Maybe<string>;
};

const useFormatShareData = (
  title: Maybe<string>,
  path: Maybe<string>,
): [string, string] => {
  const shareText = encodeURIComponent(`${title}\n#水無瀬のプログラミング日記`);
  const shareUrl = encodeURIComponent(
    new URL(path || '', metaData.domain).toString(),
  );
  return [shareText, shareUrl];
};

export const XShareButton: FC<Props> = ({ title, path }) => {
  const [shareText, shareUrl] = useFormatShareData(title, path);
  return (
    <div className="inline-block p-[6px] bg-black rounded-full">
      <a
        className="block h-[18px] w-[18px] sm:w-[28px] sm:h-[28px] relative"
        href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
        title="Xに投稿する"
        target="_blank"
        rel="noopener noreferrer"
      >
        <picture>
          <source
            type="image/webp"
            srcSet={metaData.XIcon.replace(/\.png$/, '.webp')}
          />
          <source type="image/png" srcSet={metaData.XIcon} />
          <img
            className="object-contain w-full h-full"
            src={metaData.XIcon}
            alt="Xに投稿する"
          />
        </picture>
      </a>
    </div>
  );
};
