import { AbstractControl, ValidationErrors } from '@angular/forms';

export class Cars {
  public static validateVIN(control: AbstractControl): ValidationErrors | null {
    const VINValidator = new RegExp('^[A-Z\\d]{17}$');
    if (!control.value || VINValidator.test(control.value)) {
      return null;
    }
    return { invalidVIN: true };
  }
}
