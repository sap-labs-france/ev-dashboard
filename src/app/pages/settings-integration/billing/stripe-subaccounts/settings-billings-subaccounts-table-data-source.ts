import { EventEmitter, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { SpinnerService } from 'services/spinner.service';
import { TableCreateAction } from 'shared/table/actions/table-create-action';
import { TableEditAction } from 'shared/table/actions/table-edit-action';
import { TableOpenURLAction } from 'shared/table/actions/table-open-url-action';
import { TableRefreshAction } from 'shared/table/actions/table-refresh-action';
import { TableDataSource } from 'shared/table/table-data-source';
import { BillingAccount } from 'types/Billing';
import { DataResult } from 'types/DataResult';
import { ButtonAction } from 'types/GlobalType';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'types/Table';

import { SettingsBillingSubaccountDialogComponent } from './settings-billing-subaccounts-dialog.component';

@Injectable()
export class BillingsSubAccountTableDataSource extends TableDataSource<BillingAccount> {
  public changed = new EventEmitter<boolean>();
  private subaccounts!: BillingAccount[];
  private editAction = new TableEditAction().getActionDef();
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
      rowFieldNameIdentifier: 'name',
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'name',
        name: 'settings.billing.user.user',
        headerClass: 'col-25p',
        class: 'col-25p',
        sortable: false,
      },
      {
        id: 'status',
        name: 'settings.billing.user.subaccount_status',
        headerClass: 'col-25p',
        class: 'col-25p',
        sortable: false,
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
      this.editAction,
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
      case ButtonAction.EDIT:
        this.createSubaccountDialog(subaccount);
        break;
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
        this.subaccounts.sort((a, b) => (a.userID > b.userID) ? 1 : (b.userID > a.userID) ? -1 : 0);
        const accounts = [];
        for (let index = 0; index < this.subaccounts.length; index++) {
          const subaccount = this.subaccounts[index];
          subaccount.id = index.toString();
          accounts.push(subaccount);
        }
        observer.next({
          count: accounts.length,
          result: accounts,
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
    dialogRef.afterClosed().subscribe((result) => {
      // if (result) {
      //   // find object
      //   const index = this.subaccounts.findIndex((link) => link.id === result.id);
      //   if (index >= 0) {
      //     this.subaccounts.splice(index, 1, result);
      //   } else {
      //     this.subaccounts.push(result);
      //   }
      //   this.refreshData().subscribe();
      //   this.changed.emit(true);
      // }
      console.log(result);
    });
  }

  public onboardSubaccount(subaccount: BillingAccount){
    // Execute onboarding for subaccount
  }
}
