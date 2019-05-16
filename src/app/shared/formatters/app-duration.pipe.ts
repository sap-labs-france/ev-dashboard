import {Pipe, PipeTransform} from '@angular/core';
import {LocaleService} from '../../services/locale.service';

@Pipe({name: 'appDuration'})
export class AppDurationPipe implements PipeTransform {
  private readonly locale: string;
  private localeService: LocaleService;

  constructor(localeService: LocaleService) {
    this.localeService = localeService;
  }

  transform(durationInSecs: number): any {
    let result = '';
    if (durationInSecs === 0) {
      return `0 ${this.localeService.getI18nSecond()}`;
    }
    const days = Math.floor(durationInSecs / (3600 * 24));
    durationInSecs -= days * 3600 * 24;
    const hours = Math.floor(durationInSecs / 3600);
    durationInSecs -= hours * 3600;
    const minutes = Math.floor(durationInSecs / 60);
    const seconds = Math.floor(durationInSecs - (minutes * 60));
    if (days > 0) {
      if (days === 1) {
        result += `${days} ${this.localeService.getI18nDay()} `;
      } else {
        result += `${days} ${this.localeService.getI18nDays()} `;
      }
    }
    if (hours > 0) {
      if (hours === 1) {
        result += `${hours} ${this.localeService.getI18nHour()} `;
      } else {
        result += `${hours} ${this.localeService.getI18nHours()} `;
      }
    }
    if (minutes > 0) {
      if (minutes === 1) {
        result += `${minutes} ${this.localeService.getI18nMinute()} `;
      } else {
        result += `${minutes} ${this.localeService.getI18nMinutes()} `;
      }
    }
    if (seconds > 0) {
      if (seconds === 1) {
        result += `${seconds} ${this.localeService.getI18nSecond()}`;
      } else {
        result += `${seconds} ${this.localeService.getI18nSeconds()}`;
      }
    }
    return result;
  }
}
