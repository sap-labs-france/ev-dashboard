import { Pipe, PipeTransform } from '@angular/core';
import { UserRoles } from '../model/users.model';

@Pipe({name: 'appUserRole'})
export class AppUserRolePipe implements PipeTransform {
  transform(role: string, currentRole = ''): string {
    for (const userRole of UserRoles.getAvailableRoles(currentRole)) {
      if (userRole.key === role) {
        return userRole.value;
      }
    }
    return role;
  }
}
