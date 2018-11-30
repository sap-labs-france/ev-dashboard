import {Pipe, PipeTransform} from '@angular/core';
import {UserRoles} from '../users.model';
import {memoize} from 'decko';

@Pipe({name: 'userRole'})
export class UserRolePipe implements PipeTransform {
  @memoize
  transform(role: string, currentRole = ''): any {
    for (const userRole of UserRoles.getAvailableRoles(currentRole)) {
      if (userRole.key === role) {
        return userRole.value;
      }
    }
    return role;
  }
}
