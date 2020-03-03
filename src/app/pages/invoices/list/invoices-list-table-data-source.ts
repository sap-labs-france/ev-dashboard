import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'app/services/spinner.service';
import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { TableMoreAction } from 'app/shared/table/actions/table-more-action';
import { DataResult } from 'app/types/DataResult';
import { ButtonAction, RestResponse } from 'app/types/GlobalType';
import { HTTPError } from 'app/types/HTTPError';
import { SiteButtonAction } from 'app/types/Site';
import { ButtonType, TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import { Tag } from 'app/types/Tag';
import TenantComponents from 'app/types/TenantComponents';
import { User, UserButtonAction, UserToken } from 'app/types/User';
import { Observable } from 'rxjs';
import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { AppArrayToStringPipe } from '../../../shared/formatters/app-array-to-string.pipe';
import { AppCurrencyPipe } from '../../../shared/formatters/app-currency.pipe';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { AppUserNamePipe } from '../../../shared/formatters/app-user-name.pipe';
import { TableAssignSitesAction } from '../../../shared/table/actions/table-assign-sites-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableDeleteAction } from '../../../shared/table/actions/table-delete-action';
import { TableDownloadAction } from '../../../shared/table/actions/table-download-action';
import { TableEditAction } from '../../../shared/table/actions/table-edit-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { TableSyncBillingUsersAction } from '../../../shared/table/actions/table-sync-billing-users-action';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { Action, Entity } from '../../../types/Authorization';
import { BillingInvoice } from '../../../types/Billing';
import ChangeNotification from '../../../types/ChangeNotification';
import { Transaction } from '../../../types/Transaction';
import { Utils } from '../../../utils/Utils';
import { UserStatusFormatterComponent } from '../../users/formatters/user-status-formatter.component';
import { InvoiceStatusFormatterComponent } from '../components/invoice-status-formatter.component';
import {UserRoleFilter} from "../../users/filters/user-role-filter";
import {UserStatusFilter} from "../../users/filters/user-status-filter";
import {InvoiceStatusFilter} from "../filters/invoices-status-filter";

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
      private appCurrencyPipe: AppCurrencyPipe) {
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
    const loggedUserRole = this.centralServerService.getLoggedUser().role;
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

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case ButtonAction.CREATE:
        break;
      case UserButtonAction.FORCE_SYNCHRONIZE:
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem: User) {
    switch (actionDef.id) {
      case ButtonAction.EDIT:
        break;
      case SiteButtonAction.ASSIGN_SITE:
        break;
      case ButtonAction.DELETE:
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
      new InvoiceStatusFilter().getFilterDef(),
    ];
  }
}
