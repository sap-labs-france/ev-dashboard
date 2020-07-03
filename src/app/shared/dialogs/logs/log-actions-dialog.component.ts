import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { KeyValue } from 'app/types/GlobalType';
import { LogAction } from 'app/types/Log';

import { DialogTableDataComponent } from '../dialog-table-data.component';
import { LogActionsDialogTableDataSource } from './log-actions-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
})
export class LogActionsDialogComponent extends DialogTableDataComponent<LogAction> {
  constructor(
    protected dialogRef: MatDialogRef<LogActionsDialogComponent>,
    private logActionsDialogTableDataSource: LogActionsDialogTableDataSource,
    @Inject(MAT_DIALOG_DATA) data: any) {
    super(data, dialogRef, logActionsDialogTableDataSource);
    // Default title
    if (this.title === '') {
      this.title = 'logs.select_actions';
    }
    this.logActionsDialogTableDataSource.destroyDatasource();
  }

  public getSelectedItems(selectedRows: LogAction[]): KeyValue[] {
    const items: KeyValue[] = [];
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach((row) => {
        items.push({
          key: row.id.toString(),
          value: `${row.action}`, objectRef: row
        });
      });
    }
    return items;
  }
}
