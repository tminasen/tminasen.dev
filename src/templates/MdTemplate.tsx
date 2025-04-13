import { FC } from 'react';

interface Props {
  html: string;
}

export const MdTemplate: FC<Props> = ({ html }) => {
  return <div className='md-article bg-white mt-5 sm:mt-8 text-base rounded-sm py-2 px-3 sm:px-4' dangerouslySetInnerHTML={{ __html: html }} />;
};
