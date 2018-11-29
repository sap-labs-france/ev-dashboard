import {from, Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {TableDataSource} from '../../shared/table/table-data-source';
import {ActionResponse, SubjectInfo, TableActionDef, TableDef, Transaction} from '../../common.types';
import {CentralServerNotificationService} from '../../services/central-server-notification.service';
import {TableAutoRefreshAction} from '../../shared/table/actions/table-auto-refresh-action';
import {TableRefreshAction} from '../../shared/table/actions/table-refresh-action';
import {CentralServerService} from '../../services/central-server.service';
import {MessageService} from '../../services/message.service';
import {SpinnerService} from '../../services/spinner.service';
import {Utils} from '../../utils/Utils';
import {MatDialog} from '@angular/material';
import {AppUnitPipe} from '../../shared/formatters/app-unit.pipe';
import {PercentPipe} from '@angular/common';
import {Constants} from '../../utils/Constants';
import {DialogService} from '../../services/dialog.service';
import {AppUserNamePipe} from '../../shared/formatters/app-user-name.pipe';
import {AppDurationPipe} from '../../shared/formatters/app-duration.pipe';
import {AppDatePipe} from '../../shared/formatters/app-date.pipe';
import {map, zipAll} from 'rxjs/operators';
import {AppConnectorIdPipe} from '../../shared/formatters/app-connector-id.pipe';
import {TableDeleteAction} from '../../shared/table/actions/table-delete-action';


export abstract class TransactionsBaseDataSource extends TableDataSource<Transaction> {
  protected readonly tableActionsRow: TableActionDef[];

  constructor(
    protected messageService: MessageService,
    protected translateService: TranslateService,
    protected spinnerService: SpinnerService,
    protected dialogService: DialogService,
    protected router: Router,
    protected dialog: MatDialog,
    protected centralServerNotificationService: CentralServerNotificationService,
    protected centralServerService: CentralServerService,
    protected appDatePipe: AppDatePipe,
    protected percentPipe: PercentPipe,
    protected appUnitPipe: AppUnitPipe,
    protected appConnectorIdPipe: AppConnectorIdPipe,
    protected appUserNamePipe: AppUserNamePipe,
    protected appDurationPipe: AppDurationPipe) {
    super();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectTransactions();
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

  getTableActionsDef(): TableActionDef[] {
    return [
      new TableDeleteAction().getActionDef()
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
      default:
        super.actionTriggered(actionDef);
    }
  }

  getTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  protected _deleteTransactions(transactionIds: number[]) {
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
