import { NgModule } from '@angular/core';

import { NumericMaskDirective} from './numeric-mask.directive';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    NumericMaskDirective
  ], exports: [
    NumericMaskDirective
  ],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class NumericMaskModule { }
