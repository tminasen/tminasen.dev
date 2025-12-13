import { FC } from 'react';
import { Maybe, Optional } from '../../types/utility';
import { metaData } from '../../constants/metaData';

type Props = {
  path: Maybe<string>;
};

const useCreateGithubArticleLink = (path: Maybe<string>) => {
  // `/blog/article`の形式なので、3番目を使用
  const articlePath: Optional<string> = path?.split('/')[2];
  if (articlePath == undefined) {
    return undefined;
  }
  return new URL(
    `tminasen.dev/tree/master/src/pages/blog/${articlePath}.mdx`,
    metaData.githubUrl,
  ).toString();
};

export const GithubArticleButton: FC<Props> = ({ path }) => {
  const buttonLink = useCreateGithubArticleLink(path);
  if (!buttonLink) {
    return null;
  }
  return (
    <div className='inline-block'>
      <a className='block relative w-[30px] h-[30px] sm:w-[40px] sm:h-[40px]' href={buttonLink} title="Githubリンク" target="_blank">
        <picture>
          <source
            type="image/webp"
            srcSet={metaData.githubIcon.replace(/\.png$/, '.webp')}
          />
          <source type="image/png" srcSet={metaData.githubIcon} />
          <img className='object-contain w-full h-full' src={metaData.githubIcon} alt="Githubリンク" />
        </picture>
      </a>
    </div>
  );
};
