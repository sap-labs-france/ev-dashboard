import { AbstractControl, ValidationErrors } from '@angular/forms';

import { User, UserToken } from '../types/User';

export class Users {
  public static buildUserFullName(user: User | UserToken): string | undefined {
    if (!user) {
      return 'Unknown';
    }
    // First name?
    if (!user.firstName) {
      return user.name;
    }
    return `${user.firstName} ${user.name}`;
  }

  public static validatePassword(control: AbstractControl): ValidationErrors | null {
    if (
      !control.value ||
      /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!#@:;,<>\/''\$%\^&\*\.\?\-_\+\=\(\)])(?=.{8,})/.test(
        control.value
      )
    ) {
      return null;
    }
    return { invalidPassword: true };
  }

  public static passwordWithNoSpace(control: AbstractControl): ValidationErrors | null {
    if (!control.value || (!control.value.startsWith(' ') && !control.value.endsWith(' '))) {
      return null;
    }
    return { noSpace: true };
  }

  public static validatePhone(control: AbstractControl): ValidationErrors | null {
    if (!control.value || /^\+?([0-9] ?){9,14}[0-9]$/.test(control.value)) {
      return null;
    }
    return { invalidPhone: true };
  }
}
