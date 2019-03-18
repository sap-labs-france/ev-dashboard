import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment'
import {LocaleService} from '../../services/locale.service';

@Pipe({name: 'appDuration'})
export class AppDurationPipe implements PipeTransform {
  private readonly locale: string;

  constructor(locale: LocaleService) {
    this.locale = locale.getCurrentFullLocaleForJS();
  }

  transform(durationInSecs: number): any {
    const duration = moment.duration(durationInSecs, 'seconds');
    let localDay = 'd';
    if (this.locale === 'fr_FR') {
      localDay = 'j';
    }

    return (<any>duration).format(`D[${localDay}]H[h]mm[m]`, {trim: 'both mid'});
  }
}
