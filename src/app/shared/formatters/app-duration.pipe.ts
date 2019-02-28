import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment'

@Pipe({name: 'appDuration'})
export class AppDurationPipe implements PipeTransform {

  transform(durationInSecs: number): any {
    return (<any>moment.duration(durationInSecs, 'seconds')).format('H[h]mm[m]', {
      trim: false
    });
  }
}
