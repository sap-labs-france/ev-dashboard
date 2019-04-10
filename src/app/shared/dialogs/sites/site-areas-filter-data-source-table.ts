import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {SiteArea, TableColumnDef, TableDef} from '../../../common.types';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {SpinnerService} from 'app/services/spinner.service';
import {Utils} from '../../../utils/Utils';
import {DialogTableDataSource} from '../dialog-table-data-source';
import { Observable } from 'rxjs';

export class SiteAreasFilterDataSourceTable extends DialogTableDataSource<SiteArea> {
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
    return new Observable((observer) => {
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
          // Ok
          observer.next(siteAreas.result);
          observer.complete();
        }, (error) => {
          // Hide spinner
          this.spinnerService.hide();
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
        });
    });
  }

  buildTableDef(): TableDef {
    return {
      class: 'table-dialog-list',
      rowSelection: {
        enabled: true,
        multiple: false
      },
      search: {
        enabled: true
      }
    };
  }

  buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'name',
        name: this.translateService.instant('site_areas.title'),
        class: 'text-left col-600px',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'site',
        name: this.translateService.instant('sites.title'),
        class: 'text-left col-600px',
        direction: 'asc',
        sortable: true,
        formatter: (name, row: SiteArea) => `${row.site.name}`
      }
    ];
  }
}
