import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {SiteArea, TableColumnDef} from '../../../common.types';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {SpinnerService} from 'app/services/spinner.service';
import {Utils} from '../../../utils/Utils';
import {DialogTableDataSource} from '../dialog-table-data-source';

export class SiteAreasDataSourceTable extends DialogTableDataSource<SiteArea> {
  constructor(
      private messageService: MessageService,
      private translateService: TranslateService,
      private router: Router,
      private centralServerService: CentralServerService,
      private spinnerService: SpinnerService) {
    super();
    // Init
    this.initDataSource();
  }

 public loadData(refreshAction = false): Observable<any> {
    // Show spinner
    this.spinnerService.show();
    const filterValues = this.buildFilterValues();
    filterValues['WithSite'] = true;
    this.centralServerService.getSiteAreas(filterValues,
      this.buildPaging(), this.buildOrdering()).subscribe((siteAreas) => {
        // Hide spinner
        this.spinnerService.hide();
        // Set number of records
        this.setNumberOfRecords(siteAreas.count);
        // Update page length (number of sites is in User)
        this.updatePaginator();
        this.setData(siteAreas.result);
      }, (error) => {
        // Hide spinner
        this.spinnerService.hide();
        // No longer exists!
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
      });
  }

  buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'name',
        name: this.translateService.instant('site_areas.name'),
        class: 'text-left col-50p',
        sorted: true,
        direction: 'asc',
        sortable: true
      },
      {
        id: 'address.city',
        name: this.translateService.instant('general.city'),
        class: 'text-left col-25p'
      },
      {
        id: 'address.country',
        name: this.translateService.instant('general.country'),
        class: 'text-left col-20p'
      }
    ];
  }
}
