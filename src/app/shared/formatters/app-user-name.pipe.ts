import {Pipe, PipeTransform} from '@angular/core';
import {User} from '../../common.types';
import {memoize} from 'decko';

@Pipe({name: 'appUserName'})
export class AppUserNamePipe implements PipeTransform {
  @memoize
  transform(user: User): any {
    if (!user) {
      return '';
    }
    const name = user.name ? user.name : '';
    const firstName = user.firstName ? user.firstName : '';
    return `${name.toUpperCase()} ${firstName.charAt(0).toUpperCase() + firstName.slice(1)}`;
  }
}
