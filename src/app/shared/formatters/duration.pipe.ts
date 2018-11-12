import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'duration'})
export class DurationPipe implements PipeTransform {
  transform(durationInSecs: number): any {
    return new Date(durationInSecs * 1000).toUTCString().replace(/.*(\d{2}):(\d{2}):(\d{2}).*/, '$1h $2m');
  }
}
