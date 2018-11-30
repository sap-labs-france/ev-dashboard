import {Pipe, PipeTransform} from '@angular/core';
import {memoize} from 'decko';

@Pipe({name: 'appArrayToString'})
export class AppArrayToStringPipe implements PipeTransform {
  @memoize
  transform(array: any[]): any {
    if (!array || array.length === 0) {
      return '';
    }
    if (array.length > 1) {
      return `${array[0]} (+${array.length - 1})`;
    } else {
      return array[0];
    }
  }
}
