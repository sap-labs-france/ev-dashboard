import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { DataResult } from '../../../types/DataResult';
import { RefundReport } from '../../../types/Refund';
import { TableColumnDef, TableDef } from '../../../types/Table';
import { Utils } from '../../../utils/Utils';
import { AppUserNamePipe } from '../../formatters/app-user-name.pipe';
import { DialogTableDataSource } from '../dialog-table-data-source';

@Injectable()
export class ReportsDialogTableDataSource extends DialogTableDataSource<RefundReport> {
  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private centralServerService: CentralServerService,
    private appUserNamePipe: AppUserNamePipe
  ) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<RefundReport>> {
    return new Observable((observer) => {
      const filters = this.buildFilterValues();
      filters['MinimalPrice'] = '0';
      this.centralServerService
        .getRefundReports(filters, this.getPaging(), this.getSorting())
        .subscribe({
          next: (report) => {
            observer.next(report);
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
      rowFieldNameIdentifier: 'id',
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
        id: 'id',
        name: 'transactions.reportId',
        class: 'text-left col-50p',
        sortable: true,
      },
      {
        id: 'user',
        name: 'general.search_user',
        class: 'text-left col-50p',
        formatter: (value) => this.appUserNamePipe.transform(value),
      },
    ];
  }
}
