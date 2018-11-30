import {Pipe, PipeTransform} from '@angular/core';
import {UserRoles} from '../users.model';
import {memoize} from 'decko';

@Pipe({name: 'userRole'})
export class UserRolePipe implements PipeTransform {
  @memoize
  transform(role: string, ...args: any[]): any {
    const currentRole = args && args[0] ? args[0] : '';
    for (const userRole of UserRoles.getAvailableRoles(currentRole)) {
      if (userRole.key === role) {
        return userRole.value;
      }
    }
    return role;
  }
}
