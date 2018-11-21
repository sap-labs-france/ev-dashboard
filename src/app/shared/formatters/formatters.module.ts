import {NgModule} from '@angular/core';
import {AppKiloWattPipe} from './app-kilo-watt.pipe';
import {AppUserNamePipe} from './app-user-name.pipe';
import {AppDurationPipe} from './app-duration.pipe';
import {AppPricePipe} from './app-price.pipe';
import {AppDatePipe} from './app-date.pipe';
import {AppArrayToStringPipe} from './app-array-to-string.pipe';
import {LocaleService} from '../../services/locale.service';

@NgModule({
  imports: [],
  declarations: [
    AppArrayToStringPipe,
    AppKiloWattPipe,
    AppUserNamePipe,
    AppDatePipe,
    AppDurationPipe,
    AppPricePipe
  ],
  exports: [
    AppArrayToStringPipe,
    AppKiloWattPipe,
    AppUserNamePipe,
    AppDatePipe,
    AppDurationPipe,
    AppPricePipe
  ],
  providers: [
    LocaleService,
    AppArrayToStringPipe,
    AppKiloWattPipe,
    AppUserNamePipe,
    AppDatePipe,
    AppDurationPipe,
    AppPricePipe
  ]
})
export class FormattersModule {
}
