// tslint:disable strict-type-predicates
// tslint:disable-next-line no-import-side-effect
import '../polyfill';

import { Loading } from '@neo-one/react-common';
import { Redirect } from '@reach/router';
import * as React from 'react';
import { RouteData } from 'react-static';
import { Helmet } from '../components';
import { MainLayout } from '../layout';

interface BlogRedirectProps {
  readonly redirect: string;
}

// tslint:disable-next-line:no-default-export export-name
export default () => (
  <MainLayout path="blog">
    <Helmet title="NEO•ONE Blog" />
    {/*
    // @ts-ignore */}
    <RouteData Loader={Loading}>
      {({ redirect }: BlogRedirectProps) => <Redirect to={redirect} noThrow={typeof window === 'undefined'} />}
    </RouteData>
  </MainLayout>
);
