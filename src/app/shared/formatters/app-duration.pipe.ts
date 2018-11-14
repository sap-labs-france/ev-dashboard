import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'appDuration'})
export class AppDurationPipe implements PipeTransform {
  transform(durationInSecs: number): any {
    return new Date(durationInSecs * 1000).toUTCString().replace(/.*(\d{2}):(\d{2}):(\d{2}).*/, '$1h $2m');
  }
}
