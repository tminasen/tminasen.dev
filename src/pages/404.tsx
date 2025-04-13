import React from 'react';
import { PageTemplate } from '../templates/PageTemplate';

const NotFoundPage = () => (
  <PageTemplate>
    <React.Fragment>
      <h1 className='text-xl sm:text-2xl font-bold'>NOT FOUND</h1>
      <p className='text-base mt-2'>そんなページないです🙈</p>
    </React.Fragment>
  </PageTemplate>
);

export default NotFoundPage;

export const getStaticProps = async () => {
  return {
    props: {
      title: 'Not fount',
      ogType: 'website',
    },
  };
};
