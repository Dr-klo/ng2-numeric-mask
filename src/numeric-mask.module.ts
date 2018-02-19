import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { NumericMaskDirective} from './numeric-mask.directive';

@NgModule({
  declarations: [
    NumericMaskDirective
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: []
})
export class NumericMaskModule { }
