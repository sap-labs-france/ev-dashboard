import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment'
import {LocaleService} from '../../services/locale.service';

moment.updateLocale('fr', <any>{
  durationLabelsStandard: {
    S: 'milliseconde',
    SS: 'millisecondes',
    s: 'seconde',
    ss: 'secondes',
    m: 'minute',
    mm: 'minutes',
    h: 'heure',
    hh: 'heures',
    d: 'jour',
    dd: 'jours',
    w: 'semaine',
    ww: 'semaines',
    M: 'mois',
    MM: 'mois',
    y: 'année',
    yy: 'années'
  },
  durationLabelsShort: {
    S: 'msec',
    SS: 'msecs',
    s: 'sec',
    ss: 'secs',
    m: 'min',
    mm: 'mins',
    h: 'hr',
    hh: 'hrs',
    d: 'jr',
    dd: 'jrs',
    w: 'sem',
    ww: 'sems',
    M: 'mo',
    MM: 'mos',
    y: 'an',
    yy: 'ans'
  },
  durationTimeTemplates: {
    HMS: 'h:mm:ss',
    HM: 'h:mm',
    MS: 'm:ss'
  },
  durationLabelTypes: [
    {type: 'standard', string: '__'},
    {type: 'short', string: '_'}
  ],
  durationPluralKey: function (token, integerValue, decimalValue) {
    // Singular for a value of `1`, but not for `1.0`.
    if (integerValue === 1 && decimalValue === null) {
      return token;
    }

    return token + token;
  }
});

@Pipe({name: 'appDuration'})
export class AppDurationPipe implements PipeTransform {
  private readonly locale: string;

  constructor(locale: LocaleService) {
    this.locale = locale.getCurrentFullLocaleForJS();
    moment.locale(locale.getCurrentFullLocale().substr(0, 2));
  }

  transform(durationInSecs: number, full: boolean = false): any {
    const duration = moment.duration(durationInSecs, 'seconds');
    if (duration.asHours() > 24 && !full) {
      return (<any>duration).format(`D __ H __`, {trim: 'both mid'});
    }
    return (<any>duration).format(`D __ H __ mm _`, {trim: 'both mid'});
  }
}
