import {NgModule} from '@angular/core';
import {AppKiloUnitPipe} from './app-kilo-unit.pipe';
import {AppUserNamePipe} from './app-user-name.pipe';
import {AppDateTimePipe} from './app-date-time.pipe';
import {AppDurationPipe} from './app-duration.pipe';
import {LocaleService} from '../../services/locale.service';

@NgModule({
  imports: [],
  declarations: [
    AppUserNamePipe,
    AppDateTimePipe,
    AppKiloUnitPipe,
    AppDurationPipe
  ],
  exports: [
  ],
  providers: [
    LocaleService,
    AppUserNamePipe,
    AppDateTimePipe,
    AppKiloUnitPipe,
    AppDurationPipe
  ]
})
export class FormattersModule {
}
