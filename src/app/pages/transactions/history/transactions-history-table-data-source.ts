import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'app/services/spinner.service';
import { AppCurrencyPipe } from 'app/shared/formatters/app-currency.pipe';
import { SiteTableFilter } from 'app/shared/table/filters/site-table-filter';
import saveAs from 'file-saver';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { ActionResponse, Connector, DataResult, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, Transaction, TransactionDataResult, User } from '../../../common.types';
import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService, ComponentType } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { ConsumptionChartDetailComponent } from '../../../shared/component/consumption-chart/consumption-chart-detail.component';
import { TransactionDialogComponent } from '../../../shared/dialogs/transaction/transaction-dialog.component';
import { AppConnectorIdPipe } from '../../../shared/formatters/app-connector-id.pipe';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { AppDurationPipe } from '../../../shared/formatters/app-duration.pipe';
import { AppPercentPipe } from '../../../shared/formatters/app-percent-pipe';
import { AppUnitPipe } from '../../../shared/formatters/app-unit.pipe';
import { AppUserNamePipe } from '../../../shared/formatters/app-user-name.pipe';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableDeleteAction } from '../../../shared/table/actions/table-delete-action';
import { TableExportAction } from '../../../shared/table/actions/table-export-action';
import { TableOpenAction } from '../../../shared/table/actions/table-open-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { ChargerTableFilter } from '../../../shared/table/filters/charger-table-filter';
import { SiteAreaTableFilter } from '../../../shared/table/filters/site-area-table-filter';
import { UserTableFilter } from '../../../shared/table/filters/user-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { Constants } from '../../../utils/Constants';
import { Utils } from '../../../utils/Utils';
import { TransactionsInactivityCellComponent } from '../cell-components/transactions-inactivity-cell.component';
import { TransactionsDateFromFilter } from '../filters/transactions-date-from-filter';
import { TransactionsDateUntilFilter } from '../filters/transactions-date-until-filter';

@Injectable()
export class TransactionsHistoryTableDataSource extends TableDataSource<Transaction> {
  private isAdmin = false;
  private isSiteAdmin = false;
  private openAction = new TableOpenAction().getActionDef();
  private deleteAction = new TableDeleteAction().getActionDef();

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
    private componentService: ComponentService,
    private datePipe: AppDatePipe,
    private appUnitPipe: AppUnitPipe,
    private appPercentPipe: AppPercentPipe,
    private appConnectorIdPipe: AppConnectorIdPipe,
    private appUserNamePipe: AppUserNamePipe,
    private appDurationPipe: AppDurationPipe,
    private appCurrencyPipe: AppCurrencyPipe) {
    super(spinnerService);
    // Admin
    this.isAdmin = this.authorizationService.isAdmin();
    this.isSiteAdmin = this.authorizationService.hasSitesAdminRights();
    // Init
    this.initDataSource();
    // Add statistics to query
    this.setStaticFilters([{Statistics: 'history'}]);
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectTransactions();
  }

  public loadDataImpl(): Observable<DataResult<Transaction>> {
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
      },
    );
  }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: true,
      },
      rowDetails: {
        enabled: true,
        angularComponent: ConsumptionChartDetailComponent,
      },
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const columns: TableColumnDef[] = [];
    if (this.isAdmin) {
      columns.push({
        id: 'id',
        name: 'transactions.id',
        headerClass: 'd-none d-xl-table-cell',
        class: 'd-none d-xl-table-cell',
      });
    }
    columns.push({
        id: 'timestamp',
        name: 'transactions.started_at',
        class: 'text-left',
        sorted: true,
        sortable: true,
        direction: 'desc',
        formatter: (value: Date) => this.datePipe.transform(value),
      },
      {
        id: 'stop.totalDurationSecs',
        name: 'transactions.duration',
        class: 'text-left',
        formatter: (totalDurationSecs: number) => this.appDurationPipe.transform(totalDurationSecs),
      },
      {
        id: 'stop.totalInactivitySecs',
        name: 'transactions.inactivity',
        headerClass: 'd-none d-lg-table-cell',
        sortable: false,
        isAngularComponent: true,
        angularComponent: TransactionsInactivityCellComponent,
      },
      {
        id: 'chargeBoxID',
        name: 'transactions.charging_station',
        class: 'text-left',
        formatter: (chargingStationID: string, connector: Connector) => this.formatChargingStation(chargingStationID, connector),
      },
      {
        id: 'stop.totalConsumption',
        name: 'transactions.consumption',
        formatter: (totalConsumption: number) => this.appUnitPipe.transform(totalConsumption, 'Wh', 'kWh'),
      });
    if (this.isAdmin || this.isSiteAdmin) {
      columns.splice(1, 0, {
        id: 'user',
        name: 'transactions.user',
        class: 'text-left',
        formatter: (user: User) => this.appUserNamePipe.transform(user),
      });
      if (this.componentService.isActive(ComponentType.PRICING)) {
        columns.push({
          id: 'stop.price',
          name: 'transactions.price',
          headerClass: 'd-none d-xl-table-cell',
          class: 'd-none d-xl-table-cell',
          formatter: (price: number, transaction: Transaction) => this.appCurrencyPipe.transform(price, transaction.stop.priceUnit),
        });
      }
    }
    return columns as TableColumnDef[];
  }

  formatInactivity(totalInactivitySecs: number, row: Transaction) {
    let percentage = 0;
    if (row.stop) {
      percentage = row.stop.totalDurationSecs > 0 ? (totalInactivitySecs / row.stop.totalDurationSecs) : 0;
    }
    return this.appDurationPipe.transform(totalInactivitySecs) +
      ` (${this.appPercentPipe.transform(percentage, '1.0-0')})`;
  }

  formatChargingStation(chargingStationID: string, connector: Connector) {
    return `${chargingStationID} - ${this.appConnectorIdPipe.transform(connector.connectorId)}`;
  }

  public buildTableFooterStats(data: TransactionDataResult): string {
    // All records has been retrieved
    if (data.count !== Constants.INFINITE_RECORDS) {
      // Stats?
      if (data.stats) {
        const percentInactivity = (data.stats.totalDurationSecs > 0 ?
          (Math.floor(data.stats.totalInactivitySecs / data.stats.totalDurationSecs * 100)) : 0);
        // Total Duration
        // tslint:disable-next-line:max-line-length
        let stats = `${this.translateService.instant('transactions.duration')}: ${this.appDurationPipe.transform(data.stats.totalDurationSecs)} | `;
        // Inactivity
        // tslint:disable-next-line:max-line-length
        stats += `${this.translateService.instant('transactions.inactivity')}: ${this.appDurationPipe.transform(data.stats.totalInactivitySecs)} (${percentInactivity}%) | `;
        // Total Consumption
        // tslint:disable-next-line:max-line-length
        stats += `${this.translateService.instant('transactions.consumption')}: ${this.appUnitPipe.transform(data.stats.totalConsumptionWattHours, 'Wh', 'kWh', true, 1, 0)}`;
        // Total Price
        // tslint:disable-next-line:max-line-length
        stats += ` | ${this.translateService.instant('transactions.price')}: ${this.appCurrencyPipe.transform(data.stats.totalPrice, data.stats.currency)}`;
        return stats;
      }
    }
    return  '';
  }

  buildTableFiltersDef(): TableFilterDef[] {
    const filters: TableFilterDef[] = [
      // @ts-ignore
      new TransactionsDateFromFilter(moment().startOf('y').toDate()).getFilterDef(),
      new TransactionsDateUntilFilter().getFilterDef(),
      new ChargerTableFilter().getFilterDef(),
    ];

    // Show Site Area Filter If Organization component is active
    if (this.componentService.isActive(ComponentType.ORGANIZATION)) {
      filters.push(new SiteTableFilter().getFilterDef());
      filters.push(new SiteAreaTableFilter().getFilterDef());
    }

    if (this.authorizationService.isAdmin() || this.authorizationService.hasSitesAdminRights()) {
      filters.push(new UserTableFilter(this.authorizationService.getSitesAdmin()).getFilterDef());
    }

    return filters;
  }

  buildTableRowActions(): TableActionDef[] {
    const rowActions = [this.openAction];
    if (this.isAdmin) {
      rowActions.push(this.deleteAction);
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
        if (transaction.refundData && (transaction.refundData.status === Constants.REFUND_STATUS_SUBMITTED ||
          transaction.refundData.status === Constants.REFUND_STATUS_APPROVED)) {
          this.dialogService.createAndShowOkDialog(
            this.translateService.instant('transactions.dialog.delete.title'),
            this.translateService.instant('transactions.dialog.delete.rejected_refunded_msg'));
        } else {
          this.dialogService.createAndShowYesNoDialog(
            this.translateService.instant('transactions.dialog.delete.title'),
            this.translateService.instant('transactions.dialog.delete.confirm',
              {user: this.appUserNamePipe.transform(transaction.user)}),
          ).subscribe((response) => {
            if (response === Constants.BUTTON_TYPE_YES) {
              this._deleteTransaction(transaction);
            }
          });
        }
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
      new TableRefreshAction().getActionDef(),
    ];
  }

  buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (!this.authorizationService.isDemo()) {
      return [
        new TableExportAction().getActionDef(),
        ...tableActionsDef,
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
          this.translateService.instant('transactions.dialog.export.confirm'),
        ).subscribe((response) => {
          if (response === Constants.BUTTON_TYPE_YES) {
            this.exportTransactions();
          }
        });
        break;
    }
    super.actionTriggered(actionDef);
  }

  public openSession(transaction: Transaction) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '80vh';
    dialogConfig.height = '80vh';
    dialogConfig.width = '80vw';
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      transactionId: transaction.id,
    };
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    this.dialog.open(TransactionDialogComponent, dialogConfig);
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
    this.spinnerService.show();
    this.centralServerService.exportTransactions(this.buildFilterValues(), {
      limit: this.getTotalNumberOfRecords(),
      skip: Constants.DEFAULT_SKIP,
    }, this.getSorting())
      .subscribe((result) => {
        this.spinnerService.hide();
        saveAs(result, 'exported-transactions.csv');
    }, (error) => {
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
    });
  }
}
