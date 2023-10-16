import { EventEmitter, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { CentralServerService } from 'services/central-server.service';
import { ComponentService } from 'services/component.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import {
  TableOnboardAccountAction,
  TableOnboardAccountActionDef,
} from 'shared/table/actions/settings/billing/table-onboard-account';
import { TableCreateAction } from 'shared/table/actions/table-create-action';
import { TableRefreshAction } from 'shared/table/actions/table-refresh-action';
import { TableDataSource } from 'shared/table/table-data-source';
import { BillingAccount, BillingAccountStatus, BillingButtonAction } from 'types/Billing';
import { DataResult } from 'types/DataResult';
import { ButtonAction } from 'types/GlobalType';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'types/Table';
import { Utils } from 'utils/Utils';

import { AccountDialogComponent } from './account/account-dialog.component';
import { AccountStatusFormatterComponent } from './formatters/account-status-formatter.component';

@Injectable()
export class BillingAccountsTableDataSource extends TableDataSource<BillingAccount> {
  public changed = new EventEmitter<boolean>();
  private accounts!: BillingAccount[];
  private createAction = new TableCreateAction().getActionDef();

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private messageService: MessageService,
    private dialog: MatDialog
  ) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public setAccounts(accounts: BillingAccount[]) {
    this.accounts = accounts ? accounts : [];
  }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: false,
      },
      design: {
        flat: true,
      },
      footer: {
        enabled: false,
      },
      hasDynamicRowAction: true,
      rowFieldNameIdentifier: 'businessOwner.email',
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'status',
        name: 'accounts.list.account_status',
        isAngularComponent: true,
        angularComponent: AccountStatusFormatterComponent,
        headerClass: 'col-20p text-center',
        class: 'col-20p',
        sortable: true,
      },
      {
        id: 'companyName',
        name: 'accounts.list.company_name',
        headerClass: 'col-25p',
        class: 'col-25p',
        sortable: true,
        sorted: true,
      },
      {
        id: 'businessOwner.name',
        name: 'accounts.list.business_owner',
        headerClass: 'col-25p',
        class: 'col-25p',
        direction: 'asc',
        formatter: (name: string, account: BillingAccount) =>
          Utils.buildUserFullName(account.businessOwner),
        sortable: true,
      },
      {
        id: 'businessOwner.email',
        name: 'users.email',
        headerClass: 'col-25p',
        class: 'col-25p',
        sortable: true,
      },
      {
        id: 'accountExternalID',
        name: 'accounts.list.account_id',
        headerClass: 'col-25p',
        class: 'col-25p',
        sortable: true,
      },
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    return [this.createAction];
  }

  public buildTableDynamicRowActions(row?: BillingAccount): TableActionDef[] {
    const rowActions: TableActionDef[] = [];
    const onboardAction = new TableOnboardAccountAction().getActionDef();
    if (row.status === BillingAccountStatus.IDLE) {
      rowActions.push(onboardAction);
    }
    return rowActions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case ButtonAction.CREATE:
        this.createAccountDialog();
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, account: BillingAccount) {
    switch (actionDef.id) {
      case BillingButtonAction.ONBOARD_CONNECTED_ACCOUNT:
        this.onboardAccount(actionDef as TableOnboardAccountActionDef, account);
        break;
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [new TableRefreshAction().getActionDef()];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [];
  }

  public loadDataImpl(): Observable<DataResult<BillingAccount>> {
    return new Observable((observer) => {
      this.componentService.getBillingAccounts(this.getPaging(), this.getSorting()).subscribe({
        next: (accounts) => {
          this.createAction.visible = Utils.convertToBoolean(accounts.canCreate);
          this.accounts = accounts.result;
          observer.next({
            count: this.accounts.length,
            result: this.accounts,
          });
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        },
      });
    });
  }

  public createAccountDialog(account?: BillingAccount) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '50vw';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (account) {
      dialogConfig.data = account;
    }
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(AccountDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((status) => {
      if (status) {
        this.refreshData().subscribe();
        this.changed.emit(true);
      }
    });
  }

  private onboardAccount(onboardAction: TableOnboardAccountActionDef, account: BillingAccount) {
    this.spinnerService.show();
    onboardAction.action(account, this.centralServerService).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response) {
          this.messageService.showSuccessMessage('accounts.message.onboard_success');
          this.refreshData().subscribe();
          this.changed.emit(true);
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            'accounts.message.onboard_error'
          );
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        Utils.handleError(
          JSON.stringify(error),
          this.messageService,
          'accounts.message.onboard_error'
        );
      },
    });
  }
}
