import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { Company } from 'app/types/Company';
import { DataResult } from 'app/types/DataResult';
import { TableColumnDef, TableDef } from 'app/types/Table';
import { Observable } from 'rxjs';
import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { Utils } from '../../../utils/Utils';
import { DialogTableDataSource } from '../dialog-table-data-source';

@Injectable()
export class CompaniesDialogTableDataSource extends DialogTableDataSource<Company> {
  constructor(
      public spinnerService: SpinnerService,
      private messageService: MessageService,
      private router: Router,
      private centralServerService: CentralServerService) {
    super(spinnerService);
    // Init
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<Company>> {
  return new Observable((observer) => {
    // Get data
    this.centralServerService.getCompanies(this.buildFilterValues(),
      this.getPaging(), this.getSorting()).subscribe((companies) => {
        // Ok
        observer.next(companies);
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
        multiple: false,
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
        name: 'companies.name',
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
