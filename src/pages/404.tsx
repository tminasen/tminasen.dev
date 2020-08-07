import React from 'react';

import { PageTemplate } from '../templates/PageTemplate';
import SEO from '../components/seo';

const NotFoundPage = () => (
  <PageTemplate>
    <React.Fragment>
      <SEO title="404: Not found" />
      <h1>NOT FOUND</h1>
      <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
    </React.Fragment>
  </PageTemplate>
);

export default NotFoundPage;
