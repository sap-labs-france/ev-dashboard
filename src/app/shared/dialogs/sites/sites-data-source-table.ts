import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'app/services/spinner.service';
import { Observable } from 'rxjs';
import { Site, TableColumnDef, TableDef } from '../../../common.types';
import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { Utils } from '../../../utils/Utils';
import { DialogTableDataSource } from '../dialog-table-data-source';

@Injectable()
export class SitesDataSource extends DialogTableDataSource<Site> {
  constructor(
      public spinnerService: SpinnerService,
      private messageService: MessageService,
      private translateService: TranslateService,
      private router: Router,
      private centralServerService: CentralServerService) {
    super(spinnerService);
    // Init
    this.initDataSource();
  }

 public loadDataImpl(): Observable<any> {
    return new Observable((observer) => {
      // Get data
      this.centralServerService.getSites(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((sites) => {
          // Ok
          observer.next(sites);
          observer.complete();
        }, (error) => {
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
        });
    });
  }

  public buildTableDef(): TableDef {
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
        name: this.translateService.instant('sites.name'),
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
