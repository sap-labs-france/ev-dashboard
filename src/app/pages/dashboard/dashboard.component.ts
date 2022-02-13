import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'services/spinner.service';
import { FiltersService } from 'shared/filters/filters.service';
import { FilterHttpIDs } from 'types/Filters';
import { AssetInErrorType } from 'types/InError';

import { FilterIDs } from '../../types/Filters';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.component.html',
})
export class DashboardComponent {

  public constructor(
    private spinnerService: SpinnerService,
    private filtersService: FiltersService,
    private translateService: TranslateService,
  ) {
    this.filtersService.setFilterList([
      FilterIDs.ISSUER,
      FilterIDs.COMPANY,
      FilterIDs.SITE,
      FilterIDs.SITE_AREA,
      FilterIDs.CHARGING_STATION,
      FilterIDs.STATUS,
      FilterIDs.CONNECTOR,
      FilterIDs.ERROR_TYPE,
      FilterIDs.CAR_MAKER,
      FilterIDs.REPORTS,
      FilterIDs.TAG,
      FilterIDs.USER,
      FilterIDs.DATE_RANGE,
    ], {
      [FilterIDs.ERROR_TYPE]: [
        {
          key: AssetInErrorType.MISSING_SITE_AREA,
          value: this.translateService.instant(`assets.errors.${AssetInErrorType.MISSING_SITE_AREA}.title`),
        }
      ]
    })
    this.spinnerService.hide();
  }

  public initFiltersDef(): void {

  }

}
