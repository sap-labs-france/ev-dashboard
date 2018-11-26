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
    AppUnitPipe
  ]
})
export class FormattersModule {
}
