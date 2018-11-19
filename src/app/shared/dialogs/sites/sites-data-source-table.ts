import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {Site, TableColumnDef} from '../../../common.types';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {Utils} from '../../../utils/Utils';
import {DialogTableDataSource} from '../dialog-table-data-source';

export class SitesDataSource extends DialogTableDataSource<Site> {
  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private centralServerService: CentralServerService) {
    super();
  }

  loadData() {
    // Get data
    this.centralServerService.getSites(this.getFilterValues(),
      this.getPaging(), this.getOrdering()).subscribe((sites) => {
      // Set number of records
      this.setNumberOfRecords(sites.count);
      // Update page length (number of sites is in User)
      this.updatePaginator();
      // Return sites
      this.getDataSubjet().next(sites.result);
      // Keep it
      this.setData(sites.result);
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
        name: this.translateService.instant('sites.name'),
        class: 'text-left col-600px',
        sorted: true,
        direction: 'asc',
        sortable: true
      },
      {
        id: 'address.city',
        name: this.translateService.instant('general.city'),
        class: 'text-left col-350px'
      },
      {
        id: 'address.country',
        name: this.translateService.instant('general.country'),
        class: 'text-left col-300px'
      }
    ];
  }
}
