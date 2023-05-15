import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { DateRangeTableFilter } from 'shared/table/filters/date-range-table-filter';
import { IssuerFilter } from 'shared/table/filters/issuer-filter';
import { BillingInvoicesAuthorizations } from 'types/Authorization';

import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { AppCurrencyPipe } from '../../../shared/formatters/app-currency.pipe';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { AppUserNamePipe } from '../../../shared/formatters/app-user-name.pipe';
import { TableDownloadBillingInvoice } from '../../../shared/table/actions/invoices/table-download-billing-invoice-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { UserTableFilter } from '../../../shared/table/filters/user-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { BillingButtonAction, BillingInvoice, BillingSessionData } from '../../../types/Billing';
import { BillingInvoiceDataResult } from '../../../types/DataResult';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import { User } from '../../../types/User';
import { Utils } from '../../../utils/Utils';
import { InvoiceStatusFilter } from '../filters/invoices-status-filter';
import { InvoiceStatusFormatterComponent } from '../formatters/invoice-status-formatter.component';

@Injectable()
export class InvoicesTableDataSource extends TableDataSource<BillingInvoice> {
  private downloadBillingInvoiceAction = new TableDownloadBillingInvoice().getActionDef();
  private usersFilter: TableFilterDef;
  private issuerFilter: TableFilterDef;
  private dateRangeFilter: TableFilterDef;
  private invoiceStatusFilter: TableFilterDef;
  private invoicesAuthorizations: BillingInvoicesAuthorizations;

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private appUserNamePipe: AppUserNamePipe,
    private centralServerService: CentralServerService,
    private datePipe: AppDatePipe,
    private appCurrencyPipe: AppCurrencyPipe
  ) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public loadDataImpl(): Observable<BillingInvoiceDataResult> {
    return new Observable((observer) => {
      // Get the Invoices
      this.centralServerService
        .getInvoices(this.buildFilterValues(), this.getPaging(), this.getSorting())
        .subscribe({
          next: (invoices) => {
            // Initialise authorizations
            this.invoicesAuthorizations = {
              canListUsers: Utils.convertToBoolean(invoices.canListUsers),
            };
            // Update filters visibility
            this.usersFilter.visible = this.invoicesAuthorizations.canListUsers;
            observer.next(invoices);
            observer.complete();
          },
          error: (error) => {
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'invoices.cannot_retrieve_invoices'
            );
            observer.error(error);
          },
        });
    });
  }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: true,
      },
      hasDynamicRowAction: true,
    };
  }

  public buildTableDynamicRowActions(invoice: BillingInvoice): TableActionDef[] {
    const rowActions = [];
    if (invoice.downloadable && invoice.canDownload) {
      rowActions.push(this.downloadBillingInvoiceAction);
    }
    return rowActions;
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
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
        name: 'invoices.number',
        headerClass: 'col-15p',
        class: 'col-15p',
        sortable: true,
      },
      {
        id: 'user.name',
        name: 'invoices.user',
        headerClass: 'col-20p text-left',
        class: 'col-20p text-left',
        formatter: (name: string, invoice: BillingInvoice) =>
          this.appUserNamePipe.transform(invoice.user),
      },
      {
        id: 'user.email',
        name: 'users.email',
        headerClass: 'col-20p text-left',
        class: 'col-20p text-left',
      },
      {
        id: 'sessions',
        name: 'invoices.number_of_items',
        formatter: (sessions: BillingSessionData[], invoice: BillingInvoice) =>
          sessions?.length?.toString(),
        headerClass: 'col-10p text-center',
        class: 'col-10p text-center',
        sortable: false,
      },
      {
        id: 'amount',
        name: 'invoices.amount',
        formatter: (amount: number, invoice: BillingInvoice) =>
          this.appCurrencyPipe.transform(amount / 100, invoice.currency.toUpperCase()),
        headerClass: 'col-10p',
        class: 'col-10p',
        sortable: true,
      },
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [...tableActionsDef];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
  }

  public rowActionTriggered(actionDef: TableActionDef, billingInvoice: BillingInvoice) {
    switch (actionDef.id) {
      case BillingButtonAction.DOWNLOAD_INVOICE:
        if (this.downloadBillingInvoiceAction.action) {
          this.downloadBillingInvoiceAction.action(
            billingInvoice.id,
            'invoice_' + billingInvoice.number,
            this.translateService,
            this.spinnerService,
            this.messageService,
            this.centralServerService,
            this.router
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
    this.issuerFilter = new IssuerFilter().getFilterDef();
    this.usersFilter = new UserTableFilter([this.issuerFilter]).getFilterDef();
    this.dateRangeFilter = new DateRangeTableFilter({
      translateService: this.translateService,
    }).getFilterDef();
    this.invoiceStatusFilter = new InvoiceStatusFilter().getFilterDef();
    return [this.dateRangeFilter, this.invoiceStatusFilter, this.usersFilter];
  }
}
