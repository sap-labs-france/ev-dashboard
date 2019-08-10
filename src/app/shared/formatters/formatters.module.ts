import { NgModule } from '@angular/core';
import { LocaleService } from '../../services/locale.service';
import { AppArrayToStringPipe } from './app-array-to-string.pipe';
import { AppBatteryPercentagePipe } from './app-battery-percentage.pipe';
import { AppConnectorErrorCodePipe } from './app-connector-error-code.pipe';
import { AppConnectorIdPipe } from './app-connector-id.pipe';
import { AppConnectorTypePipe } from './app-connector-type.pipe';
import { AppCurrencyPipe } from './app-currency.pipe';
import { AppDatePipe } from './app-date.pipe';
import { AppDurationPipe } from './app-duration.pipe';
import { AppFormatRowCellPipe } from './app-format-row-cell.pipe';
import { AppUnitPipe } from './app-unit.pipe';
import { AppUserMultipleRolesPipe } from './app-user-multiple-roles.pipe';
import { AppUserNamePipe } from './app-user-name.pipe';

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
    AppFormatRowCellPipe,
    AppUnitPipe,
    AppCurrencyPipe,
    AppUserMultipleRolesPipe
  ],
  exports: [
    AppArrayToStringPipe,
    AppUserNamePipe,
    AppDatePipe,
    AppDurationPipe,
    AppConnectorIdPipe,
    AppFormatRowCellPipe,
    AppConnectorTypePipe,
    AppConnectorErrorCodePipe,
    AppBatteryPercentagePipe,
    AppUnitPipe,
    AppCurrencyPipe,
    AppUserMultipleRolesPipe
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
    AppUnitPipe,
    AppCurrencyPipe,
    AppUserMultipleRolesPipe
  ]
})
export class FormattersModule {
}
