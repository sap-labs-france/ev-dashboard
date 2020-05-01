import { Pipe, PipeTransform } from '@angular/core';
import { User } from 'app/types/User';
import { Utils } from 'app/utils/Utils';

@Pipe({name: 'appUserName'})
export class AppUserNamePipe implements PipeTransform {

  public transform(user: User): string {
    return Utils.buildUserFullName(user);
  }
}
