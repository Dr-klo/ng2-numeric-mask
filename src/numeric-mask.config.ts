
import { InjectionToken } from "@angular/core";

export interface NumericMaskConfig {

  align: string;
  allowNegative: boolean;
  allowNull: boolean;
  decimal: string;
  maxPrecision: number;
  prefix: string;
  suffix: string;
  thousands: string;
  cropDecimal: boolean;
  debug: boolean;
}

export let Numeric_Mask_Config = new InjectionToken<NumericMaskConfig>("numeric.mask.config");
