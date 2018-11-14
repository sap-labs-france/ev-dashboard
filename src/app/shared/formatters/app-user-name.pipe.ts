import {Pipe, PipeTransform} from '@angular/core';
import {User} from '../../common.types';

@Pipe({name: 'userName'})
export class AppUserNamePipe implements PipeTransform {
  transform(user: User): any {
    const name = user.name ? user.name : '';
    const firstName = user.firstName ? user.firstName : '';
    return `${name.toUpperCase()} ${firstName.charAt(0).toUpperCase() + firstName.slice(1)}`;
  }
}
