import { AbstractControl, FormControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { log } from 'util';

export class Users {
  public static USER_STATUS_PENDING = 'P';
  public static USER_STATUS_ACTIVE = 'A';
  public static USER_STATUS_DELETED = 'D';
  public static USER_STATUS_INACTIVE = 'I';
  public static USER_STATUS_BLOCKED = 'B';
  public static USER_STATUS_LOCKED = 'L';
  public static USER_STATUS_UNKNOWN = 'U';

  public static USER_ROLE_ADMIN = 'A';
  public static USER_ROLE_BASIC = 'B';
  public static USER_ROLE_DEMO = 'D';
  public static USER_ROLE_UNKNOWN = 'U';

  public static USER_LOCALE_UNKNOWN = 'U';

  public static USER_NO_PICTURE = 'assets/img/theme/no-photo.png';
  public static NO_USER = 'assets/img/theme/no-user.png';

  public static USER_WITH_NO_PICTURE = false;
  public static USER_WITH_PICTURE = true;

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

    return { invalidPassword: true };
  }

  public static validateEqual(formGroup: FormGroup, firstField, secondField) {
    const field1: FormControl = <FormControl>formGroup.controls[firstField];
    const field2: FormControl = <FormControl>formGroup.controls[secondField];
    // Equals
    if (field1.value === field2.value) {
      console.log('====================================');
      console.log("EQUAL");
      console.log('====================================');
      return null;
    }
    // Not Equal
    return { notEqual: true };
  }
}
