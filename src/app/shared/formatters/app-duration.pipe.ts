import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment'
import {memoize} from 'decko';

@Pipe({name: 'appDuration'})
export class AppDurationPipe implements PipeTransform {
  @memoize
  transform(durationInSecs: number): any {
    return moment.duration(durationInSecs, 'seconds').format('HH[h] mm[m]', {
      trim: false
    });
  }
}
