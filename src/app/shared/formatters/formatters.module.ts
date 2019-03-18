import {NgModule} from '@angular/core';
import {AppUserNamePipe} from './app-user-name.pipe';
import {AppDurationPipe} from './app-duration.pipe';
import {AppDatePipe} from './app-date.pipe';
import {AppArrayToStringPipe} from './app-array-to-string.pipe';
import {AppConnectorIdPipe} from './app-connector-id.pipe';
import {AppConnectorTypePipe} from './app-connector-type.pipe';
import {AppConnectorErrorCodePipe} from './app-connector-error-code.pipe';
import {AppUnitPipe} from './app-unit.pipe';
import {LocaleService} from '../../services/locale.service';
import {AppBatteryPercentagePipe} from './app-battery-percentage.pipe';

@NgModule({
  imports: [],
  declarations: [
    AppArrayToStringPipe,
    AppUserNamePipe,
    AppDatePipe,
    AppDurationPipe,
    AppConnectorIdPipe,
    AppConnectorTypePipe,
    AppConnectorErrorCodePipe,
    AppBatteryPercentagePipe,
    AppUnitPipe
  ],
  exports: [
    AppArrayToStringPipe,
    AppUserNamePipe,
    AppDatePipe,
    AppDurationPipe,
    AppConnectorIdPipe,
    AppConnectorTypePipe,
    AppConnectorErrorCodePipe,
    AppBatteryPercentagePipe,
    AppUnitPipe
  ],
  providers: [
    LocaleService,
    AppArrayToStringPipe,
    AppUserNamePipe,
    AppDatePipe,
    AppDurationPipe,
    AppConnectorIdPipe,
    AppConnectorTypePipe,
    AppConnectorErrorCodePipe,
    AppBatteryPercentagePipe,
    AppUnitPipe
  ]
})
export class FormattersModule {
}
