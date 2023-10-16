import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import moment from 'moment';
import { CentralServerService } from 'services/central-server.service';
import { firstValueFrom, from } from 'rxjs';
import { Utils } from './Utils';

export class Reservations {
  public static validateDate(control: AbstractControl): ValidationErrors | null {
    const DateValidator = moment(control.value);
    if (!control.value || DateValidator.isValid()) {
      return null;
    }
    return { invalidDate: true };
  }

  public static fromDateValidator(toDateControl: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors => {
      if (!Utils.isNullOrUndefined(Validators.required(control))) {
        return Validators.required(control);
      } else {
        control.parent.controls[toDateControl].updateValueAndValidity();
      }
      return null;
    };
  }

  public static fromToDateValidator(fromDateControl: string, toDateControl: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors => {
      if (!Utils.isNullOrUndefined(Validators.required(control))) {
        return Validators.required(control);
      } else if (
        control.parent.controls[fromDateControl]?.enabled &&
        control.parent.controls[toDateControl]?.enabled
      ) {
        const fromDate = moment(control.parent.controls[fromDateControl]?.value);
        const toDate = moment(control.parent.controls[toDateControl]?.value);
        const actualDate = moment();
        if (fromDate.isAfter(toDate)) {
          return { invalidDateRange: true };
        } else if (fromDate.isBefore(actualDate) || toDate.isBefore(actualDate)) {
          return { invalidDateRange: true };
        } else if (toDate.isBefore(fromDate)) {
          return { invalidDateRange: true };
        }
      }
      return null;
    };
  }

  public static expiryDateValidator(control: AbstractControl): ValidationErrors | null {
    const DateValidator = moment(control.value);
    if (!control.value) {
      return null;
    }
    const actualDate = moment().toDate();
    if (DateValidator.isBefore(actualDate)) {
      return { invalidExpiryDate: true };
    }
    return null;
  }
}
