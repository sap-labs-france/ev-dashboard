import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChargingStation } from 'app/types/ChargingStation';
import { KeyValue } from 'app/types/GlobalType';

import { DialogTableDataComponent } from '../dialog-table-data.component';
import { ChargersDialogTableDataSource } from './chargers-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
})
export class ChargersDialogComponent extends DialogTableDataComponent<ChargingStation> {
  constructor(
    private chargersDataSource: ChargersDialogTableDataSource,
    dialogRef: MatDialogRef<ChargersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {
    // Super class
    super(data, dialogRef, chargersDataSource);
    // Default title
    if (this.title === '') {
      this.title = 'chargers.select_chargers';
    }
    this.chargersDataSource.destroyDatasource();
    // listen to keystroke
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.dialogRef.close();
      }
    });
  }

  public getSelectedItems(selectedRows: ChargingStation[]): KeyValue[] {
    const items = [];
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach((row) => {
        items.push({key: row.id, value: row.id, objectRef: row});
      });
    }
    return items;
  }
}
