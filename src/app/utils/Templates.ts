import { AbstractControl, ValidationErrors } from '@angular/forms';

export class Templates {
  public static validateJSON(control: AbstractControl): ValidationErrors | null {
    try {
      JSON.parse(control.value);
      // return Validators.required(control);
      return null;
    } catch (error) {
      return { invalidJSON: true };
    }
  }
}
