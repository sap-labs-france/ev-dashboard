import {NgModule} from '@angular/core';
import {AppKiloWattPipe} from './app-kilo-watt.pipe';
import {AppUserNamePipe} from './app-user-name.pipe';
import {AppDurationPipe} from './app-duration.pipe';
import {AppPricePipe} from './app-price.pipe';
import {AppDatePipe} from './app-date.pipe';
import {LocaleService} from '../../services/locale.service';

@NgModule({
  imports: [],
  declarations: [
    AppKiloWattPipe,
    AppUserNamePipe,
    AppDatePipe,
    AppDurationPipe,
    AppPricePipe
  ],
  exports: [
    AppKiloWattPipe,
    AppUserNamePipe,
    AppDatePipe,
    AppDurationPipe,
    AppPricePipe
  ],
  providers: [
    LocaleService,
    AppKiloWattPipe,
    AppUserNamePipe,
    AppDatePipe,
    AppDurationPipe,
    AppPricePipe
  ]
})
export class FormattersModule {
}
