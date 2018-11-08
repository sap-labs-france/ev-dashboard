import {Pipe, PipeTransform} from '@angular/core';
import {User} from '../../common.types';

@Pipe({name: 'userName'})
export class UserNamePipe implements PipeTransform {
  transform(user: User): any {
    return `${user.name.toUpperCase()} ${user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)}`;
  }
}
