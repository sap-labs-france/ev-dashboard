import {NgModule} from '@angular/core';
import {AppUnitPipe} from './app-unit.pipe';
import {AppUserNamePipe} from './app-user-name.pipe';
import {AppDateTimePipe} from './app-date-time.pipe';
import {AppDurationPipe} from './app-duration.pipe';
import {LocaleService} from '../../services/locale.service';
import {AppDatePipe} from './app-date.pipe';

@NgModule({
  imports: [],
  declarations: [
    AppUserNamePipe,
    AppDatePipe,
    AppDateTimePipe,
    AppUnitPipe,
    AppDurationPipe
  ],
  exports: [
    AppUserNamePipe,
    AppDatePipe,
    AppDateTimePipe,
    AppDurationPipe,
    AppUnitPipe,
  ], providers: [
    LocaleService,
    AppUserNamePipe,
    AppDatePipe,
    AppDateTimePipe,
    AppUnitPipe,
    AppDurationPipe
  ]
})
export class FormattersModule {
}
