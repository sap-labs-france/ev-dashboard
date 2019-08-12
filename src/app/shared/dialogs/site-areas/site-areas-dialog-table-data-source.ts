import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { Observable } from 'rxjs';
import { DataResult, SiteArea, TableColumnDef, TableDef } from '../../../common.types';
import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { Utils } from '../../../utils/Utils';
import { DialogTableDataSource } from '../dialog-table-data-source';

@Injectable()
export class SiteAreasDialogTableDataSource extends DialogTableDataSource<SiteArea> {
  private siteIDs: string;
  constructor(
      public spinnerService: SpinnerService,
      private messageService: MessageService,
      private router: Router,
      private centralServerService: CentralServerService,
      private authorizationService: AuthorizationService) {
    super(spinnerService);
    // Init
    this.initDataSource();
  }

  public setSitesAdminOnly(sitesAdminOnly: boolean) {
    if (sitesAdminOnly) {
      this.siteIDs = this.authorizationService.getSitesAdmin().join('|');
    } else {
      this.siteIDs = '';
    }
    this.initDataSource(true);
  }

 public loadDataImpl(): Observable<DataResult<SiteArea>> {
    return new Observable((observer) => {
      const filterValues = this.buildFilterValues();
      filterValues['WithSite'] = true;
      if (this.siteIDs) {
        filterValues['SiteID'] = this.siteIDs;
      }

      this.centralServerService.getSiteAreas(filterValues,
        this.getPaging(), this.getSorting()).subscribe((siteAreas) => {
          // Ok
          observer.next(siteAreas);
          observer.complete();
        }, (error) => {
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
        multiple: true
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
        name: 'site_areas.title',
        class: 'text-left col-600px',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'site',
        name: 'sites.title',
        class: 'text-left col-600px',
        direction: 'asc',
        sortable: true,
        formatter: (name, row: SiteArea) => `${row.site.name}`
      }
    ];
  }
}
