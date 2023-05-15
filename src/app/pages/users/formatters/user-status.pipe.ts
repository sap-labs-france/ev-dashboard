import { Pipe, PipeTransform } from '@angular/core';

import { USER_STATUSES } from '../../../shared/model/users.model';

@Pipe({ name: 'appUserStatus' })
export class AppUserStatusPipe implements PipeTransform {
  public transform(status: string): string {
    for (const userStatus of USER_STATUSES) {
      if (userStatus.key === status) {
        return userStatus.value;
      }
    }
    return status;
  }
}
