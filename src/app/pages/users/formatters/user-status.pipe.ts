import { Pipe, PipeTransform } from '@angular/core';
import { userStatuses } from '../users.model';

@Pipe({name: 'userStatus'})
export class UserStatusPipe implements PipeTransform {

  transform(status: string): any {
    for (const userStatus of userStatuses) {
      if (userStatus.key === status) {
        return userStatus.value;
      }
    }
    return status;
  }
}
