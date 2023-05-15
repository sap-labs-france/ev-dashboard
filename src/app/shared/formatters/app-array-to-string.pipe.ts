import { Pipe, PipeTransform } from '@angular/core';

import { Utils } from '../../utils/Utils';

@Pipe({ name: 'appArrayToString' })
export class AppArrayToStringPipe implements PipeTransform {
  public transform(array: any[]): string {
    if (!Array.isArray(array)) {
      return;
    }
    if (Utils.isEmptyArray(array)) {
      return '';
    } else if (array.length > 1) {
      return `${array[0]} (+${array.length - 1})`;
    } else {
      return `${array[0]}`;
    }
  }
}
