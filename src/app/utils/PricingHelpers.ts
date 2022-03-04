import { AbstractControl, FormControl, FormGroup, ValidatorFn } from '@angular/forms';

import { Utils } from './Utils';

export class PricingHelpers {
  public static toMinutes( value: number ): number {
    if ( Utils.isNullOrUndefined(value) ) {
      return value; // do not change the actual value
    }
    return value / 60;
  }

  public static toSeconds( value: number ): number {
    if ( Utils.isNullOrUndefined(value) ) {
      return value; // do not change the actual value
    }
    return value * 60;
  }

  public static convertDurationToSeconds( enabled: boolean, value: number): number {
    return (enabled)? PricingHelpers.toSeconds(value): null;
  }

  public static minMaxValidator(minControl: string, maxControl: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control.parent.controls[`${minControl}Enabled`]?.value) {
        const fieldMinValue = control.parent.controls[minControl]?.value;
        const fieldMaxValue = control.parent.controls[maxControl]?.value;
        if (!Utils.isNullOrUndefined(fieldMinValue) && !Utils.isNullOrUndefined(fieldMaxValue) && fieldMaxValue !== '' && fieldMinValue !== '' && fieldMinValue >= 0 && fieldMaxValue >= 0) {
          if (Number(fieldMaxValue) <= Number(fieldMinValue)) {
            return {minMaxError: true};
          }
          control.parent.controls[minControl].setErrors(null);
          control.parent.controls[maxControl].setErrors(null);
        }
      }
      return null;
    };
  }
}
