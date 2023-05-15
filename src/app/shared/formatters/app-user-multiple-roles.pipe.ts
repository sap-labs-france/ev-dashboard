import { Pipe, PipeTransform } from '@angular/core';
import { Utils } from 'utils/Utils';

@Pipe({ name: 'appUserMultipleRoles' })
export class AppUserMultipleRolesPipe implements PipeTransform {
  public transform(role: string): string {
    if (!role || Utils.isEmptyString(role)) {
      return 'users.role_mult_all';
    }
    switch (role) {
      case 'A':
        return 'users.role_admin';
      case 'B':
        return 'users.role_basic';
      case 'D':
        return 'users.role_demo';
      case 'AD':
      case 'DA':
        return 'users.role_mult_admin_demo';
      default:
        return role;
    }
  }
}
