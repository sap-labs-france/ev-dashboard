import {Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {ActionResponse, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, Transaction} from '../../../common.types';
import {CentralServerNotificationService} from '../../../services/central-server-notification.service';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {SpinnerService} from '../../../services/spinner.service';
import {Utils} from '../../../utils/Utils';
import {MatDialog} from '@angular/material';
import {UserTableFilter} from '../../../shared/table/filters/user-filter';
import {TransactionsChargerFilter} from '../filters/transactions-charger-filter';
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
import {ConnectorCellComponent} from '../../../shared/component/connector-cell.component';
import {LocaleService} from '../../../services/locale.service';
import {TableAutoRefreshAction} from '../../../shared/table/actions/table-auto-refresh-action';
import {TableRefreshAction} from '../../../shared/table/actions/table-refresh-action';
import {TableDataSource} from '../../../shared/table/table-data-source';
import {ConsumptionChartDetailComponent} from '../components/consumption-chart-detail.component';

const POLL_INTERVAL = 10000;
@Injectable()
export class TransactionsInProgressDataSource extends TableDataSource<Transaction> {

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
    private appDatePipe: AppDatePipe,
    private percentPipe: PercentPipe,
    private appUnitPipe: AppUnitPipe,
    private appConnectorIdPipe: AppConnectorIdPipe,
    private appUserNamePipe: AppUserNamePipe,
    private appDurationPipe: AppDurationPipe) {
    super()
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
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
          this.translateService.instant('general.error_backend'));
      });
  }

  public getTableDef(): TableDef {
    return {
      class: 'table-list-under-tabs',
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

  public getTableColumnDefs(): TableColumnDef[] {
    const locale = this.localeService.getCurrentFullLocaleForJS();

    return [
      {
        id: 'timestamp',
        name: 'transactions.started_at',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sorted: true,
        sortable: true,
        direction: 'desc',
        formatter: (value) => this.appDatePipe.transform(value, locale, 'datetime')
      },
      {
        id: 'user',
        name: 'transactions.user',
        headerClass: 'col-20p',
        class: 'text-left col-20p',
        formatter: (value) => this.appUserNamePipe.transform(value)
      },
      {
        id: 'currentTotalDurationSecs',
        name: 'transactions.duration',
        headerClass: 'col-10p',
        class: 'text-left col-10p',
        formatter: (currentTotalDurationSecs) => this.appDurationPipe.transform(currentTotalDurationSecs)
      },
      {
        id: 'currentTotalInactivitySecs',
        name: 'transactions.inactivity',
        headerClass: 'col-10p',
        class: 'text-left col-10p',
        formatter: (currentTotalInactivitySecs, row) => {
          const percentage = row.currentTotalDurationSecs > 0 ? (currentTotalInactivitySecs / row.currentTotalDurationSecs) : 0;
          if (percentage === 0) {
            return '';
          }
          return this.appDurationPipe.transform(currentTotalInactivitySecs) +
            ` (${this.percentPipe.transform(percentage, '2.0-0')})`
        }
      },
      {
        id: 'chargeBoxID',
        name: 'transactions.charging_station',
        headerClass: 'col-10p',
        class: 'text-left col-10p'
      },
      {
        id: 'connectorId',
        name: 'transactions.connector',
        headerClass: 'text-center col-5p',
        class: 'text-center col-5p',
        isAngularComponent: true,
        angularComponentName: ConnectorCellComponent,
      },
      {
        id: 'tagID',
        name: 'transactions.badge_id',
        headerClass: 'col-10p',
        class: 'text-left col-10p'
      },
      {
        id: 'currentTotalConsumption',
        name: 'transactions.total_consumption',
        headerClass: 'col-10p',
        class: 'col-10p',
        formatter: (currentTotalConsumption) => this.appUnitPipe.transform(currentTotalConsumption, 'Wh', 'kWh')
      },
      {
        id: 'currentConsumption',
        name: 'transactions.current_consumption',
        headerClass: 'col-10p',
        class: 'col-10p',
        formatter: (currentConsumption) => currentConsumption > 0 ? this.appUnitPipe.transform(currentConsumption, 'W', 'kW') : ''
      },
      {
        id: 'currentStateOfCharge',
        name: 'transactions.state_of_charge',
        headerClass: 'col-10p',
        class: 'col-10p',
        formatter: (currentStateOfCharge, row) => {
          if (!currentStateOfCharge) {
            return '';
          }
          return `${this.percentPipe.transform(row.stateOfCharge / 100, '2.0-0')} > ` +
            `${this.percentPipe.transform(currentStateOfCharge / 100, '2.0-0')} ` +
            `(${this.percentPipe.transform((currentStateOfCharge - row.stateOfCharge) / 100, '2.0-0')})`;
        }
      }
    ];
  }

  rowActionTriggered(actionDef: TableActionDef, transaction: Transaction) {
    switch (actionDef.id) {
      case 'stop':
        this.dialogService.createAndShowYesNoDialog(
          this.dialog,
          this.translateService.instant('transactions.dialog.soft_stop.title'),
          this.translateService.instant('transactions.dialog.soft_stop.confirm', {user: this.appUserNamePipe.transform(transaction.user)})
        ).subscribe((response) => {
          if (response === Constants.BUTTON_TYPE_YES) {
            this._stopTransaction(transaction);
          }
        });
        break;
      default:
        super.rowActionTriggered(actionDef, transaction);
    }
  }


  getTableFiltersDef(): TableFilterDef[] {
    return [
      new TransactionsChargerFilter().getFilterDef(),
      new UserTableFilter().getFilterDef(),
    ];
  }

  getTableRowActions(): TableActionDef[] {
    return [new TableStopAction().getActionDef()];
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
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
        this.translateService.instant('transactions.notification.soft_stop.error'));
    });
  }

  protected _softStopTransaction(transaction: Transaction) {
    this.centralServerService.softStopTransaction(transaction.id).subscribe((response: ActionResponse) => {
      this.messageService.showSuccessMessage(
        // tslint:disable-next-line:max-line-length
        this.translateService.instant('transactions.notification.soft_stop.success', {user: this.appUserNamePipe.transform(transaction.user)}));
      this.loadData(false);
    }, (error) => {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
        this.translateService.instant('transactions.notification.soft_stop.error'));
    });
  }

  private _stopTransaction(transaction: Transaction) {
    if (transaction.status === 'Available') {
      this._softStopTransaction(transaction);
    } else {
      this._stationStopTransaction(transaction);
    }
  }

  definePollingIntervalStrategy() {
    this.setPollingInterval(POLL_INTERVAL);
  }

}
