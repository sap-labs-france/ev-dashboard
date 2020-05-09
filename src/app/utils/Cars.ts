import { AbstractControl, ValidationErrors } from '@angular/forms';

export class Cars {
  public static validateVIN(control: AbstractControl): ValidationErrors | null {
    // Check
    const VINValidator = new RegExp("^[A-HJ-NPR-Z\\d]{8}[\\dX][A-HJ-NPR-Z\\d]{2}\\d{6}$");
    if (!control.value || VINValidator.test(control.value)) {
      // Ok
      return null;
    }
    return { invalidVIN: true };
  }
}
