import {NgModule} from '@angular/core';
import {AppKiloWattPipe} from './app-kilo-watt.pipe';
import {AppUserNamePipe} from './app-user-name.pipe';
import {AppDateTimePipe} from './app-date-time.pipe';
import {AppDurationPipe} from './app-duration.pipe';
import {AppPricePipe} from './app-price.pipe';
import {LocaleService} from '../../services/locale.service';

@NgModule({
  imports: [],
  declarations: [
    AppKiloWattPipe,
    AppUserNamePipe,
    AppDateTimePipe,
    AppDurationPipe,
    AppPricePipe
  ],
  exports: [
  ],
  providers: [
    LocaleService
  ]
})
export class FormattersModule {
}
