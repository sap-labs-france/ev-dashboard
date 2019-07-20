import { AbstractControl } from '@angular/forms';

export class Users {
  public static buildUserFullName(user) {
    if (!user) {
      return 'Unknown';
    }
    // First name?
    if (!user.firstName) {
      return user.name;
    }
    return `${user.firstName} ${user.name}`;
  }

  public static validatePassword(control: AbstractControl) {
    // Check
    if (!control.value || /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!#@:;,<>\/''\$%\^&\*\.\?\-_\+\=\(\)])(?=.{8,})/.test(control.value)) {
      // Ok
      return null;
    }
    return {invalidPassword: true};
  }

  public static passwordWithNoSpace(control: AbstractControl) {
    // Check
    if (!control.value || (!control.value.startsWith(' ') && !control.value.endsWith(' '))) {
      // Ok
      return null;
    }
    return {noSpace: true};
  }
}
