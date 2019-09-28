import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { Observable } from 'rxjs';
import { DataResult, Site, TableColumnDef, TableDef } from '../../../common.types';
import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { Utils } from '../../../utils/Utils';
import { DialogTableDataSource } from '../dialog-table-data-source';

@Injectable()
export class SitesDialogTableDataSource extends DialogTableDataSource<Site> {
  constructor(
      private messageService: MessageService,
      public spinnerService: SpinnerService,
      private router: Router,
      private centralServerService: CentralServerService) {
    super(spinnerService);
    // Init
    this.initDataSource();
  }

 public loadDataImpl(): Observable<DataResult<Site>> {
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

  buildTableDef(): TableDef {
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

  buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'name',
        name: 'sites.name',
        class: 'text-left col-600px',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'address.city',
        name: 'general.city',
        class: 'text-left col-350px',
      },
      {
        id: 'address.country',
        name: 'general.country',
        class: 'text-left col-300px',
      },
    ];
  }
}
