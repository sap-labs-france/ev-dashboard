import {from, Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {ActionResponse, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef} from '../../../common.types';
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
import {TableStopAction} from './actions/table-stop-action';
import {AppDatePipe} from '../../../shared/formatters/app-date.pipe';
import {Injectable} from '@angular/core';
import {map, zipAll} from 'rxjs/operators';
import {AppConnectorIdPipe} from '../../../shared/formatters/app-connector-id.pipe';
import {TransactionsBaseDataSource} from '../transactions-base-data-source-table';
import {AppUserNamePipe} from '../../../shared/formatters/app-user-name.pipe';
import {AppDurationPipe} from '../../../shared/formatters/app-duration.pipe';

@Injectable()
export class TransactionsInProgressDataSource extends TransactionsBaseDataSource {
  constructor(
    messageService: MessageService,
    translateService: TranslateService,
    spinnerService: SpinnerService,
    dialogService: DialogService,
    router: Router,
    dialog: MatDialog,
    centralServerNotificationService: CentralServerNotificationService,
    centralServerService: CentralServerService,
    appDatePipe: AppDatePipe,
    percentPipe: PercentPipe,
    appUnitPipe: AppUnitPipe,
    appConnectorIdPipe: AppConnectorIdPipe,
    appUserNamePipe: AppUserNamePipe,
    appDurationPipe: AppDurationPipe) {
    super(messageService, translateService, spinnerService, dialogService, router, dialog, centralServerNotificationService,
      centralServerService, appDatePipe, percentPipe, appUnitPipe, appConnectorIdPipe, appUserNamePipe, appDurationPipe);
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
      ...super.getTableColumnDefs(),
      {
        id: 'currentConsumption',
        name: 'transactions.current_consumption',
        headerClass: 'text-right col-10p',
        class: 'text-right col-10p',
        formatter: (currentConsumption) => currentConsumption > 0 ? this.appUnitPipe.transform(currentConsumption, 'W', 'kW') : ''
      },
      {
        id: 'stateOfCharge',
        name: 'transactions.state_of_charge',
        headerClass: 'text-right col-10p',
        class: 'text-right col-10p',
        formatter: (stateOfCharge) => this.percentPipe.transform(stateOfCharge / 100, '2.0-0')
      }
    ];
  }

  getTableActionsDef(): TableActionDef[] {
    return [...super.getTableActionsDef(),
      new TableStopAction().getActionDef()
    ];
  }

  actionTriggered(actionDef: TableActionDef) {
    switch (actionDef.id) {
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

}
