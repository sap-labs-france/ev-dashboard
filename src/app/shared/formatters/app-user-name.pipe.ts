import { Pipe, PipeTransform } from '@angular/core';
import { User } from 'app/types/User';

@Pipe({name: 'appUserName'})
export class AppUserNamePipe implements PipeTransform {

  transform(user: User): string {
    if (!user) {
      return '';
    }
    const name = user.name ? user.name : '';
    const firstName = user.firstName ? user.firstName : '';
    return `${name.toUpperCase()} ${firstName.charAt(0).toUpperCase() + firstName.slice(1)}`;
  }
}
