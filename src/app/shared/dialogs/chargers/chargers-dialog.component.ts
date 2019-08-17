import { Component, Inject, Self } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Charger, KeyValue } from '../../../common.types';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { ChargersDialogTableDataSource } from './chargers-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
})
export class ChargersDialogComponent extends DialogTableDataComponent<Charger> {
  constructor(
    private chargersDataSource: ChargersDialogTableDataSource,
    dialogRef: MatDialogRef<ChargersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    // Super class
    super(data, dialogRef, chargersDataSource);
    // Default title
    if (this.title === '') {
      this.title = 'chargers.select_chargers';
    }
  }

  getSelectedItems(selectedRows: Charger[]): KeyValue[] {
    const items = [];
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach(row => {
        items.push({key: row.id, value: row.id, objectRef: row});
      });
    }
    return items;
  }
}
