import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { Observable } from 'rxjs';
import { DataResult, TableColumnDef, Transaction } from '../../../common.types';
import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { Utils } from '../../../utils/Utils';
import { AppUserNamePipe } from '../../formatters/app-user-name.pipe';
import { DialogTableDataSource } from '../dialog-table-data-source';

@Injectable()
export class ReportsDialogTableDataSource extends DialogTableDataSource<Transaction> {
  constructor(
      public spinnerService: SpinnerService,
      private messageService: MessageService,
      private router: Router,
      private centralServerService: CentralServerService,
      private appUserNamePipe: AppUserNamePipe) {
    super(spinnerService);
    // Init
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<Transaction>> {
    return new Observable((observer) => {
      // Get data
      const filters = this.buildFilterValues();
      filters['MinimalPrice'] = '0';
      this.centralServerService.getRefundReports(filters,
        this.getPaging(), this.getSorting()).subscribe((transaction) => {
          // Ok
          observer.next(transaction);
          observer.complete();
        }, (error) => {
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
        });
    });
  }

  buildTableColumnDefs(): TableColumnDef[] {
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
