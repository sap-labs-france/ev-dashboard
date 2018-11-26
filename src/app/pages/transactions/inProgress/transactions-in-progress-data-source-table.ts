import {from, Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {TableDataSource} from '../../../shared/table/table-data-source';
import {ActionResponse, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, Transaction} from '../../../common.types';
import {CentralServerNotificationService} from '../../../services/central-server-notification.service';
import {TableAutoRefreshAction} from '../../../shared/table/actions/table-auto-refresh-action';
import {TableRefreshAction} from '../../../shared/table/actions/table-refresh-action';
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
import {TableStopAction} from './actions/table-stop-action';
import {AppUserNamePipe} from '../../../shared/formatters/app-user-name.pipe';
import {AppDurationPipe} from '../../../shared/formatters/app-duration.pipe';
import {AppDatePipe} from '../../../shared/formatters/app-date.pipe';
import {Injectable} from '@angular/core';
import {TableDeleteAction} from '../../../shared/table/actions/table-delete-action';
import {map, zipAll} from 'rxjs/operators';

@Injectable()
export class TransactionsInProgressDataSource extends TableDataSource<Transaction> {
  private readonly tableActionsRow: TableActionDef[];

  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private appDatePipe: AppDatePipe,
    private percentPipe: PercentPipe,
    private appUnitPipe: AppUnitPipe) {
    super();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectTransactions();
  }

  public loadData() {
    this.spinnerService.show();
    this.centralServerService.getActiveTransactions(this.getFilterValues(), this.getPaging(), this.getOrdering())
      .subscribe((transactions) => {
        this.spinnerService.hide();
        this.setNumberOfRecords(transactions.count);
        this.updatePaginator();
        this.getDataSubjet().next(transactions.result);
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
      rowSelection: {
        enabled: true,
        multiple: true
      },
      search: {
        enabled: false
      }
    };
  }

  public getTableColumnDefs(): TableColumnDef[] {

    return [
      {
        id: 'timestamp',
        name: 'transactions.started_at',
        headerClass: 'col-350px',
        class: 'text-left col-350px',
        sorted: true,
        sortable: true,
        direction: 'desc',
        formatter: (value) => this.appDatePipe.transform(value, 'datetime')
      },
      {
        id: 'chargeBoxID',
        name: 'transactions.charging_station',
        headerClass: 'col-350px',
        class: 'text-left col-350px'
      },
      {
        id: 'connectorId',
        name: 'transactions.connector',
        headerClass: 'text-center col-350px',
        class: 'text-center col-350px'
      },

      {
        id: 'totalDurationSecs',
        name: 'transactions.duration',
        headerClass: 'col-350px',
        class: 'text-left col-350px',
        formatter: (totalDurationSecs) => {
          return new AppDurationPipe().transform(totalDurationSecs);
        }
      },
      {
        id: 'totalInactivitySecs',
        name: 'transactions.inactivity',
        headerClass: 'col-350px',
        class: 'text-left col-350px',
        formatter: (totalInactivitySecs, row) => {
          const percentage = row.totalDurationSecs > 0 ? (totalInactivitySecs / row.totalDurationSecs) : 0;
          if (percentage === 0) {
            return '';
          }
          return new AppDurationPipe().transform(totalInactivitySecs) +
            ` (${this.percentPipe.transform(percentage, '2.0-0')})`
        }
      },
      {
        id: 'user',
        name: 'transactions.user',
        headerClass: 'col-350px',
        class: 'text-left col-350px',
        formatter: (value) => new AppUserNamePipe().transform(value)
      },
      {
        id: 'tagID',
        name: 'transactions.badge_id',
        headerClass: 'col-350px',
        class: 'text-left col-350px'
      },
      {
        id: 'totalConsumption',
        name: 'transactions.total_consumption',
        headerClass: 'col-350px',
        class: 'text-right col-350px',
        formatter: (totalConsumption) => this.appUnitPipe.transform(totalConsumption, 'Wh', 'kWh')
      },
      {
        id: 'currentConsumption',
        name: 'transactions.current_consumption',
        headerClass: 'col-350px',
        class: 'text-right col-350px',
        formatter: (currentConsumption) => currentConsumption > 0 ? this.appUnitPipe.transform(currentConsumption, 'W', 'kW') : ''
      },
      {
        id: 'stateOfCharge',
        name: 'transactions.state_of_charge',
        headerClass: 'text-center col-350px',
        class: 'text-center col-350px',
        formatter: (stateOfCharge) => this.percentPipe.transform(stateOfCharge / 100, '2.0-0')
      }
    ];
  }

  getTableActionsDef(): TableActionDef[] {
    return [
      new TableRefreshAction().getActionDef(),
      new TableDeleteAction().getActionDef(),
      new TableStopAction().getActionDef()
    ];
  }

  getTableRowActions(): TableActionDef[] {
    return this.tableActionsRow;
  }

  actionTriggered(actionDef: TableActionDef) {
    switch (actionDef.id) {

      case 'delete':
        if (this.getSelectedRows().length === 0) {
          this.messageService.showErrorMessage(this.translateService.instant('general.select_at_least_one_record'));
        } else {
          this.dialogService.createAndShowYesNoDialog(
            this.dialog,
            this.translateService.instant('transactions.dialog.delete.title'),
            this.translateService.instant('transactions.dialog.delete.confirm', {count: this.getSelectedRows().length})
          ).subscribe((response) => {
            if (response === Constants.BUTTON_TYPE_YES) {
              this._deleteTransactions(this.getSelectedRows().map((row) => row.id));
            }
          });
        }
        break;
      case 'stop':
        if (this.getSelectedRows().length === 0) {
          this.messageService.showErrorMessage(this.translateService.instant('general.select_at_least_one_record'));
        } else {
          this.dialogService.createAndShowYesNoDialog(
            this.dialog,
            this.translateService.instant('transactions.dialog.dialog.soft_stop.title'),
            this.translateService.instant('transactions.dialog.dialog.soft_stop.confirm', {count: this.getSelectedRows().length})
          ).subscribe((response) => {
            if (response === Constants.BUTTON_TYPE_YES) {
              this._softStopTransactions(this.getSelectedRows().map((row) => row.id));
            }
          });
        }
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }

  getTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef()
    ];
  }

  getTableFiltersDef(): TableFilterDef[] {
    return [
      new TransactionsChargerFilter().getFilterDef(),
      new UserTableFilter().getFilterDef(),
    ];
  }

  private _softStopTransactions(transactionIds: number[]) {
    from(transactionIds).pipe(
      map(transactionId => this.centralServerService.softStopTransaction(transactionId)),
      zipAll())
      .subscribe((responses: ActionResponse[]) => {
        const successCount = responses.filter(response => response.status === Constants.REST_RESPONSE_SUCCESS).length;
        this.messageService.showSuccessMessage(
          this.translateService.instant('transactions.notification.soft_stop.success', {count: successCount}));
        this.clearSelectedRows();
        this.loadData();
      }, (error) => {
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
          this.translateService.instant('transactions.notification.soft_stop.error'));
      });
  }

  private _deleteTransactions(transactionIds: number[]) {
    from(transactionIds).pipe(
      map(transactionId => this.centralServerService.deleteTransaction(transactionId)),
      zipAll())
      .subscribe((responses: ActionResponse[]) => {
        const successCount = responses.filter(response => response.status === Constants.REST_RESPONSE_SUCCESS).length;
        this.messageService.showSuccessMessage(
          this.translateService.instant('transactions.notification.delete.success', {count: successCount}));
        this.clearSelectedRows();
        this.loadData();
      }, (error) => {
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
          this.translateService.instant('transactions.notification.delete.error'));
      });
  }
}
