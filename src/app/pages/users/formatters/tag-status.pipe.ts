import { Pipe, PipeTransform } from '@angular/core';
import { userStatuses } from '../model/users.model';

@Pipe({name: 'appTagActive'})
export class AppTagActivePipe implements PipeTransform {

  transform(active: boolean): string {
    if (active) {
      return 'tags.activated';
    }
    return 'tags.deactivated';
  }
}
