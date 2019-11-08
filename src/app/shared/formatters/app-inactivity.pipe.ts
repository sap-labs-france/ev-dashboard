import { PercentPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { LocaleService } from '../../services/locale.service';
import { AppDurationPipe } from '../../shared/formatters/app-duration.pipe';

@Pipe({ name: 'appInactivity' })
export class AppInactivityPipe implements PipeTransform {
  private readonly locale: string;
  private percentPipe: PercentPipe;
  private appDurationPipe: AppDurationPipe;  

  constructor(localeService: LocaleService) {
    this.locale = localeService.getCurrentLocaleJS();
    this.percentPipe = new PercentPipe(this.locale);
    this.appDurationPipe = new AppDurationPipe(localeService);
  }

  transform(totalInactivitySecs: number, totalDurationSecs?: number): string {
    if(totalDurationSecs) {
      const percentage = totalDurationSecs > 0 ? (totalInactivitySecs / totalDurationSecs) : 0;
      return this.appDurationPipe.transform(totalInactivitySecs) +
        ` (${this.percentPipe.transform(percentage, '1.0-0')})`; 
    } else {
      return this.appDurationPipe.transform(totalInactivitySecs);
    }
  }
}
