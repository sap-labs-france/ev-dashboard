import {Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {ActionResponse, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, Transaction} from '../../../common.types';
import {CentralServerNotificationService} from '../../../services/central-server-notification.service';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {SpinnerService} from '../../../services/spinner.service';
import {Utils} from '../../../utils/Utils';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {UserTableFilter} from '../../../shared/table/filters/user-filter';
import {AppUnitPipe} from '../../../shared/formatters/app-unit.pipe';
import {PercentPipe} from '@angular/common';
import {Constants} from '../../../utils/Constants';
import {DialogService} from '../../../services/dialog.service';
import {TableStopAction} from '../../../shared/table/actions/table-stop-action';
import {AppDatePipe} from '../../../shared/formatters/app-date.pipe';
import {Injectable} from '@angular/core';
import {AppConnectorIdPipe} from '../../../shared/formatters/app-connector-id.pipe';
import {AppUserNamePipe} from '../../../shared/formatters/app-user-name.pipe';
import {AppDurationPipe} from '../../../shared/formatters/app-duration.pipe';
import {ConnectorCellComponent} from '../../../shared/component/connector/connector-cell.component';
import {LocaleService} from '../../../services/locale.service';
import {TableAutoRefreshAction} from '../../../shared/table/actions/table-auto-refresh-action';
import {TableRefreshAction} from '../../../shared/table/actions/table-refresh-action';
import {TableDataSource} from '../../../shared/table/table-data-source';
import {ConsumptionChartDetailComponent} from '../components/consumption-chart-detail.component';
import {SiteAreasTableFilter} from '../../../shared/table/filters/site-area-filter';
import * as moment from 'moment';
import {AuthorizationService} from '../../../services/authorization-service';
import {SessionDialogComponent} from '../../../shared/dialogs/session/session-dialog-component';
import {TableOpenAction} from '../../../shared/table/actions/table-open-action';
import {AppBatteryPercentagePipe} from '../../../shared/formatters/app-battery-percentage.pipe';
import {ChargerTableFilter} from '../../../shared/table/filters/charger-filter';
import {ComponentEnum, ComponentService} from '../../../services/component.service';


const POLL_INTERVAL = 10000;

@Injectable()
export class TransactionsInProgressDataSource extends TableDataSource<Transaction> {

  private dialogRefSession;

  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    private localeService: LocaleService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private authorizationService: AuthorizationService,
    private appDatePipe: AppDatePipe,
    private percentPipe: PercentPipe,
    private appUnitPipe: AppUnitPipe,
    private appBatteryPercentagePipe: AppBatteryPercentagePipe,
    private appConnectorIdPipe: AppConnectorIdPipe,
    private appUserNamePipe: AppUserNamePipe,
    private appDurationPipe: AppDurationPipe) {
    super();
    this.setPollingInterval(POLL_INTERVAL);
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectTransactions();
  }

  public loadData(refreshAction: boolean) {
    if (!refreshAction) {
      this.spinnerService.show();
    }
    this.centralServerService.getActiveTransactions(this.getFilterValues(), this.getPaging(), this.getOrdering())
      .subscribe((transactions) => {
        if (!refreshAction) {
          this.spinnerService.hide();
        }
        this.setNumberOfRecords(transactions.count);
        this.updatePaginator();
        this.setData(transactions.result);
      }, (error) => {
        this.spinnerService.hide();
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
      });
  }

  public getTableDef(): TableDef {
    return {
      search: {
        enabled: false
      },
      rowDetails: {
        enabled: true,
        isDetailComponent: true,
        detailComponentName: ConsumptionChartDetailComponent
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
        formatter: (value) => this.appDatePipe.transform(value, locale, 'datetime')
      },
      {
        id: 'currentTotalDurationSecs',
        name: 'transactions.duration',
        class: 'text-left',
        formatter: (currentTotalDurationSecs, row: Transaction) => this.appDurationPipe.transform(moment().diff(row.timestamp, 'seconds'))
      },
      {
        id: 'currentTotalInactivitySecs',
        name: 'transactions.inactivity',
        headerClass: 'd-none d-lg-table-cell',
        class: 'text-left d-none d-lg-table-cell',
        formatter: (currentTotalInactivitySecs, row) => {
          const percentage = row.currentTotalDurationSecs > 0 ? (currentTotalInactivitySecs / row.currentTotalDurationSecs) : 0;
          return this.appDurationPipe.transform(currentTotalInactivitySecs) +
            ` (${this.percentPipe.transform(percentage, '1.0-0')})`
        }
      },
      {
        id: 'chargeBoxID',
        name: 'transactions.charging_station',
        class: 'text-left'
      },
      {
        id: 'connectorId',
        name: 'transactions.connector',
        isAngularComponent: true,
        angularComponentName: ConnectorCellComponent,
      },
      {
        id: 'tagID',
        name: 'transactions.badge_id',
        headerClass: 'd-none d-xl-table-cell',
        class: 'text-left d-none d-xl-table-cell',
      },
      {
        id: 'currentConsumption',
        name: 'transactions.current_consumption',
        formatter: (currentConsumption) => this.appUnitPipe.transform(currentConsumption, 'W', 'kW')
      },
      {
        id: 'currentTotalConsumption',
        name: 'transactions.total_consumption',
        formatter: (currentTotalConsumption) => this.appUnitPipe.transform(currentTotalConsumption, 'Wh', 'kWh')
      },
      {
        id: 'currentStateOfCharge',
        name: 'transactions.state_of_charge',
        formatter: (currentStateOfCharge, row) => {
          if (!currentStateOfCharge) {
            return '';
          }
          return this.appBatteryPercentagePipe.transform(row.stateOfCharge, currentStateOfCharge);
        }
      }
    ];
    if (this.authorizationService.isAdmin()) {
      columns.splice(1, 0, {
        id: 'user',
        name: 'transactions.user',
        class: 'text-left',
        formatter: (value) => this.appUserNamePipe.transform(value)
      });
    }
    return columns as TableColumnDef[];
    ;
  }

  rowActionTriggered(actionDef: TableActionDef, transaction: Transaction) {
    switch (actionDef.id) {
      case 'stop':
        this.dialogService.createAndShowYesNoDialog(
          this.translateService.instant('transactions.dialog.soft_stop.title'),
          this.translateService.instant('transactions.dialog.soft_stop.confirm', {user: this.appUserNamePipe.transform(transaction.user)})
        ).subscribe((response) => {
          if (response === Constants.BUTTON_TYPE_YES) {
            this._stopTransaction(transaction);
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


  getTableFiltersDef(): TableFilterDef[] {
    const filters: TableFilterDef[] = [
      new ChargerTableFilter().getFilterDef()
    ];

    // Show Site Area Filter If Organization component is active
    if (this.componentService.isActive(ComponentEnum.ORGANIZATION)){
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

  getTableRowActions(): TableActionDef[] {
    const rowActions = [new TableOpenAction().getActionDef()];
    rowActions.push(new TableStopAction().getActionDef());
    return rowActions;
  }

  getTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(true).getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  protected _stationStopTransaction(transaction: Transaction) {
    this.centralServerService.stationStopTransaction(transaction.chargeBoxID, transaction.id).subscribe((response: ActionResponse) => {
      this.messageService.showSuccessMessage(
        // tslint:disable-next-line:max-line-length
        this.translateService.instant('transactions.notification.soft_stop.success', {user: this.appUserNamePipe.transform(transaction.user)}));
      this.loadData(false);
    }, (error) => {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'transactions.notification.soft_stop.error');
    });
  }

  protected _softStopTransaction(transaction: Transaction) {
    this.centralServerService.softStopTransaction(transaction.id).subscribe((response: ActionResponse) => {
      this.messageService.showSuccessMessage(
        // tslint:disable-next-line:max-line-length
        this.translateService.instant('transactions.notification.soft_stop.success', {user: this.appUserNamePipe.transform(transaction.user)}));
      this.loadData(false);
    }, (error) => {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'transactions.notification.soft_stop.error');
    });
  }

  private _stopTransaction(transaction: Transaction) {
    if (transaction.status === 'Available') {
      this._softStopTransaction(transaction);
    } else {
      this._stationStopTransaction(transaction);
    }
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
        // Open
        this.dialogRefSession = this.dialog.open(SessionDialogComponent, dialogConfig);
        this.dialogRefSession.afterClosed().subscribe(() => this.loadData(true));
  }
}
