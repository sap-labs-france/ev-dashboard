import { Pipe, PipeTransform } from '@angular/core';

import { User } from '../../types/User';
import { Utils } from '../../utils/Utils';

@Pipe({ name: 'appUserName' })
export class AppUserNamePipe implements PipeTransform {
  public transform(user: User): string {
    return Utils.buildUserFullName(user);
  }
}
