import {Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {ActionResponse, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, Transaction} from '../../../common.types';
import {CentralServerNotificationService} from '../../../services/central-server-notification.service';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {Utils} from '../../../utils/Utils';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {UserTableFilter} from '../../../shared/table/filters/user-filter';
import {TransactionsDateFromFilter} from '../filters/transactions-date-from-filter';
import {TransactionsDateUntilFilter} from '../filters/transactions-date-until-filter';
import {AppUnitPipe} from '../../../shared/formatters/app-unit.pipe';
import {CurrencyPipe, PercentPipe} from '@angular/common';
import {DialogService} from '../../../services/dialog.service';
import {AppDatePipe} from '../../../shared/formatters/app-date.pipe';
import {Injectable} from '@angular/core';
import {AppConnectorIdPipe} from '../../../shared/formatters/app-connector-id.pipe';
import {AppUserNamePipe} from '../../../shared/formatters/app-user-name.pipe';
import {AppDurationPipe} from '../../../shared/formatters/app-duration.pipe';
import {TableDeleteAction} from '../../../shared/table/actions/table-delete-action';
import {Constants} from '../../../utils/Constants';
import {TableAutoRefreshAction} from '../../../shared/table/actions/table-auto-refresh-action';
import {TableRefreshAction} from '../../../shared/table/actions/table-refresh-action';
import {TableDataSource} from '../../../shared/table/table-data-source';
import {ConsumptionChartDetailComponent} from '../../../shared/component/transaction-chart/consumption-chart-detail.component';
import {TableExportAction} from '../../../shared/table/actions/table-export-action';
import saveAs from 'file-saver';
import {AuthorizationService} from '../../../services/authorization-service';
import {SiteAreasTableFilter} from '../../../shared/table/filters/site-area-filter';
import {TableOpenAction} from '../../../shared/table/actions/table-open-action';
import {SessionDialogComponent} from '../../../shared/dialogs/session/session-dialog-component';
import {ChargerTableFilter} from '../../../shared/table/filters/charger-filter';
import {ComponentEnum, ComponentService} from '../../../services/component.service';
import * as moment from 'moment';
import { SpinnerService } from 'app/services/spinner.service';
import { LocaleService } from 'app/services/locale.service';

@Injectable()
export class TransactionsHistoryDataSource extends TableDataSource<Transaction> {

  private isAdmin = false;
  private dialogRefSession;

  constructor(
      public spinnerService: SpinnerService,
      private localeService: LocaleService,
      private messageService: MessageService,
      private translateService: TranslateService,
      private dialogService: DialogService,
      private router: Router,
      private dialog: MatDialog,
      private centralServerNotificationService: CentralServerNotificationService,
      private centralServerService: CentralServerService,
      private authorizationService: AuthorizationService,
      private componentService: ComponentService,
      private datePipe: AppDatePipe,
      private appUnitPipe: AppUnitPipe,
      private percentPipe: PercentPipe,
      private appConnectorIdPipe: AppConnectorIdPipe,
      private appUserNamePipe: AppUserNamePipe,
      private appDurationPipe: AppDurationPipe,
      private currencyPipe: CurrencyPipe) {
    super(spinnerService);
    // Admin
    this.isAdmin = this.authorizationService.isAdmin();
    // Init
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectTransactions();
  }

  public loadDataImpl() {
    return new Observable((observer) => {
      this.centralServerService.getTransactions(this.buildFilterValues(), this.getPaging(), this.getSorting())
        .subscribe((transactions) => {
          // Ok
          observer.next(transactions);
          observer.complete();
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
        });
      });
    }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: true
      },
      rowDetails: {
        enabled: true,
        angularComponent: ConsumptionChartDetailComponent
      }
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const locale = this.localeService.getCurrentFullLocaleForJS();
    const columns = [
      {
        id: 'timestamp',
        name: 'transactions.started_at',
        class: 'text-left',
        sorted: true,
        sortable: true,
        direction: 'desc',
        formatter: (value) => this.datePipe.transform(value)
      },
      {
        id: 'stop.totalDurationSecs',
        name: 'transactions.duration',
        class: 'text-left',
        formatter: (totalDurationSecs) => this.appDurationPipe.transform(totalDurationSecs)
      },
      {
        id: 'stop.totalInactivitySecs',
        name: 'transactions.inactivity',
        headerClass: 'd-none d-lg-table-cell',
        class: 'text-left d-none d-lg-table-cell',
        formatter: (totalInactivitySecs, row) => this.formatInactivity(totalInactivitySecs, row)
      },
      {
        id: 'chargeBoxID',
        name: 'transactions.charging_station',
        class: 'text-left',
        formatter: (chargingStation, row) => this.formatChargingStation(chargingStation, row)
      },
      {
        id: 'tagID',
        name: 'transactions.badge_id',
        headerClass: 'd-none d-xl-table-cell',
        class: 'text-left d-none d-xl-table-cell',
      },
      {
        id: 'stop.totalConsumption',
        name: 'transactions.total_consumption',
        formatter: (totalConsumption) => this.appUnitPipe.transform(totalConsumption, 'Wh', 'kWh')
      }
    ];
    if (this.isAdmin) {
      columns.splice(1, 0, {
        id: 'user',
        name: 'transactions.user',
        class: 'text-left',
        formatter: (value) => this.appUserNamePipe.transform(value)
      });
      if (this.componentService.isActive(ComponentEnum.PRICING)) {
        columns.push({
          id: 'stop.price',
          name: 'transactions.price',
          headerClass: 'd-none d-xl-table-cell',
          class: 'd-none d-xl-table-cell',
          formatter: (price, row) => this.formatPrice(price, row.stop.priceUnit, locale)
        });
      }
    }
    return columns as TableColumnDef[];
  }

  formatInactivity(totalInactivitySecs, row) {
    let  percentage = 0;
    if (row.stop) {
      percentage = row.stop.totalDurationSecs > 0 ? (totalInactivitySecs / row.stop.totalDurationSecs) : 0;
    }
    return this.appDurationPipe.transform(totalInactivitySecs) +
    ` (${this.percentPipe.transform(percentage, '1.0-0')})`
  }

  formatChargingStation(chargingStation, row) {
    return `${chargingStation} - ${this.appConnectorIdPipe.transform(row.connectorId)}`;
  }

  formatPrice(price, priceUnit, locale): string {
    return this.currencyPipe.transform(price, priceUnit, undefined, undefined, locale);
  }

  public buildFooterStats() {
    return '';
  }

  buildTableFiltersDef(): TableFilterDef[] {
    const filters: TableFilterDef[] = [
      new TransactionsDateFromFilter(moment().startOf('y').toDate()).getFilterDef(),
      new TransactionsDateUntilFilter().getFilterDef(),
      new ChargerTableFilter().getFilterDef()
    ];

    // Show Site Area Filter If Organization component is active
    if (this.componentService.isActive(ComponentEnum.ORGANIZATION)) {
      filters.push(new SiteAreasTableFilter().getFilterDef());
    }

    switch (this.centralServerService.getLoggedUser().role) {
      case  Constants.ROLE_DEMO:
      case  Constants.ROLE_BASIC:
        break;
      case  Constants.ROLE_SUPER_ADMIN:
      case  Constants.ROLE_ADMIN:
        filters.push(new UserTableFilter().getFilterDef());
    }
    return filters;
  }

  buildTableRowActions(): TableActionDef[] {
    const rowActions = [new TableOpenAction().getActionDef()];
    if (this.isAdmin) {
      rowActions.push(new TableDeleteAction().getActionDef());
    }
    return rowActions;
  }

  canDisplayRowAction(actionDef: TableActionDef, transaction: Transaction) {
    switch (actionDef.id) {
      case 'delete':
        return this.isAdmin;
      case 'refund':
        if (transaction.hasOwnProperty('refund')) {
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  rowActionTriggered(actionDef: TableActionDef, transaction: Transaction) {
    switch (actionDef.id) {
      case 'delete':
        this.dialogService.createAndShowYesNoDialog(
          this.translateService.instant('transactions.dialog.delete.title'),
          this.translateService.instant('transactions.dialog.delete.confirm', {user: this.appUserNamePipe.transform(transaction.user)})
        ).subscribe((response) => {
          if (response === Constants.BUTTON_TYPE_YES) {
            this._deleteTransaction(transaction);
          }
        });
        break;
      case 'open':
        this.openSession(transaction);
        break;
      default:
        super.rowActionTriggered(actionDef, transaction);
    }
  }

  buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (!this.authorizationService.isDemo()) {
      return [
        new TableExportAction().getActionDef(),
        ...tableActionsDef
      ];
    } else {
      return tableActionsDef;
    }
  }

  actionTriggered(actionDef: TableActionDef) {
    switch (actionDef.id) {
      case 'export':
        this.dialogService.createAndShowYesNoDialog(
          this.translateService.instant('transactions.dialog.export.title'),
          this.translateService.instant('transactions.dialog.export.confirm')
        ).subscribe((response) => {
          if (response === Constants.BUTTON_TYPE_YES) {
            this.exportTransactions();
          }
        });
        break;
    }
    super.actionTriggered(actionDef);
  }

  protected _deleteTransaction(transaction: Transaction) {
    this.centralServerService.deleteTransaction(transaction.id).subscribe((response: ActionResponse) => {
      this.messageService.showSuccessMessage(
        // tslint:disable-next-line:max-line-length
        this.translateService.instant('transactions.notification.delete.success', {user: this.appUserNamePipe.transform(transaction.user)}));
      this.refreshData().subscribe();
    }, (error) => {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'transactions.notification.delete.error');
    });
  }

  private exportTransactions() {
    this.centralServerService.exportTransactions(this.buildFilterValues(), {
      limit: this.getTotalNumberOfRecords(),
      skip: Constants.DEFAULT_SKIP
    }, this.getSorting())
      .subscribe((result) => {
        saveAs(result, 'exportTransactions.csv');
      }, (error) => {
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
      });
  }

  public openSession(transaction: Transaction) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '80vh';
    dialogConfig.height = '80vh';
    dialogConfig.width = '80vw';
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      transactionId: transaction.id
    };
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    this.dialogRefSession = this.dialog.open(SessionDialogComponent, dialogConfig);
    this.dialogRefSession.afterClosed().subscribe(() => this.refreshData().subscribe());
  }
}
