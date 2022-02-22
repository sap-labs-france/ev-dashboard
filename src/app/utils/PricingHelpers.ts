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

  public static minMaxValidator(formGroup: FormGroup, minControl: string, maxControl: string): ValidatorFn {
    const restrictions = formGroup.controls.restrictions as FormGroup;
    return (control: AbstractControl): { [key: string]: any } | null => {
      const fieldMinValue = restrictions.controls[minControl]?.value;
      const fieldMaxValue = restrictions.controls[maxControl]?.value;
      if (!Utils.isNullOrUndefined(fieldMinValue) && !Utils.isNullOrUndefined(fieldMaxValue) && fieldMaxValue !== '' && fieldMinValue !== '' && fieldMinValue >= 0 && fieldMaxValue >= 0) {
        if (Number(fieldMaxValue) <= Number(fieldMinValue)) {
          return {minMaxError: true};
        }
        restrictions.controls[minControl].setErrors(null);
        restrictions.controls[maxControl].setErrors(null);
      }
      return null;
    };
  }
}
