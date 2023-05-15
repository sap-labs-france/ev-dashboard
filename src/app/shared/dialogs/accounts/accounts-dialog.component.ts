import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BillingAccount } from 'types/Billing';

import { KeyValue } from '../../../types/GlobalType';
import { Utils } from '../../../utils/Utils';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { AccountsDialogTableDataSource } from './accounts-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
  styleUrls: ['../dialog-table-data.component.scss'],
})
export class AccountsDialogComponent extends DialogTableDataComponent<BillingAccount> {
  public constructor(
    protected dialogRef: MatDialogRef<AccountsDialogComponent>,
    private accountsListTableDataSource: AccountsDialogTableDataSource,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    super(data, dialogRef, accountsListTableDataSource);
    // Default title
    if (Utils.isEmptyString(this.title)) {
      this.title = 'accounts.list.select_account';
    }
    this.accountsListTableDataSource.destroyDataSource();
  }

  public getSelectedItems(selectedRows: BillingAccount[]): KeyValue[] {
    const items: KeyValue[] = [];
    if (!Utils.isEmptyArray(selectedRows)) {
      selectedRows.forEach((row) => {
        items.push({
          key: row.id,
          value: Utils.buildUserFullName(row.businessOwner),
          objectRef: row,
        });
      });
    }
    return items;
  }
}
