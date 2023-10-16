import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { KeyValue } from '../../../types/GlobalType';
import { RefundReport } from '../../../types/Refund';
import { Utils } from '../../../utils/Utils';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { ReportsDialogTableDataSource } from './reports-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
  styleUrls: ['../dialog-table-data.component.scss'],
})
export class ReportsDialogComponent extends DialogTableDataComponent<RefundReport> {
  public constructor(
    protected dialogRef: MatDialogRef<ReportsDialogComponent>,
    private transactionsListTableDataSource: ReportsDialogTableDataSource,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    super(data, dialogRef, transactionsListTableDataSource);
    // Default title
    if (Utils.isEmptyString(this.title)) {
      this.title = 'transactions.select_report';
    }
    this.transactionsListTableDataSource.destroyDataSource();
  }

  public getSelectedItems(selectedRows: RefundReport[]): KeyValue[] {
    const items: KeyValue[] = [];
    if (!Utils.isEmptyArray(selectedRows)) {
      selectedRows.forEach((row) => {
        items.push({ key: row.id, value: `${row.id}`, objectRef: row });
      });
    }
    return items;
  }
}
