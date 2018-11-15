import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'userStatus'})
export class UserStatusPipe implements PipeTransform {

  transform(status: string): any {
    switch (status) {
      case 'A':
        return 'users.status_active';
      case 'B':
        return 'users.status_blocked';
      case 'I':
        return 'users.status_inactive';
      case 'L':
        return 'users.status_locked';
      case 'P':
        return 'users.status_pending';
      default:
        return status;
    }
  }
}
