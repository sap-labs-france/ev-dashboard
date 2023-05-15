import { Pipe, PipeTransform } from '@angular/core';

import { LocaleService } from '../../services/locale.service';

@Pipe({ name: 'appDuration' })
export class AppDurationPipe implements PipeTransform {
  private localeService: LocaleService;

  public constructor(localeService: LocaleService) {
    this.localeService = localeService;
  }

  public transform(durationSecs: number): string {
    let result = '';
    if (isNaN(durationSecs)) {
      return `-`;
    }
    if (durationSecs < 1) {
      return `0 ${this.localeService.getI18nSecond()}`;
    }
    const days = Math.floor(durationSecs / (3600 * 24));
    durationSecs -= days * 3600 * 24;
    const hours = Math.floor(durationSecs / 3600);
    durationSecs -= hours * 3600;
    const minutes = Math.floor(durationSecs / 60);
    const seconds = Math.floor(durationSecs - minutes * 60);
    if (days !== 0) {
      result += `${days}${this.localeService.getI18nDay()} `;
    }
    if ((hours !== 0 || days !== 0) && (hours !== 0 || (minutes !== 0 && days === 0))) {
      result += `${hours}${this.localeService.getI18nHour()} `;
    }
    if (days === 0) {
      if (minutes !== 0 || (hours !== 0 && (minutes !== 0 || (seconds !== 0 && hours === 0)))) {
        result += `${minutes}${this.localeService.getI18nMinute()} `;
      }
      if (hours === 0 && seconds !== 0) {
        result += `${seconds}${this.localeService.getI18nSecond()} `;
      }
    }
    return result;
  }
}
