import { EventEmitter, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { CentralServerService } from 'services/central-server.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { TableOnboardSubAccountAction, TableOnboardSubAccountActionDef } from 'shared/table/actions/settings/billing/table-onboard-subaccount';
import { TableCreateAction } from 'shared/table/actions/table-create-action';
import { TableRefreshAction } from 'shared/table/actions/table-refresh-action';
import { TableDataSource } from 'shared/table/table-data-source';
import { BillingAccount, BillingButtonAction } from 'types/Billing';
import { DataResult } from 'types/DataResult';
import { ButtonAction } from 'types/GlobalType';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'types/Table';

import { SubAccountStatusFormatterComponent } from './formatters/subaccounts-status-formatter.component';
import { SettingsBillingSubaccountDialogComponent } from './settings-billing-subaccounts-dialog.component';

@Injectable()
export class BillingsSubAccountTableDataSource extends TableDataSource<BillingAccount> {
  public changed = new EventEmitter<boolean>();
  private subaccounts!: BillingAccount[];
  private createAction = new TableCreateAction().getActionDef();

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private dialog: MatDialog) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public setSubAccounts(subaccounts: BillingAccount[]) {
    this.subaccounts = subaccounts ? subaccounts : [];
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
      rowFieldNameIdentifier: 'businessOwnerID',
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'businessOwnerID',
        name: 'settings.billing.stripe_subaccount.user',
        headerClass: 'col-25p',
        class: 'col-25p',
        sortable: true,
      },
      {
        id: 'status',
        name: 'settings.billing.stripe_subaccount.status',
        isAngularComponent: true,
        angularComponent: SubAccountStatusFormatterComponent,
        headerClass: 'col-25p text-center',
        class: 'col-25p',
        sortable: true,
      }
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    return [
      this.createAction,
    ];
  }

  public buildTableDynamicRowActions(row?: BillingAccount): TableActionDef[] {
    const rowActions: TableActionDef[] = [];
    const onboardAction = new TableOnboardSubAccountAction().getActionDef();
    rowActions.push(onboardAction);
    return rowActions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case ButtonAction.CREATE:
        this.createSubaccountDialog();
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, subaccount: BillingAccount) {
    switch (actionDef.id) {
      case BillingButtonAction.ONBOARD_SUBACCOUNT:
        (actionDef as TableOnboardSubAccountActionDef).action(subaccount.id,
          this.centralServerService,
          this.spinnerService,
          this.messageService
        );
        break;
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [];
  }

  public loadDataImpl(): Observable<DataResult<BillingAccount>> {
    return new Observable((observer) => {
      this.createAction.visible = true;
      if (this.subaccounts) {
        this.subaccounts.sort((a, b) => (a.businessOwnerID > b.businessOwnerID) ? 1 : (b.businessOwnerID > a.businessOwnerID) ? -1 : 0);
        observer.next({
          count: this.subaccounts.length,
          result: this.subaccounts,
        });
      } else {
        observer.next({
          count: 0,
          result: [],
        });
      }
      observer.complete();
    });
  }

  public createSubaccountDialog(subaccount?: BillingAccount) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '50vw';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (subaccount) {
      dialogConfig.data = subaccount;
    }
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(SettingsBillingSubaccountDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((status) => {
      if (status) {
        this.refreshData().subscribe();
        this.changed.emit(true);
      }
    });
  }
}
