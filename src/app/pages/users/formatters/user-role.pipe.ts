import {Pipe, PipeTransform} from '@angular/core';
import {UserRoles} from '../users.model';

@Pipe({name: 'userRole'})
export class UserRolePipe implements PipeTransform {

  transform(role: string, currentRole = ''): any {
    for (const userRole of UserRoles.getAvailableRoles(currentRole)) {
      if (userRole.key === role) {
        return userRole.value;
      }
    }
    return role;
  }
}
