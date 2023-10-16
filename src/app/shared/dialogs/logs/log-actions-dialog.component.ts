import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { KeyValue } from '../../../types/GlobalType';
import { LogAction } from '../../../types/Log';
import { Utils } from '../../../utils/Utils';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { LogActionsDialogTableDataSource } from './log-actions-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
  styleUrls: ['../dialog-table-data-xs.component.scss'],
})
export class LogActionsDialogComponent extends DialogTableDataComponent<LogAction> {
  public constructor(
    protected dialogRef: MatDialogRef<LogActionsDialogComponent>,
    private logActionsDialogTableDataSource: LogActionsDialogTableDataSource,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    super(data, dialogRef, logActionsDialogTableDataSource);
    // Default title
    if (Utils.isEmptyString(this.title)) {
      this.title = 'logs.select_actions';
    }
    this.logActionsDialogTableDataSource.destroyDataSource();
  }

  public getSelectedItems(selectedRows: LogAction[]): KeyValue[] {
    const items: KeyValue[] = [];
    if (!Utils.isEmptyArray(selectedRows)) {
      selectedRows.forEach((row) => {
        items.push({
          key: row.id.toString(),
          value: `${row.action}`,
          objectRef: row,
        });
      });
    }
    return items;
  }
}
