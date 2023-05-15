import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ComponentService } from 'services/component.service';
import { TenantComponents } from 'types/Tenant';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { DataResult } from '../../../types/DataResult';
import { SiteArea } from '../../../types/SiteArea';
import { TableColumnDef, TableDef } from '../../../types/Table';
import { Utils } from '../../../utils/Utils';
import { DialogTableDataSource } from '../dialog-table-data-source';

@Injectable()
export class SiteAreasDialogTableDataSource extends DialogTableDataSource<SiteArea> {
  private siteIDs!: string;

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private componentService: ComponentService
  ) {
    super(spinnerService, translateService);
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
      filterValues['WithSite'] = 'true';
      if (this.siteIDs) {
        filterValues['SiteID'] = this.siteIDs;
      }
      this.centralServerService
        .getSiteAreas(filterValues, this.getPaging(), this.getSorting())
        .subscribe({
          next: (siteAreas) => {
            observer.next(siteAreas);
            observer.complete();
          },
          error: (error) => {
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'general.error_backend'
            );
            observer.error(error);
          },
        });
    });
  }

  public buildTableDef(): TableDef {
    return {
      class: 'table-dialog-list',
      rowSelection: {
        enabled: true,
        multiple: true,
      },
      search: {
        enabled: true,
      },
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'name',
        name: 'site_areas.title',
        class: 'text-left col-20p',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'smartCharging',
        name: 'site_areas.smart_charging',
        headerClass: 'col-10p text-center',
        class: 'col-10p text-center',
        formatter: (smartCharging: boolean) =>
          Utils.displayYesNo(this.translateService, smartCharging),
        visible: this.componentService.isActive(TenantComponents.SMART_CHARGING),
      },
      {
        id: 'address.address1',
        name: 'general.address',
        headerClass: 'col-35p',
        class: 'col-20p',
        sortable: true,
      },
      {
        id: 'address.city',
        name: 'general.city',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
      },
      {
        id: 'address.country',
        name: 'general.country',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
      },
      {
        id: 'site.name',
        name: 'sites.title',
        class: 'text-left col-20p',
        direction: 'asc',
      },
    ];
  }
}
