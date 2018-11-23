import {NgModule} from '@angular/core';
import {AppKiloWattPipe} from './app-kilo-watt.pipe';
import {AppUserNamePipe} from './app-user-name.pipe';
import {AppDurationPipe} from './app-duration.pipe';
import {AppPricePipe} from './app-price.pipe';
import {AppDatePipe} from './app-date.pipe';
import {AppConnectorIdPipe} from "./app-connector-id.pipe";
import {AppConnectorTypePipe} from "./app-connector-type.pipe";
import {AppConnectorErrorCodePipe} from "./app-connector-error-code.pipe";
import {AppUnitPipe} from "./app-unit.pipe";
import {LocaleService} from '../../services/locale.service';

@NgModule({
  imports: [],
  declarations: [
    AppKiloWattPipe,
    AppUserNamePipe,
    AppDatePipe,
    AppDurationPipe,
    AppPricePipe,
    AppConnectorIdPipe,
    AppConnectorTypePipe,
    AppConnectorErrorCodePipe,
    AppUnitPipe
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
    AppPricePipe,
    AppConnectorIdPipe,
    AppConnectorTypePipe,
    AppConnectorErrorCodePipe,
    AppUnitPipe
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
    AppConnectorErrorCodePipe,
    AppUnitPipe
  ]
})
export class FormattersModule {
}
