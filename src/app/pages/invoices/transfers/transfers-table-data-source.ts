import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { DialogService } from 'services/dialog.service';
import { WindowService } from 'services/window.service';
import { TableFinalizeBillingTransferAction } from 'shared/table/actions/invoices/table-finalize-billing-transfer-action';
import { TableSendBillingTransferAction } from 'shared/table/actions/invoices/table-send-billing-transfer-action';
import { TableMoreAction } from 'shared/table/actions/table-more-action';
import { TableViewTransactionAction } from 'shared/table/actions/transactions/table-view-transaction-action';
import { TableDownloadCommissionInvoice } from 'shared/table/actions/transfers/table-download-commission_invoice-action';
import { DateRangeTableFilter } from 'shared/table/filters/date-range-table-filter';
import { BillingTransfer, BillingTransferStatus, TransferButtonAction } from 'types/Billing';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { AppCurrencyPipe } from '../../../shared/formatters/app-currency.pipe';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { AppUnitPipe } from '../../../shared/formatters/app-unit.pipe';
import { AppUserNamePipe } from '../../../shared/formatters/app-user-name.pipe';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { DataResult, TransactionRefundDataResult } from '../../../types/DataResult';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import { Constants } from '../../../utils/Constants';
import { Utils } from '../../../utils/Utils';
import { TransfersStatusFilter } from '../filters/transfers-status-filter';
import { TransferStatusFormatterComponent } from '../formatters/transfer-status-formatter.component';

@Injectable()
export class TransfersTableDataSource extends TableDataSource<BillingTransfer> {
  private downloadCommissionInvoice = new TableDownloadCommissionInvoice().getActionDef();
  private viewAction = new TableViewTransactionAction().getActionDef();
  private finalizeBillingTransferAction = new TableFinalizeBillingTransferAction().getActionDef();
  private sendBillingTransferAction = new TableSendBillingTransferAction().getActionDef();

  public constructor(
    public spinnerService: SpinnerService,
    public dialogService: DialogService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private datePipe: AppDatePipe,
    private appUnitPipe: AppUnitPipe,
    private appCurrencyPipe: AppCurrencyPipe,
    private appUserNamePipe: AppUserNamePipe,
    private windowService: WindowService
  ) {
    super(spinnerService, translateService);
    // Load settings
    // this.loadSettings();
    // Init
    this.setStaticFilters([
      {
        WithUser: true,
      },
    ]);
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<BillingTransfer>> {
    return new Observable((observer) => {
      const filters = this.buildFilterValues();
      this.centralServerService
        .getTransfers(filters, this.getPaging(), this.getSorting())
        .subscribe(
          (transfers) => {
            observer.next(transfers);
            observer.complete();
          },
          (error) => {
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'general.error_backend'
            );
            observer.error(error);
          }
        );
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
        // angularComponent: TransferDetailComponent,
      },
      hasDynamicRowAction: true,
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
        id: 'createdOn',
        name: 'general.created_on',
        formatter: (createdOn: Date) => this.datePipe.transform(createdOn),
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sortable: true,
        sorted: true,
        direction: 'desc',
      },
      // {
      //   id: 'id',
      //   name: 'transfers.id',
      //   headerClass: 'col-20p',
      //   class: 'col-20p',
      //   sortable: false,
      //   direction: 'desc',
      // },
      {
        id: 'sessionCounter',
        name: 'transfers.number_of_items',
        headerClass: 'col-10p text-center',
        class: 'col-10p text-center',
        sortable: false,
      },
      {
        id: 'collectedFunds',
        name: 'transfers.collected_funds',
        formatter: (amount: number, transfer: BillingTransfer) =>
          this.appCurrencyPipe.transform(amount, transfer.currency),
        headerClass: 'col-10p',
        class: 'col-10p',
        sortable: false,
      },
      {
        id: 'collectedFees',
        name: 'transfers.platform_fee_amount',
        formatter: (amount: number, transfer: BillingTransfer) =>
          this.appCurrencyPipe.transform(amount, transfer.currency),
        headerClass: 'col-10p',
        class: 'col-10p',
        sortable: false,
      },
      {
        id: 'invoice.totalAmount',
        name: 'transfers.platform_fee_tax_inclusive',
        formatter: (amount: number, transfer: BillingTransfer) =>
          this.appCurrencyPipe.transform(amount, transfer.currency),
        headerClass: 'col-10p',
        class: 'col-10p',
        sortable: false,
      },
      {
        id: 'transferAmount',
        name: 'transfers.transferAmount',
        formatter: (amount: number, transfer: BillingTransfer) =>
          this.appCurrencyPipe.transform(amount, transfer.currency),
        headerClass: 'col-10p',
        class: 'col-10p',
        sortable: false,
      },
      {
        id: 'invoice.documentNumber',
        name: 'transfers.document_number',
        headerClass: 'col-10p',
        class: 'col-10p',
        sortable: false,
      },
      {
        id: 'account.companyName',
        name: 'accounts.list.company_name',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: false,
        direction: 'desc',
      },
      {
        id: 'businessOwner',
        name: 'transfers.accountOwner',
        headerClass: 'col-20p text-left',
        class: 'col-20p text-left',
        formatter: (dummy: string, transfer: BillingTransfer) =>
          this.appUserNamePipe.transform(transfer.businessOwner),
      },
      {
        id: 'account.accountExternalID',
        name: 'transfers.accountExternalID',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: false,
        direction: 'desc',
      },
      {
        id: 'transferExternalID',
        name: 'transfers.transferExternalID',
        headerClass: 'col-20p',
        class: 'col-20p',
        sorted: true,
        sortable: false,
        direction: 'desc',
      }
    );
    return columns;
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    const filters: TableFilterDef[] = [
      new DateRangeTableFilter({
        translateService: this.translateService,
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

  public buildTableDynamicRowActions(transfer: BillingTransfer): TableActionDef[] {
    const rowActions: TableActionDef[] = [];
    const moreActions = new TableMoreAction([]);
    if (transfer.status === BillingTransferStatus.PENDING) {
      // ACHTUNG - Do not reuse the common instance of the action
      const disabledAction = new TableFinalizeBillingTransferAction().getActionDef();
      disabledAction.disabled = true;
      moreActions.addActionInMoreActions(disabledAction);
    }
    if (transfer.status === BillingTransferStatus.DRAFT) {
      moreActions.addActionInMoreActions(this.finalizeBillingTransferAction);
    }
    if (transfer.status === BillingTransferStatus.FINALIZED) {
      moreActions.addActionInMoreActions(this.sendBillingTransferAction);
    }
    if (transfer.invoice && transfer.canDownload) {
      rowActions.push(this.downloadCommissionInvoice);
    }
    if (!Utils.isEmptyArray(moreActions.getActionsInMoreActions())) {
      rowActions.push(moreActions.getActionDef());
    }
    return rowActions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    switch (
      actionDef.id
      // case TransferButtonAction.EXPORT_TRANSFERS:
      //   if (actionDef.action) {
      //     (actionDef as TableExportTransfersActionDef).action(this.buildFilterValues(), this.dialogService,
      //       this.translateService, this.messageService, this.centralServerService, this.router,
      //       this.spinnerService);
      //   }
      // break;
    ) {
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableRowActions(): TableActionDef[] {
    return [this.viewAction];
  }

  public rowActionTriggered(actionDef: TableActionDef, transfer: BillingTransfer) {
    switch (actionDef.id) {
      case TransferButtonAction.VIEW_TRANSFER:
        // if (actionDef.action) {
        //   (actionDef as TableViewTransferActionDef).action(TransferDialogComponent, this.dialog,
        //     { dialogData: { transferID: transfer.id } as TransferDialogData },
        //     this.refreshData.bind(this));
        // }
        break;
      case TransferButtonAction.DOWNLOAD_COMMISSION_INCOICE:
        if (this.downloadCommissionInvoice.action) {
          this.downloadCommissionInvoice.action(
            transfer.id,
            'invoice_' + transfer.invoice?.invoiceID,
            this.translateService,
            this.spinnerService,
            this.messageService,
            this.centralServerService,
            this.router
          );
        }
        break;
      case TransferButtonAction.FINALIZE_TRANSFER:
        if (this.finalizeBillingTransferAction.action) {
          this.finalizeBillingTransferAction.action(
            transfer.id,
            this.translateService,
            this.spinnerService,
            this.messageService,
            this.centralServerService,
            this.router,
            this.refreshData.bind(this)
          );
        }
        break;
      case TransferButtonAction.SEND_TRANSFER:
        if (this.sendBillingTransferAction.action) {
          this.sendBillingTransferAction.action(
            transfer.id,
            this.translateService,
            this.spinnerService,
            this.messageService,
            this.centralServerService,
            this.router,
            this.refreshData.bind(this)
          );
        }
        break;
    }
  }

  public isSelectable(row: BillingTransfer) {
    return true;
  }
}
