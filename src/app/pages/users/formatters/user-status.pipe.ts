import {Pipe, PipeTransform} from '@angular/core';
import {UserStatuses} from '../users.model';

@Pipe({name: 'userStatus'})
export class UserStatusPipe implements PipeTransform {

  transform(status: string): any {
    for (const userStatus of UserStatuses) {
      if (userStatus.key === status) {
        return `<mat-chip-list><mat-chip>${userStatus.value}</mat-chip></mat-chip-list>`;
      }
    }
    return status;
  }
}
