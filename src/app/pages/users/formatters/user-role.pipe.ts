import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'userRole'})
export class UserRolePipe implements PipeTransform {

  transform(role: string): any {
    switch (role) {
      case 'A':
        return 'users.role_admin';
      case 'S':
        return 'users.role_super_admin';
      case 'B':
        return 'users.role_basic';
      case 'D':
        return 'users.role_demo';
      default:
        return role;
    }
  }
}
