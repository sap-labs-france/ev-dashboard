import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ChargersDataSource} from './chargers-data-source-table';
import {DialogTableDataComponent} from '../dialog-table-data.component';
import {Charger, KeyValue} from '../../../common.types';

@Component({
  templateUrl: '../dialog-table-data-component.html'
})
export class ChargersDialogComponent extends DialogTableDataComponent<Charger> {
  constructor(
    private chargersDataSource: ChargersDataSource,
    dialogRef: MatDialogRef<ChargersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    // Super class
    super(data, dialogRef, chargersDataSource);
    // Default title
    if (this.title === '') {
      this.title = 'chargers.select_chargers';
    }
    // Set static filter
    if (data && data.hasOwnProperty('withNoSiteArea')) {
      this.dialogDataSource.setStaticFilters([
        { 'WithNoSiteArea': data.withNoSiteArea }
      ]);
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
