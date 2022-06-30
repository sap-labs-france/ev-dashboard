import { EventEmitter, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { SpinnerService } from 'services/spinner.service';
import { TableCreateAction } from 'shared/table/actions/table-create-action';
import { TableOpenURLAction } from 'shared/table/actions/table-open-url-action';
import { TableRefreshAction } from 'shared/table/actions/table-refresh-action';
import { TableDataSource } from 'shared/table/table-data-source';
import { BillingAccount } from 'types/Billing';
import { DataResult } from 'types/DataResult';
import { ButtonAction } from 'types/GlobalType';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'types/Table';

import { SubAccountStatusFormatterComponent } from './formatters/subaccounts-status-formatter.component';
import { SettingsBillingSubaccountDialogComponent } from './settings-billing-subaccounts-dialog.component';

@Injectable()
export class BillingsSubAccountTableDataSource extends TableDataSource<BillingAccount> {
  public changed = new EventEmitter<boolean>();
  private subaccounts!: BillingAccount[];
  private onboardAction = new TableOpenURLAction().getActionDef();
  private createAction = new TableCreateAction().getActionDef();

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
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

  public buildTableRowActions(): TableActionDef[] {
    return [
      this.onboardAction,
    ];
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
      case ButtonAction.OPEN_URL:
        this.onboardSubaccount(subaccount);
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

  public onboardSubaccount(subaccount: BillingAccount){
    // Execute onboarding for subaccount
  }
}
