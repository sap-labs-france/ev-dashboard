import { AbstractControl } from '@angular/forms';

export class StripeToolBox {

  public static validatePublicKey(control: AbstractControl) {
    // Check
    if (!control.value || /(^pk_test_)/.test(control.value) || /(^pk_live_)/.test(control.value)) {
      // Ok
      return null;
    }
    return {invalid: true};
  }

    public static validateSecretKey(control: AbstractControl) {
    // Check
    if (!control.value || /(^sk_test_)/.test(control.value) || /(^sk_live_)/.test(control.value)) {
      // Ok
      return null;
    }
    return {invalid: true};
  }
}
