import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'app/services/spinner.service';
import { SiteTableFilter } from 'app/shared/table/filters/site-table-filter';
import { ActionResponse, DataResult } from 'app/types/DataResult';
import { ButtonAction } from 'app/types/GlobalType';
import { ButtonType, TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import TenantComponents from 'app/types/TenantComponents';
import { Transaction } from 'app/types/Transaction';
import { User } from 'app/types/User';
import { Observable } from 'rxjs';
import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { ConsumptionChartDetailComponent } from '../../../shared/component/consumption-chart/consumption-chart-detail.component';
import { TransactionDialogComponent } from '../../../shared/dialogs/transactions/transaction-dialog.component';
import { AppBatteryPercentagePipe } from '../../../shared/formatters/app-battery-percentage.pipe';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { AppDurationPipe } from '../../../shared/formatters/app-duration.pipe';
import { AppPercentPipe } from '../../../shared/formatters/app-percent-pipe';
import { AppUnitPipe } from '../../../shared/formatters/app-unit.pipe';
import { AppUserNamePipe } from '../../../shared/formatters/app-user-name.pipe';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableOpenAction } from '../../../shared/table/actions/table-open-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { TableStopAction } from '../../../shared/table/actions/table-stop-action';
import { ChargerTableFilter } from '../../../shared/table/filters/charger-table-filter';
import { SiteAreaTableFilter } from '../../../shared/table/filters/site-area-table-filter';
import { UserTableFilter } from '../../../shared/table/filters/user-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import ChangeNotification from '../../../types/ChangeNotification';
import { Utils } from '../../../utils/Utils';
import { TransactionsConnectorCellComponent } from '../cell-components/transactions-connector-cell.component';
import { TransactionsInactivityCellComponent } from '../cell-components/transactions-inactivity-cell.component';
import { ConnStatus } from 'app/types/ChargingStation';

@Injectable()
export class TransactionsInProgressTableDataSource extends TableDataSource<Transaction> {
  private openAction = new TableOpenAction().getActionDef();
  private stopAction = new TableStopAction().getActionDef();
  private isAdmin = false;
  private isSiteAdmin = false;

  constructor(
    public spinnerService: SpinnerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private authorizationService: AuthorizationService,
    private datePipe: AppDatePipe,
    private appPercentPipe: AppPercentPipe,
    private appUnitPipe: AppUnitPipe,
    private appBatteryPercentagePipe: AppBatteryPercentagePipe,
    private appUserNamePipe: AppUserNamePipe,
    private appDurationPipe: AppDurationPipe) {
    super(spinnerService);
    // Admin
    this.isAdmin = this.authorizationService.isAdmin();
    this.isSiteAdmin = this.authorizationService.hasSitesAdminRights();
    // Init
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectTransactions();
  }

  public loadDataImpl(): Observable<DataResult<Transaction>> {
    return new Observable((observer) => {
      this.centralServerService.getActiveTransactions(this.buildFilterValues(), this.getPaging(), this.getSorting())
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
        enabled: false,
      },
      rowDetails: {
        enabled: true,
        angularComponent: ConsumptionChartDetailComponent,
      },
      hasDynamicRowAction: true,
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
        id: 'currentTotalDurationSecs',
        name: 'transactions.duration',
        class: 'text-left',
        formatter: (currentTotalDurationSecs: number, row: Transaction) =>
          this.appDurationPipe.transform((new Date().getTime() - new Date(row.timestamp).getTime()) / 1000),
      },
      {
        id: 'currentTotalInactivitySecs',
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
      },
      {
        id: 'connectorId',
        name: 'transactions.connector',
        headerClass: 'text-center',
        class: 'table-cell-angular-big-component',
        isAngularComponent: true,
        angularComponent: TransactionsConnectorCellComponent,
      },
      {
        id: 'currentConsumption',
        name: 'transactions.current_consumption',
        formatter: (currentConsumption: number) => this.appUnitPipe.transform(currentConsumption, 'W', 'kW'),
      },
      {
        id: 'currentTotalConsumption',
        name: 'transactions.total_consumption',
        formatter: (currentTotalConsumption: number) => this.appUnitPipe.transform(currentTotalConsumption, 'Wh', 'kWh'),
      },
      {
        id: 'currentStateOfCharge',
        name: 'transactions.state_of_charge',
        formatter: (currentStateOfCharge: number, row: Transaction) => {
          if (!currentStateOfCharge) {
            return '';
          }
          return this.appBatteryPercentagePipe.transform(row.stateOfCharge, currentStateOfCharge);
        },
      });
    if (this.isAdmin || this.isSiteAdmin) {
      columns.splice(1, 0, {
        id: 'user',
        name: 'transactions.user',
        class: 'text-left',
        formatter: (value: User) => this.appUserNamePipe.transform(value),
      });
    }
    return columns as TableColumnDef[];

  }

  rowActionTriggered(actionDef: TableActionDef, transaction: Transaction) {
    switch (actionDef.id) {
      case ButtonAction.STOP:
        this.dialogService.createAndShowYesNoDialog(
          this.translateService.instant('transactions.dialog.soft_stop.title'),
          this.translateService.instant('transactions.dialog.soft_stop.confirm', { user: this.appUserNamePipe.transform(transaction.user) }),
        ).subscribe((response) => {
          if (response === ButtonType.YES) {
            this.stopTransaction(transaction);
          }
        });
        break;
      case ButtonAction.OPEN:
        this.openSession(transaction);
        break;
      default:
        super.rowActionTriggered(actionDef, transaction);
    }
  }

  buildTableFiltersDef(): TableFilterDef[] {
    const filters: TableFilterDef[] = [
      new ChargerTableFilter().getFilterDef(),
    ];

    // Show Site Area Filter If Organization component is active
    if (this.componentService.isActive(TenantComponents.ORGANIZATION)) {
      filters.push(new SiteTableFilter().getFilterDef());
      filters.push(new SiteAreaTableFilter().getFilterDef());
    }

    if (this.authorizationService.isAdmin() || this.authorizationService.hasSitesAdminRights()) {
      filters.push(new UserTableFilter(this.authorizationService.getSitesAdmin()).getFilterDef());
    }

    return filters;
  }

  buildTableDynamicRowActions(): TableActionDef[] {
    const actions = [
      this.openAction,
    ];
    if (!this.authorizationService.isDemo()) {
      actions.push(this.stopAction);
    }
    return actions;
  }

  buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(true).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
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

  protected remoteStopTransaction(transaction: Transaction) {
    this.centralServerService.chargingStationStopTransaction(
      transaction.chargeBoxID, transaction.id).subscribe((response: ActionResponse) => {
      if (response.status === 'Rejected') {
        this.messageService.showErrorMessage(
          this.translateService.instant('transactions.notification.soft_stop.error'));
      } else {
        this.messageService.showSuccessMessage(
          this.translateService.instant('transactions.notification.soft_stop.success',
            { user: this.appUserNamePipe.transform(transaction.user) }));
        this.refreshData().subscribe();
      }
    }, (error) => {
      Utils.handleHttpError(error, this.router, this.messageService,
        this.centralServerService, 'transactions.notification.soft_stop.error');
    });
  }

  protected softStopTransaction(transaction: Transaction) {
    this.centralServerService.softStopTransaction(transaction.id).subscribe((response: ActionResponse) => {
      if (response.status === 'Invalid') {
        this.messageService.showErrorMessage(
          this.translateService.instant('transactions.notification.soft_stop.error'));
      } else {
        this.messageService.showSuccessMessage(
          this.translateService.instant('transactions.notification.soft_stop.success',
            { user: this.appUserNamePipe.transform(transaction.user) }));
        this.refreshData().subscribe();
      }
    }, (error) => {
      // tslint:disable-next-line:max-line-length
      Utils.handleHttpError(error, this.router, this.messageService,
        this.centralServerService, 'transactions.notification.soft_stop.error');
    });
  }

  private stopTransaction(transaction: Transaction) {
    this.centralServerService.getCharger(transaction.chargeBoxID).subscribe((chargingStation) => {
      if (chargingStation && !chargingStation.inactive) {
        if (chargingStation.connectors &&
            chargingStation.connectors[transaction.connectorId] &&
            chargingStation.connectors[transaction.connectorId].status !== ConnStatus.AVAILABLE) {
          // Remote Stop
          this.remoteStopTransaction(transaction);
          return;
        }
      }
      // Soft Stop
      this.softStopTransaction(transaction);
    }, (error) => {
      Utils.handleHttpError(error, this.router, this.messageService,
        this.centralServerService, 'transactions.notification.soft_stop.error');
    });
  }
}
