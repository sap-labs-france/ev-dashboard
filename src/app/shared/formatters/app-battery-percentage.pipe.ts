import {Pipe, PipeTransform} from '@angular/core';
import {LocaleService} from '../../services/locale.service';
import {PercentPipe} from '@angular/common';

@Pipe({name: 'appBatteryPercentage'})
export class AppBatteryPercentagePipe implements PipeTransform {
  private readonly locale: string;
  private percentPipe: PercentPipe;

  constructor(locale: LocaleService) {
    this.locale = locale.getCurrentFullLocaleForJS();
    this.percentPipe = new PercentPipe(this.locale);
  }

  transform(initalPercentage: number, finalPercentage?: number, withEvolution = true): any {
    let fomattedMessage = this.percentPipe.transform(initalPercentage / 100, '1.0-0');
    if (finalPercentage) {
      fomattedMessage += ` > ${this.percentPipe.transform(finalPercentage / 100, '1.0-0')}`;
      if (withEvolution) {
        fomattedMessage += ` (${this.percentPipe.transform((finalPercentage - initalPercentage) / 100, '1.0-0')})`
      }
    }
    return fomattedMessage;
  }
}
