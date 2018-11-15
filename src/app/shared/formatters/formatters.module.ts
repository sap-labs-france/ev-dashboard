import {NgModule} from '@angular/core';
import {AppKiloWattPipe} from './app-kilo-watt.pipe';
import {AppUserNamePipe} from './app-user-name.pipe';
import {AppDateTimePipe} from './app-date-time.pipe';
import {AppDurationPipe} from './app-duration.pipe';
import {AppPricePipe} from './app-price.pipe';
import {AppArrayToStringPipe} from './app-array-to-string.pipe';
import {AppDatePipe} from './app-date.pipe';

@NgModule({
  imports: [],
  declarations: [
    AppArrayToStringPipe,
    AppKiloWattPipe,
    AppUserNamePipe,
    AppDatePipe,
    AppDateTimePipe,
    AppDurationPipe,
    AppPricePipe
  ],
  exports: [
  ],
  providers: [
    AppArrayToStringPipe,
    AppKiloWattPipe,
    AppUserNamePipe,
    AppDatePipe,
    AppDateTimePipe,
    AppDurationPipe,
    AppPricePipe
  ]
})
export class FormattersModule {
}
