import { Pipe, PipeTransform } from '@angular/core';
import { userStatuses } from '../model/users.model';

@Pipe({name: 'appUserStatus'})
export class AppUserStatusPipe implements PipeTransform {

  public transform(status: string): string {
    for (const userStatus of userStatuses) {
      if (userStatus.key === status) {
        return userStatus.value;
      }
    }
    return status;
  }
}
