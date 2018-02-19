import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import {NumericMaskModule} from './app/numeric-mask.module';

enableProdMode();
platformBrowserDynamic().bootstrapModule(NumericMaskModule)
  .catch(err => console.log(err));
