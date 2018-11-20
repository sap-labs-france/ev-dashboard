import {NgModule} from '@angular/core';
import {AppKiloWattPipe} from './app-kilo-watt.pipe';
import {AppUserNamePipe} from './app-user-name.pipe';
import {AppDateTimePipe} from './app-date-time.pipe';
import {AppDurationPipe} from './app-duration.pipe';
import {AppPricePipe} from './app-price.pipe';
import {AppDatePipe} from './app-date.pipe';
import {AppConnectorIdPipe} from "./app-connector-id.pipe";
import {AppConnectorTypePipe} from "./app-connector-type.pipe";
import {AppConnectorErrorCodePipe} from "./app-connector-error-code.pipe";

@NgModule({
  imports: [],
  declarations: [
    AppKiloWattPipe,
    AppUserNamePipe,
    AppDatePipe,
    AppDateTimePipe,
    AppDurationPipe,
    AppPricePipe,
    AppConnectorIdPipe,
    AppConnectorTypePipe,
    AppConnectorErrorCodePipe
  ],
  exports: [
    AppKiloWattPipe,
    AppUserNamePipe,
    AppDatePipe,
    AppDateTimePipe,
    AppDurationPipe,
    AppPricePipe,
    AppConnectorIdPipe,
    AppConnectorTypePipe,
    AppConnectorErrorCodePipe
  ],
  providers: [
    AppKiloWattPipe,
    AppUserNamePipe,
    AppDatePipe,
    AppDateTimePipe,
    AppDurationPipe,
    AppPricePipe,
    AppConnectorIdPipe,
    AppConnectorTypePipe,
    AppConnectorErrorCodePipe
  ]
})
export class FormattersModule {
}
