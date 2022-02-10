import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'services/spinner.service';
import { FiltersService } from 'shared/filters/filters.service';
import { FilterHttpIDs } from 'types/Filters';
import { AssetInErrorType } from 'types/InError';

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
      FilterHttpIDs.ISSUER,
      FilterHttpIDs.STATUS,
      FilterHttpIDs.CONNECTOR,
      FilterHttpIDs.ERROR_TYPE,
      FilterHttpIDs.SITE,
      FilterHttpIDs.CAR_MAKER,
      FilterHttpIDs.CHARGING_STATION,
      FilterHttpIDs.COMPANY,
      FilterHttpIDs.REPORTS,
      FilterHttpIDs.SITE_AREA,
      FilterHttpIDs.TAG,
      FilterHttpIDs.USER,
    ], {
      [FilterHttpIDs.ERROR_TYPE]: [
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
