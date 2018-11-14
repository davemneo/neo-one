// tslint:disable no-import-side-effect
import '@babel/polyfill';

import { comlink } from '@neo-one/worker';
import { Transpiler } from './Transpiler';

comlink.expose(Transpiler, self);
