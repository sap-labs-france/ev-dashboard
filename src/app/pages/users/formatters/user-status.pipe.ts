import { Pipe, PipeTransform } from '@angular/core';
import { userStatuses } from '../users.model';

@Pipe({name: 'appUserStatus'})
export class AppUserStatusPipe implements PipeTransform {

  transform(status: string): string {
    for (const userStatus of userStatuses) {
      if (userStatus.key === status) {
        return userStatus.value;
      }
    }
    return status;
  }
}
