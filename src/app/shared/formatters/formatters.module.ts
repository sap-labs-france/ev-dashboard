import {NgModule} from '@angular/core';
import {AppUnitPipe} from './app-unit.pipe';
import {AppUserNamePipe} from './app-user-name.pipe';
import {AppDurationPipe} from './app-duration.pipe';
import {LocaleService} from '../../services/locale.service';
import {AppDatePipe} from './app-date.pipe';

@NgModule({
  imports: [],
  declarations: [
    AppUserNamePipe,
    AppDatePipe,
    AppUnitPipe,
    AppDurationPipe
  ],
  exports: [
    AppUserNamePipe,
    AppDatePipe,
    AppDurationPipe,
    AppUnitPipe,
  ], providers: [
    LocaleService,
    AppUserNamePipe,
    AppDatePipe,
    AppUnitPipe,
    AppDurationPipe
  ]
})
export class FormattersModule {
}
