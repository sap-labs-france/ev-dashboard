import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { Company } from '../../../types/Company';
import { DataResult } from '../../../types/DataResult';
import { TableColumnDef, TableDef } from '../../../types/Table';
import { Utils } from '../../../utils/Utils';
import { DialogTableDataSource } from '../dialog-table-data-source';

@Injectable()
export class CompaniesDialogTableDataSource extends DialogTableDataSource<Company> {
  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private centralServerService: CentralServerService
  ) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<Company>> {
    return new Observable((observer) => {
      this.centralServerService
        .getCompanies(this.buildFilterValues(), this.getPaging(), this.getSorting())
        .subscribe({
          next: (companies) => {
            observer.next(companies);
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
        multiple: false,
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
        name: 'companies.name',
        class: 'text-left col-20p',
        sorted: true,
        direction: 'asc',
        sortable: true,
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
        class: 'text-left col-20p',
      },
      {
        id: 'address.country',
        name: 'general.country',
        class: 'text-left col-20p',
      },
    ];
  }
}
