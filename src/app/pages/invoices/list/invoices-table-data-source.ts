import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { AppCurrencyPipe } from '../../../shared/formatters/app-currency.pipe';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { AppUserNamePipe } from '../../../shared/formatters/app-user-name.pipe';
import { TableDownloadBillingInvoice } from '../../../shared/table/actions/invoices/table-download-billing-invoice-action';
import { TableSyncBillingInvoicesAction } from '../../../shared/table/actions/invoices/table-sync-billing-invoices-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { EndDateFilter } from '../../../shared/table/filters/end-date-filter';
import { StartDateFilter } from '../../../shared/table/filters/start-date-filter';
import { UserTableFilter } from '../../../shared/table/filters/user-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { BillingButtonAction, BillingInvoice } from '../../../types/Billing';
import ChangeNotification from '../../../types/ChangeNotification';
import { DataResult } from '../../../types/DataResult';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import TenantComponents from '../../../types/TenantComponents';
import { User } from '../../../types/User';
import { Utils } from '../../../utils/Utils';
import { InvoiceStatusFilter } from '../filters/invoices-status-filter';
import { InvoiceStatusFormatterComponent } from '../formatters/invoice-status-formatter.component';

@Injectable()
export class InvoicesTableDataSource extends TableDataSource<BillingInvoice> {
  private syncBillingInvoicesAction = new TableSyncBillingInvoicesAction().getActionDef();
  private downloadBillingInvoiceAction = new TableDownloadBillingInvoice().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private appUserNamePipe: AppUserNamePipe,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private datePipe: AppDatePipe,
    private appCurrencyPipe: AppCurrencyPipe,
    private componentService: ComponentService) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectInvoices();
  }

  public loadDataImpl(): Observable<DataResult<BillingInvoice>> {
    return new Observable((observer) => {
      // Get the Invoices
      this.centralServerService.getUserInvoices(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((invoices) => {
          // Ok
          observer.next(invoices);
          observer.complete();
        }, (error) => {
          // Show error
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'invoices.cannot_retrieve_invoices');
          // Error
          observer.error(error);
        });
    });
  }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: true,
      },
      hasDynamicRowAction: true
    };
  }

  public buildTableDynamicRowActions(invoice: BillingInvoice): TableActionDef[] {
    const rowActions = [];
    if (invoice.downloadable && this.authorizationService.canDownloadInvoice(invoice.userID)) {
      rowActions.push(this.downloadBillingInvoiceAction);
    }
    return rowActions;
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const columns = [];
    columns.push(
      {
        id: 'status',
        name: 'general.status',
        isAngularComponent: true,
        angularComponent: InvoiceStatusFormatterComponent,
        headerClass: 'col-10p text-center',
        class: 'col-10p table-cell-angular-big-component',
        sortable: true,
      },
      {
        id: 'createdOn',
        name: 'invoices.createdOn',
        formatter: (date: Date) => this.datePipe.transform(date),
        headerClass: 'col-20p',
        class: 'col-20p',
        sorted: true,
        sortable: true,
        direction: 'desc',
      },
      {
        id: 'number',
        name: 'invoices.id',
        headerClass: 'col-15p',
        class: 'col-15p',
        sortable: true,
      },
    );
    if (this.authorizationService.isAdmin()) {
      columns.push(
        {
          id: 'user',
          name: 'invoices.user',
          headerClass: 'col-20p text-left',
          class: 'col-20p text-left',
          formatter: (user: User) => this.appUserNamePipe.transform(user),
        },
        {
          id: 'user.email',
          name: 'users.email',
          headerClass: 'col-20p text-left',
          class: 'col-20p text-left',
        }
      );
    }
    columns.push(
      {
        id: 'nbrOfItems',
        name: 'invoices.number_of_items',
        headerClass: 'col-10p text-center',
        class: 'col-10p text-center',
        sortable: true,
      },
      {
        id: 'amount',
        name: 'invoices.price',
        formatter: (price: number, invoice: BillingInvoice) => this.appCurrencyPipe.transform(price / 100, invoice.currency.toUpperCase()),
        headerClass: 'col-10p',
        class: 'col-10p',
        sortable: true,
      },
    );
    return columns as TableColumnDef[];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.componentService.isActive(TenantComponents.BILLING) &&
      this.authorizationService.canSynchronizeInvoices()) {
      tableActionsDef.unshift(this.syncBillingInvoicesAction);
    }
    return [
      ...tableActionsDef,
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case BillingButtonAction.SYNCHRONIZE_INVOICES:
        if (this.syncBillingInvoicesAction.action) {
          this.syncBillingInvoicesAction.action(
            this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.router, this.refreshData.bind(this)
          );
        }
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, billingInvoice: BillingInvoice) {
    switch (actionDef.id) {
      case BillingButtonAction.DOWNLOAD_INVOICE:
        if (this.downloadBillingInvoiceAction.action) {
          this.downloadBillingInvoiceAction.action(
            billingInvoice.id, 'invoice_' + billingInvoice.number, this.translateService, this.spinnerService,
            this.messageService, this.centralServerService, this.router
          );
        }
        break;
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    const filters = [
      new StartDateFilter(moment().startOf('y').toDate()).getFilterDef(),
      new EndDateFilter().getFilterDef(),
      new InvoiceStatusFilter().getFilterDef(),
    ];
    if (this.authorizationService.isAdmin()) {
      filters.push(new UserTableFilter(this.authorizationService.getSitesAdmin()).getFilterDef());
    }
    return filters;
  }
}
