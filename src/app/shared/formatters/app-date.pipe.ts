import {Pipe, PipeTransform} from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({name: 'appDate'})
export class AppDatePipe implements PipeTransform {
  transform(value: any, locale = 'en-US'): string {
    return new DatePipe(locale).transform(value, 'medium');
  }
}
