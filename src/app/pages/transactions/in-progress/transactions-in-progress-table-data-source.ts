import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import { Transaction, TransactionButtonAction } from 'app/types/Transaction';

import { AppBatteryPercentagePipe } from '../../../shared/formatters/app-battery-percentage.pipe';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { AppDurationPipe } from '../../../shared/formatters/app-duration.pipe';
import { AppPercentPipe } from '../../../shared/formatters/app-percent-pipe';
import { AppUnitPipe } from '../../../shared/formatters/app-unit.pipe';
import { AppUserNamePipe } from '../../../shared/formatters/app-user-name.pipe';
import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import ChangeNotification from '../../../types/ChangeNotification';
import { ChargerTableFilter } from '../../../shared/table/filters/charger-table-filter';
import { ChargingStationButtonAction } from 'app/types/ChargingStation';
import { ComponentService } from '../../../services/component.service';
import { ConsumptionChartDetailComponent } from '../../../shared/component/consumption-chart/consumption-chart-detail.component';
import { DataResult } from 'app/types/DataResult';
import { DialogService } from '../../../services/dialog.service';
import { Injectable } from '@angular/core';
import { IssuerFilter } from '../../../shared/table/filters/issuer-filter';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from '../../../services/message.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SiteAreaTableFilter } from '../../../shared/table/filters/site-area-table-filter';
import { SiteTableFilter } from 'app/shared/table/filters/site-table-filter';
import { SpinnerService } from 'app/services/spinner.service';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableChargingStationsStopTransactionAction } from 'app/shared/table/actions/table-charging-stations-stop-transaction-action';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { TableViewTransactionAction } from 'app/shared/table/actions/table-view-transaction-action';
import TenantComponents from 'app/types/TenantComponents';
import { TransactionsConnectorCellComponent } from '../cell-components/transactions-connector-cell.component';
import { TransactionsInactivityCellComponent } from '../cell-components/transactions-inactivity-cell.component';
import { TranslateService } from '@ngx-translate/core';
import { User } from 'app/types/User';
import { UserTableFilter } from '../../../shared/table/filters/user-table-filter';
import { Utils } from '../../../utils/Utils';

@Injectable()
export class TransactionsInProgressTableDataSource extends TableDataSource<Transaction> {
  private viewAction = new TableViewTransactionAction().getActionDef();
  private stopAction = new TableChargingStationsStopTransactionAction().getActionDef();
  private isAdmin = false;
  private isSiteAdmin = false;

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
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
    super(spinnerService, translateService);
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

  public rowActionTriggered(actionDef: TableActionDef, transaction: Transaction) {
    switch (actionDef.id) {
      case ChargingStationButtonAction.STOP_TRANSACTION:
        if (actionDef.action) {
          actionDef.action(transaction, this.authorizationService,
            this.dialogService, this.translateService, this.messageService, this.centralServerService, this.spinnerService,
            this.router, this.refreshData.bind(this));
        }
        break;
      case TransactionButtonAction.VIEW_TRANSACTION:
        if (actionDef.action) {
          actionDef.action(transaction, this.dialog, this.refreshData.bind(this));
        }
        break;
    }
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    const filters: TableFilterDef[] = [];
    // Show Site Area Filter If Organization component is active
    if (this.componentService.isActive(TenantComponents.ORGANIZATION)) {
      filters.push(new IssuerFilter().getFilterDef()),
      filters.push(new SiteTableFilter().getFilterDef());
      filters.push(new SiteAreaTableFilter().getFilterDef());
    }
    filters.push(new ChargerTableFilter().getFilterDef());
    if (this.authorizationService.isAdmin() || this.authorizationService.hasSitesAdminRights()) {
      filters.push(new UserTableFilter(this.authorizationService.getSitesAdmin()).getFilterDef());
    }
    return filters;
  }

  public buildTableDynamicRowActions(): TableActionDef[] {
    const actions = [
      this.viewAction,
    ];
    if (!this.authorizationService.isDemo()) {
      actions.push(this.stopAction);
    }
    return actions;
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(true).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }
}
