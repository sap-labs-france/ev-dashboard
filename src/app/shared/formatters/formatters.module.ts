import { NgModule } from '@angular/core';

import { LocaleService } from '../../services/locale.service';
import { AppArrayToStringPipe } from './app-array-to-string.pipe';
import { AppBatteryPercentagePipe } from './app-battery-percentage.pipe';
import { AppCarCatalogNamePipe } from './app-car-catalog-name.pipe';
import { AppColorByStatusPipe } from './app-color-by-status.pipe';
import { AppConnectorErrorCodePipe } from './app-connector-error-code.pipe';
import { AppConnectorIdPipe } from './app-connector-id.pipe';
import { AppConnectorTypeSelectionPipe } from './app-connector-type-selection.pipe';
import { AppConnectorTypePipe } from './app-connector-type.pipe';
import { AppCurrencyPipe } from './app-currency.pipe';
import { AppDatePipe } from './app-date.pipe';
import { AppDayPipe } from './app-day.pipe';
import { AppDecimalPipe } from './app-decimal.pipe';
import { AppDurationPipe } from './app-duration.pipe';
import { AppFormatRowCellPipe } from './app-format-row-cell.pipe';
import { AppInactivityPipe } from './app-inactivity.pipe';
import { AppPercentPipe } from './app-percent.pipe';
import { AppPricingDimensionsUnit } from './app-pricing-dimensions-unit.pipe';
import { AppPricingDimensionsPrice } from './app-pricing-dimensions.price.pipe';
import { AppTaxName } from './app-tax-name.pipe';
import { AppUnitPipe } from './app-unit.pipe';
import { AppUserMultipleRolesPipe } from './app-user-multiple-roles.pipe';
import { AppUserNamePipe } from './app-user-name.pipe';

@NgModule({
  imports: [],
  declarations: [
    AppArrayToStringPipe,
    AppUserNamePipe,
    AppCarCatalogNamePipe,
    AppDatePipe,
    AppDecimalPipe,
    AppDurationPipe,
    AppConnectorIdPipe,
    AppConnectorTypePipe,
    AppConnectorTypeSelectionPipe,
    AppConnectorErrorCodePipe,
    AppBatteryPercentagePipe,
    AppInactivityPipe,
    AppFormatRowCellPipe,
    AppUnitPipe,
    AppCurrencyPipe,
    AppColorByStatusPipe,
    AppUserMultipleRolesPipe,
    AppPercentPipe,
    AppTaxName,
    AppPricingDimensionsUnit,
    AppPricingDimensionsPrice,
    AppDayPipe,
  ],
  exports: [
    AppArrayToStringPipe,
    AppUserNamePipe,
    AppCarCatalogNamePipe,
    AppDatePipe,
    AppDecimalPipe,
    AppDurationPipe,
    AppConnectorIdPipe,
    AppFormatRowCellPipe,
    AppConnectorTypePipe,
    AppConnectorTypeSelectionPipe,
    AppConnectorErrorCodePipe,
    AppBatteryPercentagePipe,
    AppInactivityPipe,
    AppUnitPipe,
    AppCurrencyPipe,
    AppColorByStatusPipe,
    AppUserMultipleRolesPipe,
    AppPercentPipe,
    AppTaxName,
    AppPricingDimensionsUnit,
    AppPricingDimensionsPrice,
    AppDayPipe,
  ],
  providers: [
    LocaleService,
    AppArrayToStringPipe,
    AppUserNamePipe,
    AppCarCatalogNamePipe,
    AppDatePipe,
    AppDecimalPipe,
    AppDurationPipe,
    AppConnectorIdPipe,
    AppConnectorTypePipe,
    AppConnectorTypeSelectionPipe,
    AppConnectorErrorCodePipe,
    AppBatteryPercentagePipe,
    AppUnitPipe,
    AppCurrencyPipe,
    AppUserMultipleRolesPipe,
    AppInactivityPipe,
    AppPercentPipe,
    AppColorByStatusPipe,
    AppTaxName,
    AppPricingDimensionsUnit,
    AppPricingDimensionsPrice,
    AppDayPipe,
  ],
})
export class FormattersModule {}
