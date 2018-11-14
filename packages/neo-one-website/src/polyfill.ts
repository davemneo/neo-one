// tslint:disable no-submodule-imports no-import-side-effect
import '@babel/polyfill';
// @ts-ignore
import regeneratorRuntime from '@babel/runtime/regenerator';
import { TrackJS } from '@neo-one/react-common';
// @ts-ignore
import './Modernizr';

import '../static/css/app.css';
import '../static/css/fonts.css';

// tslint:disable-next-line no-any no-object-mutation
(global as any).regeneratorRuntime = regeneratorRuntime;

// tslint:disable no-object-mutation strict-type-predicates
if (typeof window !== 'undefined') {
  // @ts-ignore
  process.stdout = {
    isTTY: undefined,
  };

  TrackJS.install({
    token: 'ccff2c276a494f0b94462cdbf6bf4518',
    application: 'neo-one',
    enabled: process.env.NODE_ENV === 'production',
  });
  TrackJS.addMetadata('type', 'main');

  window.addEventListener('unhandledrejection', (e) => {
    if (e.reason && e.reason.name === 'Canceled') {
      // This is an error from vscode that vscode uses to cancel some actions
      // We don't want to show this to the user
      e.preventDefault();
    }
  });

  if (Modernizr.serviceworker) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        // tslint:disable-next-line no-console
        console.error(error);
      });
    });
  }
}
