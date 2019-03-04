import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {SiteArea, TableColumnDef} from '../../../common.types';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {Utils} from '../../../utils/Utils';
import {DialogTableDataSource} from '../dialog-table-data-source';

export class SiteAreasDataSourceTable extends DialogTableDataSource<SiteArea> {
  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private centralServerService: CentralServerService) {
    super();
  }

  loadData() {
    // Get data
    this.centralServerService.getSiteAreas(this.getFilterValues(),
      this.getPaging(), this.getOrdering()).subscribe((siteAreas) => {
      // Set number of records
      this.setNumberOfRecords(siteAreas.count);
      // Update page length (number of siteAreas is in User)
      this.updatePaginator();
      this.setData(siteAreas.result);
    }, (error) => {
      // No longer exists!
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
        this.translateService.instant('general.error_backend'));
    });
  }

  getTableColumnDefs(): TableColumnDef[] {
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
