import { PercentPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

import { LocaleService } from '../../services/locale.service';

@Pipe({ name: 'appPercent' })
export class AppPercentPipe implements PipeTransform {
  private percentPipe!: PercentPipe;

  public constructor(private localeService: LocaleService) {
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.percentPipe = new PercentPipe(locale.currentLocaleJS);
    });
  }

  public transform(value: number, digitsInfo?: string): string | null {
    return this.percentPipe.transform(value, digitsInfo);
  }
}
