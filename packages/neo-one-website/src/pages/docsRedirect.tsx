// tslint:disable strict-type-predicates
// tslint:disable-next-line no-import-side-effect
import '../polyfill';

import { Redirect } from '@reach/router';
import * as React from 'react';
import { RouteData } from 'react-static';
import { Helmet } from '../components';
import { DocsLoading } from '../layout';

interface DocsRedirectProps {
  readonly redirect: string;
}

// tslint:disable-next-line:no-default-export export-name
export default () => (
  <>
    <Helmet title="NEO•ONE Docs" />
    {/*
    // @ts-ignore */}
    <RouteData Loader={DocsLoading}>
      {({ redirect }: DocsRedirectProps) => <Redirect to={redirect} noThrow={typeof window === 'undefined'} />}
    </RouteData>
  </>
);
