import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'app/services/spinner.service';
import { DataResult } from 'app/types/DataResult';
import { ButtonAction, RestResponse } from 'app/types/GlobalType';
import { SiteButtonAction } from 'app/types/Site';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import { User, UserButtonAction, UserToken } from 'app/types/User';
import saveAs from 'file-saver';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { WindowService } from '../../../services/window.service';
import { AppCurrencyPipe } from '../../../shared/formatters/app-currency.pipe';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableDownloadAction } from '../../../shared/table/actions/table-download-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { BillingInvoice } from '../../../types/Billing';
import ChangeNotification from '../../../types/ChangeNotification';
import { Utils } from '../../../utils/Utils';
import { TransactionsDateFromFilter } from '../../transactions/filters/transactions-date-from-filter';
import { TransactionsDateUntilFilter } from '../../transactions/filters/transactions-date-until-filter';
import { InvoiceStatusFormatterComponent } from '../components/invoice-status-formatter.component';
import { InvoiceStatusFilter } from '../filters/invoices-status-filter';

@Injectable()
export class InvoicesListTableDataSource extends TableDataSource<BillingInvoice> {
  private downloadAction = new TableDownloadAction().getActionDef();
  private currentUser: UserToken;

  constructor(
      public spinnerService: SpinnerService,
      private messageService: MessageService,
      private translateService: TranslateService,
      private dialogService: DialogService,
      private router: Router,
      private dialog: MatDialog,
      private centralServerNotificationService: CentralServerNotificationService,
      private centralServerService: CentralServerService,
      private authorizationService: AuthorizationService,
      private datePipe: AppDatePipe,
      private appCurrencyPipe: AppCurrencyPipe,
      private windowService: WindowService) {
    super(spinnerService);
    // Init
    this.initDataSource();
    // Store the current user
    this.currentUser = this.centralServerService.getLoggedUser();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectUsers();
  }

  public loadDataImpl(): Observable<DataResult<BillingInvoice>> {
    return new Observable((observer) => {
      // Get the Tenants
      this.centralServerService.getUserInvoices(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((invoices) => {
        // Ok
        console.log(invoices);
        observer.next(invoices);
        observer.complete();
      }, (error) => {
        // Show error
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
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
    };
  }

  public buildTableRowActions(): TableActionDef[] {
    return [this.downloadAction];
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const columns = [];
    columns.push(
      {
        id: 'status',
        name: 'general.status',
        isAngularComponent: true,
        angularComponent: InvoiceStatusFormatterComponent,
        headerClass: 'col-10p',
        class: 'col-10p table-cell-angular-big-component',
        sortable: true,
      },
      {
        id: 'number',
        name: 'invoices.id',
        headerClass: 'col-30p',
        class: 'col-30p',
        sortable: true,
      },
      {
        id: 'createdOn',
        name: 'invoices.createdOn',
        formatter: (date: Date) => this.datePipe.transform(date),
        headerClass: 'col-30p',
        class: 'col-30p',
        sortable: true,
      },
      {
        id: 'amountDue',
        name: 'invoices.price',
        formatter: (price: number, invoice: BillingInvoice) => this.appCurrencyPipe.transform(price / 100, invoice.currency),
        headerClass: 'col-10p',
        class: 'col-10p',
        sortable: true,
      },
    );
    return columns as TableColumnDef[];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [
      ...tableActionsDef,
    ];
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem: BillingInvoice) {
    switch (actionDef.id) {
      case ButtonAction.SEND:
        window.open(rowItem.downloadUrl, '_blank');
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [
      new TransactionsDateFromFilter(moment().startOf('y').toDate()).getFilterDef(),
      new TransactionsDateUntilFilter().getFilterDef(),
      new InvoiceStatusFilter().getFilterDef(),
    ];
  }
}
