import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { WindowService } from 'services/window.service';
import { TransactionDialogComponent } from 'shared/dialogs/transaction/transaction-dialog.component';
import { TableViewTransactionAction, TableViewTransactionActionDef, TransactionDialogData } from 'shared/table/actions/transactions/table-view-transaction-action';
import { DateRangeTableFilter } from 'shared/table/filters/date-range-table-filter';
import { BillingTransfer, BillingTransferSession, TransferButtonAction } from 'types/Billing';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ConsumptionChartDetailComponent } from '../../../shared/component/consumption-chart/consumption-chart-detail.component';
import { AppCurrencyPipe } from '../../../shared/formatters/app-currency.pipe';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { AppUnitPipe } from '../../../shared/formatters/app-unit.pipe';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { DataResult, TransactionRefundDataResult } from '../../../types/DataResult';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import { Transaction, TransactionButtonAction } from '../../../types/Transaction';
import { Constants } from '../../../utils/Constants';
import { Utils } from '../../../utils/Utils';
import { TransfersStatusFilter } from '../filters/transfers-status-filter';
import { TransferStatusFormatterComponent } from '../formatters/transfer-status-formatter.component';

@Injectable()
export class TransfersTableDataSource extends TableDataSource<BillingTransfer> {
  private viewAction = new TableViewTransactionAction().getActionDef();

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private datePipe: AppDatePipe,
    private appUnitPipe: AppUnitPipe,
    private appCurrencyPipe: AppCurrencyPipe,
    private windowService: WindowService) {
    super(spinnerService, translateService);
    // Load settings
    // this.loadSettings();
    // Init
    this.setStaticFilters([{
      WithUser: true,
    }]);
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<BillingTransfer>> {
    return new Observable((observer) => {
      const filters = this.buildFilterValues();
      this.centralServerService.getTransfers(filters, this.getPaging(), this.getSorting())
        .subscribe((transfers) => {
          observer.next(transfers);
          observer.complete();
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          observer.error(error);
        });
    });
  }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: true,
      },
      rowSelection: {
        enabled: true, // enabled: this.refundTransactionEnabled,
        multiple: false, // multiple: this.refundTransactionEnabled,
      },
      rowDetails: {
        enabled: false,
        angularComponent: ConsumptionChartDetailComponent,
      },
    };
  }

  public buildTableFooterStats(data: TransactionRefundDataResult): string {
    // All records has been retrieved
    if (data.count !== Constants.INFINITE_RECORDS) {
    }
    return '';
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const columns: TableColumnDef[] = [];
    columns.push(
      {
        id: 'status',
        name: 'general.status',
        isAngularComponent: true,
        angularComponent: TransferStatusFormatterComponent,
        headerClass: 'col-10p text-center',
        class: 'col-10p table-cell-angular-big-component',
        sortable: true,
      },
      {
        id: 'id',
        name: 'transfers.id',
        headerClass: 'col-20p',
        class: 'col-20p',
        sorted: true,
        sortable: true,
        direction: 'desc',
      },
      {
        id: 'accountID',
        name: 'transfers.accountID',
        headerClass: 'col-20p',
        class: 'col-20p',
        sorted: true,
        sortable: true,
        direction: 'desc',
      },
      {
        id: 'amount',
        name: 'transfers.amount',
        formatter: (amount: number, transfer: BillingTransfer) => this.appCurrencyPipe.transform(amount), /* TODO - , transfer.currency.toUpperCase()), */
        headerClass: 'col-10p',
        class: 'col-10p',
        sortable: true,
      },
      {
        id: 'transferAmount',
        name: 'transfers.transferAmount',
        formatter: (amount: number, transfer: BillingTransfer) => this.appCurrencyPipe.transform(amount), /* TODO - , transfer.currency.toUpperCase()), */
        headerClass: 'col-10p',
        class: 'col-10p',
        sortable: true,
      },
      {
        id: 'sessions',
        name: 'transfers.number_of_items',
        formatter: (sessions: BillingTransferSession[], invoice: BillingTransfer) => sessions?.length?.toString(),
        headerClass: 'col-10p text-center',
        class: 'col-10p text-center',
        sortable: false,
      },
      {
        id: 'externalTransferID',
        name: 'transfers.externalTransferID',
        headerClass: 'col-20p',
        class: 'col-20p',
        sorted: true,
        sortable: true,
        direction: 'desc',
      },
    );
    return columns;
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    const filters: TableFilterDef[] = [
      new DateRangeTableFilter({
        translateService: this.translateService
      }).getFilterDef(),
      new TransfersStatusFilter().getFilterDef(),
    ];
    return filters;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    // tableActionsDef.unshift(this.exportTransactionsAction);
    // if (this.refundTransactionEnabled) {
    //   tableActionsDef.unshift(
    //     this.refundTransactionsAction,
    //     this.openURLRefundAction,
    //   );
    //   if (this.isAdmin) {
    //     tableActionsDef.unshift(
    //       this.syncRefundAction,
    //     );
    //   }
    // }
    return tableActionsDef;
  }

  public actionTriggered(actionDef: TableActionDef) {
    switch (actionDef.id) {
      // case TransferButtonAction.EXPORT_TRANSFERS:
      //   if (actionDef.action) {
      //     (actionDef as TableExportTransfersActionDef).action(this.buildFilterValues(), this.dialogService,
      //       this.translateService, this.messageService, this.centralServerService, this.router,
      //       this.spinnerService);
      //   }
      // break;
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableRowActions(): TableActionDef[] {
    return [
      this.viewAction
    ];
  }

  public rowActionTriggered(actionDef: TableActionDef, transaction: Transaction) {
    switch (actionDef.id) {
      case TransactionButtonAction.VIEW_TRANSACTION:
        if (actionDef.action) {
          (actionDef as TableViewTransactionActionDef).action(TransactionDialogComponent, this.dialog,
            { dialogData: { transactionID: transaction.id } as TransactionDialogData },
            this.refreshData.bind(this));
        }
        break;
    }
  }

  public isSelectable(row: BillingTransfer) {
    return true;
  }
}
