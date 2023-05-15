import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { Constants } from './Constants';
import { Utils } from './Utils';

export class PricingHelpers {
  public static toMinutes(value: number): number {
    if (Utils.isNullOrUndefined(value)) {
      return value; // do not change the actual value
    }
    return value / 60;
  }

  public static toSeconds(value: number): number {
    if (Utils.isNullOrUndefined(value)) {
      return value; // do not change the actual value
    }
    return value * 60;
  }

  public static convertDurationToSeconds(enabled: boolean, value: number): number {
    return enabled ? PricingHelpers.toSeconds(value) : null;
  }

  public static minValidator(maxControl: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors => {
      if (!Utils.isNullOrUndefined(Validators.required(control))) {
        return Validators.required(control);
      } else if (
        !Utils.isNullOrUndefined(Validators.pattern(Constants.REGEX_VALIDATION_NUMBER)(control))
      ) {
        return Validators.pattern(Constants.REGEX_VALIDATION_NUMBER)(control);
      } else {
        // call the validation of the dependant control (maxValidator)
        control.parent.controls[maxControl].updateValueAndValidity();
      }
      return null;
    };
  }

  public static maxValidator(minControl: string, maxControl: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors => {
      if (!Utils.isNullOrUndefined(Validators.required(control))) {
        return Validators.required(control);
      } else if (
        !Utils.isNullOrUndefined(Validators.pattern(Constants.REGEX_VALIDATION_NUMBER)(control))
      ) {
        return Validators.pattern(Constants.REGEX_VALIDATION_NUMBER)(control);
      } else if (
        control.parent.controls[minControl]?.enabled &&
        control.parent.controls[maxControl]?.enabled
      ) {
        const fieldMinValue = control.parent.controls[minControl]?.value;
        const fieldMaxValue = control.parent.controls[maxControl]?.value;
        if (Number(fieldMaxValue) <= Number(fieldMinValue)) {
          return { minMaxError: true };
        }
      }
      return null;
    };
  }

  public static minTimeValidator(maxControl: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors => {
      if (!Utils.isNullOrUndefined(Validators.required(control))) {
        return Validators.required(control);
      } else {
        // call the validation of the dependant control (maxValidator)
        control.parent.controls[maxControl].updateValueAndValidity();
      }
      return null;
    };
  }

  public static maxTimeValidator(minControl: string, maxControl: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors => {
      if (!Utils.isNullOrUndefined(Validators.required(control))) {
        return Validators.required(control);
      } else if (
        control.parent.controls[minControl]?.enabled &&
        control.parent.controls[maxControl]?.enabled
      ) {
        const fieldMinValue = control.parent.controls[minControl]?.value;
        const fieldMaxValue = control.parent.controls[maxControl]?.value;
        if (fieldMaxValue === fieldMinValue) {
          return { timeRangeError: true };
        }
      }
      return null;
    };
  }
}
