import { PercentPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { Transaction } from 'types/Transaction';

import { Locale, LocaleService } from '../../services/locale.service';
import { AppDurationPipe } from '../../shared/formatters/app-duration.pipe';

@Pipe({ name: 'appInactivity' })
export class AppInactivityPipe implements PipeTransform {
  private locale!: string;
  private percentPipe!: PercentPipe;
  private appDurationPipe!: AppDurationPipe;

  public constructor(localeService: LocaleService) {
    // Get the locale
    localeService.getCurrentLocaleSubject().subscribe((locale: Locale) => {
      this.locale = locale.currentLocaleJS;
      this.percentPipe = new PercentPipe(this.locale);
      this.appDurationPipe = new AppDurationPipe(localeService);
    });
  }

  public transform(transaction: Transaction): string {
    let totalDurationSecs = 0;
    let totalInactivitySecs = 0;
    if (transaction.stop) {
      totalDurationSecs = transaction.stop.totalDurationSecs;
      totalInactivitySecs =
        transaction.stop.totalInactivitySecs + transaction.stop.extraInactivitySecs;
    } else {
      totalDurationSecs = transaction.currentTotalDurationSecs;
      totalInactivitySecs = transaction.currentTotalInactivitySecs;
    }
    if (totalDurationSecs) {
      const percentage = totalDurationSecs > 0 ? totalInactivitySecs / totalDurationSecs : 0;
      return (
        this.appDurationPipe.transform(totalInactivitySecs) +
        ` (${this.percentPipe.transform(percentage, '1.0-0')})`
      );
    }
    return this.appDurationPipe.transform(totalInactivitySecs);
  }
}
