import {NgModule} from '@angular/core';
import {AppKiloUnitPipe} from './app-kilo-unit.pipe';
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
    AppKiloUnitPipe,
    AppDurationPipe
  ],
  exports: [
    AppUserNamePipe,
    AppDatePipe,
    AppDateTimePipe,
    AppDurationPipe,
    AppKiloUnitPipe
  ],providers: [
    LocaleService,
    AppUserNamePipe,
    AppDatePipe,
    AppDateTimePipe,
    AppDurationPipe,
    AppKiloUnitPipe
  ]
})
export class FormattersModule {
}
